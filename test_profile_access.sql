-- ============================================================================
-- SCRIPT DE PRUEBA: Verificar acceso a perfiles
-- ============================================================================
-- Ejecuta este script mientras estés AUTENTICADO en Supabase
-- Te dirá exactamente qué está bloqueando el acceso

-- ============================================================================
-- INFORMACIÓN DEL USUARIO ACTUAL
-- ============================================================================

-- Tu ID de usuario actual
SELECT auth.uid() as "Mi User ID";

-- Tu email
SELECT email, id
FROM auth.users
WHERE id = auth.uid();

-- ============================================================================
-- PRUEBA DE ACCESO A PERFILES
-- ============================================================================

-- Intenta leer tu propio perfil (puede fallar si RLS bloquea)
SELECT
    id,
    email,
    name,
    phone,
    role,
    is_admin,
    created_at
FROM profiles
WHERE id = auth.uid();

-- Si lo anterior falla, esto te dirá si el perfil existe
SELECT
    COUNT(*) as "Total perfiles en la base de datos",
    COUNT(CASE WHEN id = auth.uid() THEN 1 END) as "Tu perfil existe?"
FROM profiles;

-- ============================================================================
-- ESTADO DE RLS
-- ============================================================================

-- Ver si RLS está habilitado
SELECT
    tablename,
    rowsecurity as "RLS Habilitado"
FROM pg_tables
WHERE tablename = 'profiles';

-- Ver todas las políticas de SELECT para profiles
SELECT
    policyname as "Nombre de Política",
    cmd as "Comando",
    roles as "Roles",
    qual as "Condición USING"
FROM pg_policies
WHERE tablename = 'profiles'
AND cmd = 'SELECT'
ORDER BY policyname;

-- ============================================================================
-- VERIFICAR TABLA ADMIN_USERS
-- ============================================================================

-- Ver si existe la tabla admin_users
SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'admin_users'
) as "Existe admin_users?";

-- Si existe, ver si eres admin
SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
) as "Soy admin?";

-- Ver todos los admins (solo si eres admin)
SELECT
    au.user_id,
    u.email,
    au.notes
FROM admin_users au
LEFT JOIN auth.users u ON au.user_id = u.id;

-- ============================================================================
-- DIAGNÓSTICO COMPLETO
-- ============================================================================

-- Esta consulta te dice exactamente qué está pasando
DO $$
DECLARE
    rls_enabled BOOLEAN;
    policy_count INTEGER;
    profile_exists BOOLEAN;
    user_id UUID;
BEGIN
    -- Obtener el ID del usuario actual
    SELECT auth.uid() INTO user_id;

    -- Verificar si RLS está habilitado
    SELECT rowsecurity INTO rls_enabled
    FROM pg_tables
    WHERE tablename = 'profiles';

    -- Contar políticas de SELECT
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'profiles' AND cmd = 'SELECT';

    -- Verificar si existe el perfil (sin RLS)
    -- Nota: Esta consulta puede fallar si RLS está habilitado

    RAISE NOTICE '═══════════════════════════════════════';
    RAISE NOTICE 'DIAGNÓSTICO DE ACCESO A PERFILES';
    RAISE NOTICE '═══════════════════════════════════════';
    RAISE NOTICE 'Tu User ID: %', user_id;
    RAISE NOTICE 'RLS habilitado en profiles: %', rls_enabled;
    RAISE NOTICE 'Número de políticas SELECT: %', policy_count;
    RAISE NOTICE '═══════════════════════════════════════';

    IF rls_enabled AND policy_count = 0 THEN
        RAISE NOTICE '❌ PROBLEMA: RLS está habilitado pero no hay políticas';
        RAISE NOTICE '💡 SOLUCIÓN: Ejecuta quick_fix_profile_access.sql';
    ELSIF NOT rls_enabled THEN
        RAISE NOTICE '⚠️  RLS está DESHABILITADO (todos pueden ver todo)';
    ELSIF policy_count > 0 THEN
        RAISE NOTICE '✅ RLS configurado con % política(s)', policy_count;
        RAISE NOTICE '💡 Si aún fallas, verifica las condiciones de las políticas';
    END IF;

    RAISE NOTICE '═══════════════════════════════════════';
END $$;
