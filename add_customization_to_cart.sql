-- ============================================================================
-- AGREGAR PERSONALIZACIÓN AL CARRITO
-- ============================================================================
-- Este script agrega columnas para guardar la personalización en cart_items
--
-- INSTRUCCIONES:
-- 1. Ve a tu panel de Supabase
-- 2. Ve a SQL Editor
-- 3. Copia y pega este script completo
-- 4. Ejecuta el script
-- ============================================================================

-- Agregar columnas para personalización en cart_items
ALTER TABLE cart_items
ADD COLUMN IF NOT EXISTS custom_image TEXT,
ADD COLUMN IF NOT EXISTS custom_design JSONB,
ADD COLUMN IF NOT EXISTS design_name TEXT;

-- Crear índice para búsquedas más rápidas
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);

-- Verificar las columnas agregadas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'cart_items'
ORDER BY ordinal_position;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Columnas de personalización agregadas exitosamente';
    RAISE NOTICE '   - custom_image: Para guardar la URL de la imagen personalizada';
    RAISE NOTICE '   - custom_design: Para guardar el diseño prediseñado seleccionado';
    RAISE NOTICE '   - design_name: Para guardar el nombre del diseño';
END $$;
