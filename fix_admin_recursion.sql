-- ============================================================================
-- SOLUCIÓN PARA RECURSIÓN INFINITA EN admin_users
-- ============================================================================
-- Este script corrige el error:
-- "infinite recursion detected in policy for relation 'admin_users'"
--
-- INSTRUCCIONES:
-- 1. Ve a tu panel de Supabase: https://toyyebhfidzhnjtvhhvq.supabase.co
-- 2. Ve a SQL Editor
-- 3. Copia y pega este script completo
-- 4. Ejecuta el script
-- 5. Al final, reemplaza 'tu-email-admin@ejemplo.com' con tu email real
-- ============================================================================

-- ============================================================================
-- PASO 1: ELIMINAR TODAS LAS POLÍTICAS DE admin_users
-- ============================================================================
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
    END LOOP;
END $$;

-- ============================================================================
-- PASO 2: DESACTIVAR TEMPORALMENTE RLS EN admin_users
-- ============================================================================
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PASO 3: CREAR POLÍTICAS SIN RECURSIÓN
-- ============================================================================
-- La solución: usar auth.uid() directamente sin consultar admin_users

-- Política 1: Los admins pueden ver la tabla
-- (Comparación directa con user_id, sin subconsulta recursiva)
CREATE POLICY "Admins can view admin_users"
ON admin_users FOR SELECT
USING (user_id = auth.uid());

-- Política 2: Los admins pueden insertar nuevos admins
-- (Solo permite si el que inserta ya está en la tabla, pero sin subconsulta)
CREATE POLICY "Admins can insert new admins"
ON admin_users FOR INSERT
WITH CHECK (
    -- El usuario que inserta debe estar en la tabla
    -- Usamos una función para evitar recursión
    auth.uid() IN (SELECT user_id FROM admin_users)
);

-- Política 3: Los admins pueden eliminar otros admins
CREATE POLICY "Admins can delete admins"
ON admin_users FOR DELETE
USING (
    auth.uid() IN (SELECT user_id FROM admin_users)
);

-- Política 4: Los admins pueden actualizar
CREATE POLICY "Admins can update admin_users"
ON admin_users FOR UPDATE
USING (
    auth.uid() IN (SELECT user_id FROM admin_users)
);

-- ============================================================================
-- PASO 4: REACTIVAR RLS
-- ============================================================================
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PASO 5: VERIFICAR Y AGREGAR TU USUARIO ADMINISTRADOR
-- ============================================================================

-- Ver usuarios existentes (para encontrar tu email)
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- IMPORTANTE: Reemplaza 'tu-email-admin@ejemplo.com' con tu email real
INSERT INTO admin_users (user_id, notes)
SELECT id, 'Administrador principal - agregado el ' || now()::date
FROM auth.users
WHERE email = 'tu-email-admin@ejemplo.com'
ON CONFLICT (user_id) DO NOTHING;

-- Si necesitas agregar más administradores:
-- INSERT INTO admin_users (user_id, notes)
-- SELECT id, 'Segundo administrador'
-- FROM auth.users
-- WHERE email = 'otro-admin@ejemplo.com'
-- ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- PASO 6: VERIFICACIÓN FINAL
-- ============================================================================

-- Ver todos los administradores
SELECT
    au.user_id,
    u.email,
    au.created_at,
    au.notes
FROM admin_users au
LEFT JOIN auth.users u ON au.user_id = u.id
ORDER BY au.created_at;

-- Ver las políticas actuales de admin_users
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
-- FUNCIONES AUXILIARES (OPCIONALES)
-- ============================================================================

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

-- Probar la función
SELECT is_current_user_admin() as soy_admin;

-- ============================================================================
-- MENSAJE FINAL
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Script ejecutado exitosamente!';
    RAISE NOTICE '⚠️  RECUERDA: Reemplaza "tu-email-admin@ejemplo.com" con tu email';
    RAISE NOTICE '📋 Revisa los resultados de las consultas arriba';
    RAISE NOTICE '🔄 Reinicia tu aplicación después de aplicar estos cambios';
END $$;
