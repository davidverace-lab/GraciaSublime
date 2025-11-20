-- ============================================================================
-- SCRIPT DE DIAGNÓSTICO Y SOLUCIÓN RÁPIDA PARA EL ERROR 406
-- ============================================================================
-- Este script te ayudará a diagnosticar y resolver el error de perfiles

-- PASO 1: Ver el estado actual de RLS en la tabla profiles
SELECT
    schemaname,
    tablename,
    rowsecurity as "RLS Habilitado"
FROM pg_tables
WHERE tablename = 'profiles';

-- PASO 2: Ver todas las políticas actuales de profiles
SELECT
    tablename,
    policyname,
    cmd as "Comando",
    permissive,
    roles,
    qual as "Condición USING",
    with_check as "Condición WITH CHECK"
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- PASO 3: Verificar si existe la tabla admin_users
SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'admin_users'
) as "Existe tabla admin_users";

-- PASO 4: Ver la estructura de la tabla profiles
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- ============================================================================
-- SOLUCIÓN RÁPIDA: Agregar política básica para permitir lectura de perfiles
-- ============================================================================

-- Eliminar política conflictiva si existe
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Crear política simple que permite a usuarios ver su propio perfil
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- ============================================================================
-- VERIFICACIÓN: Intenta leer tu propio perfil
-- ============================================================================
-- Ejecuta esta consulta mientras estás autenticado en Supabase
-- Deberías ver tu propio perfil si las políticas están correctas

SELECT * FROM profiles WHERE id = auth.uid();

-- ============================================================================
-- INFORMACIÓN ADICIONAL
-- ============================================================================

-- Ver todos los usuarios registrados (solo para admins)
SELECT
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- Ver todos los perfiles (puede fallar si RLS está habilitado)
-- SELECT * FROM profiles ORDER BY created_at DESC LIMIT 10;
