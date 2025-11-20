-- ============================================================================
-- SOLUCIÓN RÁPIDA: Permitir acceso a perfiles
-- ============================================================================
-- Este script es la solución MÁS SIMPLE para el error 406
-- Solo asegura que los usuarios puedan leer sus propios perfiles

-- ============================================================================
-- OPCIÓN 1: Verificar qué está bloqueando el acceso
-- ============================================================================

-- Ver si RLS está habilitado
SELECT
    schemaname,
    tablename,
    rowsecurity as "RLS Habilitado"
FROM pg_tables
WHERE tablename = 'profiles';

-- Ver qué políticas existen
SELECT
    policyname,
    cmd as "Tipo",
    qual as "Condición"
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- ============================================================================
-- OPCIÓN 2: Asegurar que existe la política básica de lectura
-- ============================================================================

-- Primero, eliminar la política si existe (para recrearla)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Crear política que permite ver tu propio perfil
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- ============================================================================
-- OPCIÓN 3: Si lo anterior no funciona, DESHABILITAR RLS temporalmente
-- ============================================================================
-- ⚠️ ADVERTENCIA: Esto permitirá que TODOS lean TODOS los perfiles
-- Solo usa esto para probar si RLS es el problema

-- Descomentar la siguiente línea para deshabilitar RLS temporalmente:
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Para volver a habilitarlo después:
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Ver el estado final de las políticas
SELECT
    policyname,
    cmd,
    permissive
FROM pg_policies
WHERE tablename = 'profiles';

-- Mensaje final
DO $$
BEGIN
    RAISE NOTICE '✅ Política básica creada/actualizada';
    RAISE NOTICE '🔄 Ahora intenta hacer login de nuevo en tu app';
    RAISE NOTICE '📱 Si aún falla, ejecuta el diagnóstico para más detalles';
END $$;
