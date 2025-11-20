-- ============================================================================
-- SCRIPT PARA CONFIGURAR RLS DE PRODUCTOS Y USUARIOS
-- ============================================================================
-- Este script configura las políticas RLS para que:
-- 1. Usuarios autenticados solo vean productos CON INVENTARIO disponible
-- 2. Administradores puedan ver y gestionar TODOS los productos (con o sin inventario)
-- 3. Usuarios autenticados puedan ver perfiles
-- 4. Administradores tengan acceso completo
--
-- INSTRUCCIONES:
-- 1. Ve a tu panel de Supabase
-- 2. Ve a SQL Editor
-- 3. Copia y pega este script completo
-- 4. Ejecuta el script
-- ============================================================================

-- ============================================================================
-- PASO 1: ASEGURAR QUE EXISTA LA TABLA admin_users
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);

-- ============================================================================
-- PASO 2: ELIMINAR POLÍTICAS EXISTENTES
-- ============================================================================

-- Eliminar políticas de products
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'products'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON products', pol.policyname);
        RAISE NOTICE 'Eliminada política de products: %', pol.policyname;
    END LOOP;
END $$;

-- Eliminar políticas de product_variants
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'product_variants'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON product_variants', pol.policyname);
        RAISE NOTICE 'Eliminada política de product_variants: %', pol.policyname;
    END LOOP;
END $$;

-- Eliminar políticas de categories
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'categories'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON categories', pol.policyname);
        RAISE NOTICE 'Eliminada política de categories: %', pol.policyname;
    END LOOP;
END $$;

-- Eliminar políticas de profiles
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

-- Eliminar políticas de admin_users
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
-- PASO 3: HABILITAR RLS EN TODAS LAS TABLAS
-- ============================================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PASO 4: POLÍTICAS PARA LA TABLA products
-- ============================================================================

-- LECTURA: Usuarios autenticados solo ven productos CON INVENTARIO disponible
-- Verifica que el producto esté activo Y tenga variantes con stock > 0
CREATE POLICY "Users can view products with inventory"
ON products FOR SELECT
TO authenticated
USING (
    (is_active = true OR is_active IS NULL)
    AND (
        -- Si existe la tabla product_variants, verificar stock ahí
        EXISTS (
            SELECT 1 FROM product_variants pv
            WHERE pv.product_id = products.product_id
            AND pv.stock > 0
            AND (pv.is_available = true OR pv.is_available IS NULL)
        )
        -- O si el producto tiene stock directo mayor a 0
        OR (stock > 0)
    )
);

-- LECTURA: Administradores ven TODOS los productos (con o sin inventario)
CREATE POLICY "Admins can view all products"
ON products FOR SELECT
TO authenticated
USING (check_is_admin());

-- LECTURA: Usuarios anónimos solo ven productos disponibles con inventario
CREATE POLICY "Anonymous users can view available products with inventory"
ON products FOR SELECT
TO anon
USING (
    (is_active = true OR is_active IS NULL)
    AND (
        -- Si existe la tabla product_variants, verificar stock ahí
        EXISTS (
            SELECT 1 FROM product_variants pv
            WHERE pv.product_id = products.product_id
            AND pv.stock > 0
            AND (pv.is_available = true OR pv.is_available IS NULL)
        )
        -- O si el producto tiene stock directo mayor a 0
        OR (stock > 0)
    )
);

-- Crear función auxiliar para verificar admin (evita recursión)
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    is_admin_user BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE user_id = auth.uid()
    ) INTO is_admin_user;
    RETURN COALESCE(is_admin_user, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- INSERCIÓN: Solo administradores pueden crear productos
CREATE POLICY "Admins can insert products"
ON products FOR INSERT
TO authenticated
WITH CHECK (check_is_admin());

-- ACTUALIZACIÓN: Solo administradores pueden actualizar productos
CREATE POLICY "Admins can update products"
ON products FOR UPDATE
TO authenticated
USING (check_is_admin())
WITH CHECK (check_is_admin());

-- ELIMINACIÓN: Solo administradores pueden eliminar productos
CREATE POLICY "Admins can delete products"
ON products FOR DELETE
TO authenticated
USING (check_is_admin());

-- ============================================================================
-- PASO 5: POLÍTICAS PARA LA TABLA product_variants
-- ============================================================================

-- LECTURA: Usuarios autenticados solo ven variantes CON STOCK disponible
CREATE POLICY "Users can view variants with stock"
ON product_variants FOR SELECT
TO authenticated
USING (
    (is_available = true OR is_available IS NULL)
    AND stock > 0
);

-- LECTURA: Administradores ven TODAS las variantes (con o sin stock)
CREATE POLICY "Admins can view all variants"
ON product_variants FOR SELECT
TO authenticated
USING (check_is_admin());

-- LECTURA: Usuarios anónimos solo ven variantes disponibles con stock
CREATE POLICY "Anonymous users can view available variants with stock"
ON product_variants FOR SELECT
TO anon
USING (
    (is_available = true OR is_available IS NULL)
    AND stock > 0
);

-- INSERCIÓN: Solo administradores pueden crear variantes
CREATE POLICY "Admins can insert variants"
ON product_variants FOR INSERT
TO authenticated
WITH CHECK (check_is_admin());

-- ACTUALIZACIÓN: Solo administradores pueden actualizar variantes (incluyendo stock)
CREATE POLICY "Admins can update variants"
ON product_variants FOR UPDATE
TO authenticated
USING (check_is_admin())
WITH CHECK (check_is_admin());

-- ELIMINACIÓN: Solo administradores pueden eliminar variantes
CREATE POLICY "Admins can delete variants"
ON product_variants FOR DELETE
TO authenticated
USING (check_is_admin());

-- ============================================================================
-- PASO 6: POLÍTICAS PARA LA TABLA categories
-- ============================================================================

-- LECTURA: Todos pueden ver todas las categorías (incluso usuarios no autenticados)
CREATE POLICY "Everyone can view categories"
ON categories FOR SELECT
USING (true);

-- INSERCIÓN: Solo administradores pueden crear categorías
CREATE POLICY "Admins can insert categories"
ON categories FOR INSERT
TO authenticated
WITH CHECK (check_is_admin());

-- ACTUALIZACIÓN: Solo administradores pueden actualizar categorías
CREATE POLICY "Admins can update categories"
ON categories FOR UPDATE
TO authenticated
USING (check_is_admin());

-- ELIMINACIÓN: Solo administradores pueden eliminar categorías
CREATE POLICY "Admins can delete categories"
ON categories FOR DELETE
TO authenticated
USING (check_is_admin());

-- ============================================================================
-- PASO 7: POLÍTICAS PARA LA TABLA profiles
-- ============================================================================

-- LECTURA: Usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- LECTURA: Administradores pueden ver todos los perfiles
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (check_is_admin());

-- INSERCIÓN: Usuarios pueden crear su propio perfil
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

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
USING (check_is_admin());

-- ELIMINACIÓN: Administradores pueden eliminar perfiles
CREATE POLICY "Admins can delete profiles"
ON profiles FOR DELETE
TO authenticated
USING (check_is_admin());

-- ============================================================================
-- PASO 8: POLÍTICAS PARA LA TABLA admin_users
-- ============================================================================

-- LECTURA: Solo administradores pueden ver la tabla de admins
CREATE POLICY "Admins can view admin_users"
ON admin_users FOR SELECT
TO authenticated
USING (check_is_admin());

-- INSERCIÓN: Solo administradores pueden agregar nuevos admins
CREATE POLICY "Admins can insert new admins"
ON admin_users FOR INSERT
TO authenticated
WITH CHECK (check_is_admin());

-- ACTUALIZACIÓN: Solo administradores pueden actualizar admins
CREATE POLICY "Admins can update admins"
ON admin_users FOR UPDATE
TO authenticated
USING (check_is_admin());

-- ELIMINACIÓN: Solo administradores pueden eliminar admins
CREATE POLICY "Admins can delete admins"
ON admin_users FOR DELETE
TO authenticated
USING (check_is_admin());

-- ============================================================================
-- PASO 9: AGREGAR ADMINISTRADOR INICIAL
-- ============================================================================

-- Agrega el usuario davidverace22@gmail.com como administrador
INSERT INTO admin_users (user_id, notes)
SELECT id, 'Administrador principal - Configurado automáticamente'
FROM auth.users
WHERE email = 'davidverace22@gmail.com'
ON CONFLICT (user_id) DO UPDATE
SET notes = 'Administrador principal - Configurado automáticamente',
    created_at = admin_users.created_at;

-- ============================================================================
-- PASO 10: CREAR FUNCIONES ÚTILES
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
-- PASO 11: VERIFICACIÓN FINAL
-- ============================================================================

-- Ver el estado de RLS en todas las tablas
SELECT
    tablename,
    rowsecurity as "RLS Habilitado"
FROM pg_tables
WHERE tablename IN ('products', 'product_variants', 'categories', 'profiles', 'admin_users')
ORDER BY tablename;

-- Ver todas las políticas de products
SELECT
    policyname as "Política",
    cmd as "Operación",
    roles as "Roles"
FROM pg_policies
WHERE tablename = 'products'
ORDER BY cmd, policyname;

-- Ver todas las políticas de product_variants
SELECT
    policyname as "Política",
    cmd as "Operación",
    roles as "Roles"
FROM pg_policies
WHERE tablename = 'product_variants'
ORDER BY cmd, policyname;

-- Ver todas las políticas de categories
SELECT
    policyname as "Política",
    cmd as "Operación",
    roles as "Roles"
FROM pg_policies
WHERE tablename = 'categories'
ORDER BY cmd, policyname;

-- Ver todas las políticas de profiles
SELECT
    policyname as "Política",
    cmd as "Operación",
    roles as "Roles"
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- Ver administradores actuales
SELECT
    au.user_id,
    u.email,
    au.created_at,
    au.notes
FROM admin_users au
LEFT JOIN auth.users u ON au.user_id = u.id
ORDER BY au.created_at;

-- ============================================================================
-- MENSAJE FINAL
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ ========================================';
    RAISE NOTICE '✅ POLÍTICAS RLS CONFIGURADAS EXITOSAMENTE';
    RAISE NOTICE '✅ ========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📋 RESUMEN DE CONFIGURACIÓN:';
    RAISE NOTICE '';
    RAISE NOTICE '🔹 PRODUCTOS (products):';
    RAISE NOTICE '   ✓ Usuarios autenticados solo ven productos activos CON INVENTARIO (stock > 0)';
    RAISE NOTICE '   ✓ Administradores ven TODOS los productos (con o sin stock)';
    RAISE NOTICE '   ✓ Solo administradores pueden crear/editar/eliminar';
    RAISE NOTICE '   ✓ Se verifica stock en product_variants O en el campo stock directo';
    RAISE NOTICE '';
    RAISE NOTICE '🔹 VARIANTES DE PRODUCTOS (product_variants):';
    RAISE NOTICE '   ✓ Usuarios autenticados solo ven variantes CON STOCK (stock > 0)';
    RAISE NOTICE '   ✓ Administradores ven TODAS las variantes';
    RAISE NOTICE '   ✓ Solo administradores pueden crear/editar/eliminar (y controlar stock)';
    RAISE NOTICE '';
    RAISE NOTICE '🔹 CATEGORÍAS (categories):';
    RAISE NOTICE '   ✓ Todos pueden VER todas las categorías';
    RAISE NOTICE '   ✓ Solo administradores pueden crear/editar/eliminar';
    RAISE NOTICE '';
    RAISE NOTICE '🔹 PERFILES (profiles):';
    RAISE NOTICE '   ✓ Usuarios pueden VER y EDITAR su propio perfil';
    RAISE NOTICE '   ✓ Administradores pueden VER y EDITAR todos los perfiles';
    RAISE NOTICE '';
    RAISE NOTICE '🔹 ADMINISTRADORES (admin_users):';
    RAISE NOTICE '   ✓ Solo administradores tienen acceso a esta tabla';
    RAISE NOTICE '';
    RAISE NOTICE '👤 Usuario davidverace22@gmail.com configurado como administrador';
    RAISE NOTICE '';
    RAISE NOTICE '💡 CONTROL DE INVENTARIO:';
    RAISE NOTICE '   - Los administradores controlan el stock desde su vista';
    RAISE NOTICE '   - Cuando el stock llega a 0, el producto desaparece para usuarios normales';
    RAISE NOTICE '   - Los administradores siempre ven todos los productos';
    RAISE NOTICE '';
    RAISE NOTICE '📱 ¡Prueba ahora tu aplicación!';
    RAISE NOTICE '';
END $$;
