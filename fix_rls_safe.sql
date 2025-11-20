-- ============================================================================
-- SCRIPT SEGURO PARA ARREGLAR RLS (maneja políticas existentes)
-- ============================================================================
-- Este script verifica y crea solo lo que no existe

-- ============================================================================
-- PASO 1: Verificar estado actual
-- ============================================================================

-- Ver RLS habilitado en profiles
SELECT
    tablename,
    rowsecurity as "RLS Habilitado"
FROM pg_tables
WHERE tablename IN ('profiles', 'admin_users');

-- Ver políticas existentes
SELECT
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE tablename IN ('profiles', 'admin_users')
ORDER BY tablename, policyname;

-- ============================================================================
-- PASO 2: Crear tabla admin_users si no existe
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    notes TEXT
);

-- Crear índice si no existe
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);

-- Habilitar RLS en admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PASO 3: Crear políticas SOLO si no existen
-- ============================================================================

-- Política para admin_users: ver
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'admin_users'
        AND policyname = 'Only admins can view admin_users'
    ) THEN
        CREATE POLICY "Only admins can view admin_users"
        ON admin_users FOR SELECT
        USING (
            user_id IN (SELECT user_id FROM admin_users WHERE user_id = auth.uid())
        );
    END IF;
END $$;

-- Política para admin_users: insertar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'admin_users'
        AND policyname = 'Admins can insert new admins'
    ) THEN
        CREATE POLICY "Admins can insert new admins"
        ON admin_users FOR INSERT
        WITH CHECK (
            EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
        );
    END IF;
END $$;

-- Política para admin_users: eliminar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'admin_users'
        AND policyname = 'Admins can delete admins'
    ) THEN
        CREATE POLICY "Admins can delete admins"
        ON admin_users FOR DELETE
        USING (
            EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
        );
    END IF;
END $$;

-- ============================================================================
-- PASO 4: Habilitar RLS en profiles y crear políticas
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política: usuarios ven su propio perfil
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'profiles'
        AND policyname = 'Users can view own profile'
    ) THEN
        CREATE POLICY "Users can view own profile"
        ON profiles FOR SELECT
        USING (auth.uid() = id);
    END IF;
END $$;

-- Política: admins ven todos los perfiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'profiles'
        AND policyname = 'Admins can view all profiles'
    ) THEN
        CREATE POLICY "Admins can view all profiles"
        ON profiles FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM admin_users
                WHERE admin_users.user_id = auth.uid()
            )
        );
    END IF;
END $$;

-- Política: usuarios actualizan su propio perfil
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'profiles'
        AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile"
        ON profiles FOR UPDATE
        USING (auth.uid() = id)
        WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Política: admins actualizan cualquier perfil
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'profiles'
        AND policyname = 'Admins can update all profiles'
    ) THEN
        CREATE POLICY "Admins can update all profiles"
        ON profiles FOR UPDATE
        USING (
            EXISTS (
                SELECT 1 FROM admin_users
                WHERE admin_users.user_id = auth.uid()
            )
        );
    END IF;
END $$;

-- Política: usuarios insertan su propio perfil al registrarse
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'profiles'
        AND policyname = 'Users can insert own profile'
    ) THEN
        CREATE POLICY "Users can insert own profile"
        ON profiles FOR INSERT
        WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Política: admins eliminan perfiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'profiles'
        AND policyname = 'Admins can delete profiles'
    ) THEN
        CREATE POLICY "Admins can delete profiles"
        ON profiles FOR DELETE
        USING (
            EXISTS (
                SELECT 1 FROM admin_users
                WHERE admin_users.user_id = auth.uid()
            )
        );
    END IF;
END $$;

-- ============================================================================
-- PASO 5: AGREGAR TU USUARIO COMO ADMINISTRADOR
-- ============================================================================
-- IMPORTANTE: Reemplaza 'davidverace22@gmail.com' con tu email si es diferente

INSERT INTO admin_users (user_id, notes)
SELECT id, 'Administrador principal'
FROM auth.users
WHERE email = 'davidverace22@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- PASO 6: Crear funciones útiles si no existen
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
-- PASO 7: VERIFICACIÓN FINAL
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

-- Ver todas las políticas de profiles
SELECT
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Ver todas las políticas de admin_users
SELECT
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE tablename = 'admin_users'
ORDER BY policyname;

-- Verificar si eres admin (ejecutar como usuario autenticado)
SELECT is_current_user_admin() as "Soy admin?";

-- ============================================================================
-- MENSAJE FINAL
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Script ejecutado exitosamente!';
    RAISE NOTICE '📋 Revisa los resultados de las consultas de verificación arriba';
    RAISE NOTICE '⚠️  Si no apareces como admin, verifica el email en el script';
END $$;
