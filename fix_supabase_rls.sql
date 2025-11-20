-- ============================================================================
-- SCRIPT PARA ARREGLAR RECURSIÓN INFINITA EN POLÍTICAS RLS DE SUPABASE
-- ============================================================================
--
-- Este script soluciona el error:
-- "infinite recursion detected in policy for relation 'profiles'"
--
-- SOLUCIÓN: Usar una tabla separada 'admin_users' para evitar recursión
--
-- INSTRUCCIONES:
-- 1. Ve a tu panel de Supabase: https://toyyebhfidzhnjtvhhvq.supabase.co
-- 2. Ve a SQL Editor
-- 3. Copia y pega este script completo
-- 4. Ejecuta el script
-- 5. IMPORTANTE: Al final del script, reemplaza 'tu-email-admin@ejemplo.com'
--    con tu email de administrador real
-- ============================================================================

-- ============================================================================
-- PASO 1: ELIMINAR todas las políticas existentes de la tabla profiles
-- ============================================================================
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
    END LOOP;
END $$;

-- ============================================================================
-- PASO 2: CREAR TABLA SEPARADA PARA ADMINISTRADORES
-- ============================================================================

-- Crear tabla admin_users (sin RLS para evitar recursión)
CREATE TABLE IF NOT EXISTS admin_users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    notes TEXT
);

-- Crear índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);

-- Habilitar RLS en admin_users (pero con políticas simples)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Política simple para admin_users: solo admins pueden ver la tabla
CREATE POLICY "Only admins can view admin_users"
ON admin_users FOR SELECT
USING (
    user_id IN (SELECT user_id FROM admin_users WHERE user_id = auth.uid())
);

-- Política para que admins puedan insertar nuevos admins
CREATE POLICY "Admins can insert new admins"
ON admin_users FOR INSERT
WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- Política para que admins puedan eliminar otros admins
CREATE POLICY "Admins can delete admins"
ON admin_users FOR DELETE
USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- ============================================================================
-- PASO 3: HABILITAR RLS EN PROFILES
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PASO 4: CREAR POLÍTICAS CORRECTAS PARA PROFILES (SIN RECURSIÓN)
-- ============================================================================

-- Política 1: Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Política 2: Los administradores pueden ver TODOS los perfiles
-- (Usando la tabla admin_users, NO hay recursión)
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.user_id = auth.uid()
    )
);

-- Política 3: Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Política 4: Los administradores pueden actualizar cualquier perfil
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.user_id = auth.uid()
    )
);

-- Política 5: Los usuarios pueden insertar su propio perfil al registrarse
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Política 6: Los administradores pueden eliminar perfiles
CREATE POLICY "Admins can delete profiles"
ON profiles FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.user_id = auth.uid()
    )
);

-- ============================================================================
-- PASO 5: AGREGAR TUS USUARIOS ADMINISTRADORES
-- ============================================================================

-- IMPORTANTE: Reemplaza 'tu-email-admin@ejemplo.com' con tu email real
-- Puedes agregar múltiples líneas para múltiples administradores

-- Opción A: Si conoces el email del administrador
INSERT INTO admin_users (user_id, notes)
SELECT id, 'Administrador principal'
FROM auth.users
WHERE email = 'tu-email-admin@ejemplo.com'
ON CONFLICT (user_id) DO NOTHING;

-- Opción B: Si conoces el UUID del usuario
-- Descomenta y reemplaza 'UUID-DEL-ADMIN' con el UUID real:
-- INSERT INTO admin_users (user_id, notes)
-- VALUES ('UUID-DEL-ADMIN', 'Administrador principal')
-- ON CONFLICT (user_id) DO NOTHING;

-- Para agregar más administradores, repite la inserción:
-- INSERT INTO admin_users (user_id, notes)
-- SELECT id, 'Segundo administrador'
-- FROM auth.users
-- WHERE email = 'otro-admin@ejemplo.com'
-- ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- PASO 6: VERIFICACIÓN
-- ============================================================================

-- Ver todos los administradores actuales
SELECT
    au.user_id,
    u.email,
    au.created_at,
    au.notes
FROM admin_users au
LEFT JOIN auth.users u ON au.user_id = u.id
ORDER BY au.created_at;

-- Ver todas las políticas de profiles
SELECT
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Ver todas las políticas de admin_users
SELECT
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'admin_users'
ORDER BY policyname;

-- ============================================================================
-- FUNCIONES ÚTILES PARA ADMINISTRACIÓN
-- ============================================================================

-- Función para verificar si un usuario es admin
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
    RETURN EXISTS (
        SELECT 1 FROM admin_users
        WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- NOTAS FINALES
-- ============================================================================

-- 1. La recursión está completamente eliminada porque las políticas de
--    'profiles' consultan la tabla 'admin_users', no 'profiles'.
--
-- 2. Para agregar un nuevo administrador en el futuro:
--    INSERT INTO admin_users (user_id)
--    SELECT id FROM auth.users WHERE email = 'nuevo-admin@ejemplo.com';
--
-- 3. Para remover un administrador:
--    DELETE FROM admin_users WHERE user_id = (
--        SELECT id FROM auth.users WHERE email = 'admin-a-remover@ejemplo.com'
--    );
--
-- 4. Para ver si eres admin (ejecutar como usuario autenticado):
--    SELECT is_current_user_admin();
--
-- ============================================================================

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Script ejecutado exitosamente!';
    RAISE NOTICE '⚠️  IMPORTANTE: No olvides reemplazar "tu-email-admin@ejemplo.com" con tu email real';
    RAISE NOTICE '📋 Revisa los resultados de las consultas de verificación arriba';
END $$;
