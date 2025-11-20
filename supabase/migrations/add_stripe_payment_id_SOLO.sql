-- Script mínimo para agregar soporte de Stripe a tabla orders EXISTENTE
-- Ejecuta SOLO esto si ya tienes las tablas creadas

-- 1. Agregar columna stripe_payment_id a la tabla orders (si no existe)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS stripe_payment_id TEXT;

-- 2. Agregar índice para búsquedas más rápidas
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_id
ON orders(stripe_payment_id);

-- 3. Actualizar comentario
COMMENT ON COLUMN orders.stripe_payment_id IS 'ID del Payment Intent de Stripe';

-- Verificar que se agregó correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders' AND column_name = 'stripe_payment_id';
