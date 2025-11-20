-- ============================================================================
-- SCRIPT PARA ARREGLAR PROBLEMAS DE RLS Y PERFILES
-- ============================================================================
-- Este script soluciona:
-- 1. Recursión infinita en políticas de admin_users
-- 2. Perfiles que aparecen como "no especificado" al registrarse
-- 3. Prevención de correos duplicados (ya manejado por Supabase)
--
-- INSTRUCCIONES:
-- 1. Ve a tu panel de Supabase
-- 2. Ve a SQL Editor
-- 3. Copia y pega este script completo
-- 4. Ejecuta el script
-- ============================================================================

-- ============================================================================
-- PASO 1: ELIMINAR POLÍTICAS PROBLEMÁTICAS DE admin_users
-- ============================================================================

-- Eliminar TODAS las políticas de admin_users para empezar limpio
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'admin_users'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON admin_users', pol.policyname);
        RAISE NOTICE 'Eliminada política de admin_users: %', pol.policyname;
    END LOOP;
END $$;

-- ============================================================================
-- PASO 2: CREAR POLÍTICAS SIN RECURSIÓN PARA admin_users
-- ============================================================================

-- IMPORTANTE: No hacer consultas a admin_users dentro de las políticas de admin_users
-- En su lugar, usaremos una función SECURITY DEFINER que rompe la recursión

-- Crear función auxiliar para verificar admin (SECURITY DEFINER rompe la recursión)
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    is_admin_user BOOLEAN;
BEGIN
    -- Esta función se ejecuta con privilegios del dueño (SECURITY DEFINER)
    -- lo que evita las políticas RLS
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE user_id = auth.uid()
    ) INTO is_admin_user;

    RETURN COALESCE(is_admin_user, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ahora crear políticas usando la función auxiliar

-- LECTURA: Solo admins pueden ver la tabla de admins (sin recursión)
CREATE POLICY "Admins can view admin_users"
ON admin_users FOR SELECT
TO authenticated
USING (check_is_admin());

-- INSERCIÓN: Solo admins pueden agregar nuevos admins
CREATE POLICY "Admins can insert new admins"
ON admin_users FOR INSERT
TO authenticated
WITH CHECK (check_is_admin());

-- ACTUALIZACIÓN: Solo admins pueden actualizar admins
CREATE POLICY "Admins can update admins"
ON admin_users FOR UPDATE
TO authenticated
USING (check_is_admin())
WITH CHECK (check_is_admin());

-- ELIMINACIÓN: Solo admins pueden eliminar admins
CREATE POLICY "Admins can delete admins"
ON admin_users FOR DELETE
TO authenticated
USING (check_is_admin());

-- ============================================================================
-- PASO 3: ASEGURAR QUE EXISTA EL TRIGGER PARA CREAR PERFILES
-- ============================================================================

-- Eliminar trigger existente si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Crear función que se ejecuta cuando se crea un nuevo usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insertar perfil automáticamente con los datos del metadata
    INSERT INTO public.profiles (id, name, phone, email, created_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', 'Usuario'),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        NEW.email,
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger que ejecuta la función cuando se registra un usuario
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- PASO 4: ASEGURAR RESTRICCIÓN DE CORREOS ÚNICOS
-- ============================================================================

-- Verificar si existe la restricción de email único en profiles
DO $$
BEGIN
    -- Agregar índice único para email si no existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'profiles'
        AND indexname = 'profiles_email_unique'
    ) THEN
        CREATE UNIQUE INDEX profiles_email_unique ON profiles(email);
        RAISE NOTICE 'Creado índice único para email en profiles';
    ELSE
        RAISE NOTICE 'El índice único para email ya existe';
    END IF;
END $$;

-- ============================================================================
-- PASO 5: ACTUALIZAR POLÍTICAS DE PROFILES (si es necesario)
-- ============================================================================

-- Eliminar políticas existentes de profiles
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', pol.policyname);
        RAISE NOTICE 'Eliminada política de profiles: %', pol.policyname;
    END LOOP;
END $$;

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- LECTURA: Usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- LECTURA: Administradores pueden ver todos los perfiles (usando función sin recursión)
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (check_is_admin());

-- INSERCIÓN: Usuarios pueden crear su propio perfil (para el trigger)
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- INSERCIÓN: El trigger del sistema puede crear perfiles
CREATE POLICY "System can insert profiles"
ON profiles FOR INSERT
TO service_role
WITH CHECK (true);

-- ACTUALIZACIÓN: Usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ACTUALIZACIÓN: Administradores pueden actualizar cualquier perfil
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
TO authenticated
USING (check_is_admin())
WITH CHECK (check_is_admin());

-- ELIMINACIÓN: Administradores pueden eliminar perfiles
CREATE POLICY "Admins can delete profiles"
ON profiles FOR DELETE
TO authenticated
USING (check_is_admin());

-- ============================================================================
-- PASO 6: ACTUALIZAR FUNCIONES AUXILIARES
-- ============================================================================

-- Función para verificar si un usuario específico es admin
CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users
        WHERE user_id = check_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si el usuario actual es admin
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN check_is_admin();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PASO 7: ARREGLAR PERFILES EXISTENTES SIN NOMBRE/TELÉFONO
-- ============================================================================

-- Actualizar perfiles que tengan nombre o teléfono NULL
UPDATE profiles
SET
    name = COALESCE(name, 'Usuario'),
    phone = COALESCE(phone, '')
WHERE name IS NULL OR phone IS NULL;

-- ============================================================================
-- PASO 8: AGREGAR ADMINISTRADOR INICIAL
-- ============================================================================

-- Agrega el usuario davidverace22@gmail.com como administrador
INSERT INTO admin_users (user_id, notes)
SELECT id, 'Administrador principal - Configurado automáticamente'
FROM auth.users
WHERE email = 'davidverace22@gmail.com'
ON CONFLICT (user_id) DO UPDATE
SET notes = 'Administrador principal - Actualizado automáticamente';

-- ============================================================================
-- PASO 9: VERIFICACIÓN FINAL
-- ============================================================================

-- Ver el estado de RLS
SELECT
    tablename,
    rowsecurity as "RLS Habilitado"
FROM pg_tables
WHERE tablename IN ('profiles', 'admin_users')
ORDER BY tablename;

-- Ver políticas de profiles
SELECT
    policyname as "Política",
    cmd as "Operación",
    roles as "Roles"
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- Ver políticas de admin_users
SELECT
    policyname as "Política",
    cmd as "Operación",
    roles as "Roles"
FROM pg_policies
WHERE tablename = 'admin_users'
ORDER BY cmd, policyname;

-- Ver todos los perfiles
SELECT
    id,
    name,
    email,
    phone,
    created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- Ver administradores
SELECT
    au.user_id,
    u.email,
    au.notes,
    au.created_at
FROM admin_users au
LEFT JOIN auth.users u ON au.user_id = u.id
ORDER BY au.created_at;

-- ============================================================================
-- MENSAJE FINAL
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ ================================================';
    RAISE NOTICE '✅ POLÍTICAS RLS Y PERFILES ARREGLADOS';
    RAISE NOTICE '✅ ================================================';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 PROBLEMAS SOLUCIONADOS:';
    RAISE NOTICE '';
    RAISE NOTICE '1. ✓ Recursión infinita en admin_users eliminada';
    RAISE NOTICE '   - Creada función check_is_admin() con SECURITY DEFINER';
    RAISE NOTICE '   - Las políticas ahora usan esta función en lugar de consultar directamente';
    RAISE NOTICE '';
    RAISE NOTICE '2. ✓ Perfiles automáticos al registrarse';
    RAISE NOTICE '   - Creado trigger on_auth_user_created';
    RAISE NOTICE '   - El perfil se crea automáticamente con nombre y teléfono del registro';
    RAISE NOTICE '   - Perfiles existentes sin datos han sido actualizados';
    RAISE NOTICE '';
    RAISE NOTICE '3. ✓ Correos únicos garantizados';
    RAISE NOTICE '   - Índice único en profiles.email';
    RAISE NOTICE '   - Supabase previene duplicados automáticamente';
    RAISE NOTICE '';
    RAISE NOTICE '📱 PRÓXIMOS PASOS:';
    RAISE NOTICE '   1. Prueba registrar un nuevo usuario';
    RAISE NOTICE '   2. Verifica que el perfil se cree con nombre y teléfono';
    RAISE NOTICE '   3. Intenta registrar el mismo email dos veces (debe fallar)';
    RAISE NOTICE '   4. Como admin, actualiza perfiles sin errores de recursión';
    RAISE NOTICE '';
END $$;
