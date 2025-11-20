-- Script para verificar si tus tablas tienen los campos necesarios
-- Ejecuta esto en Supabase SQL Editor

-- 1. Ver estructura de tabla orders
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- 2. Verificar si existe stripe_payment_id
SELECT EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_name = 'orders' AND column_name = 'stripe_payment_id'
) AS tiene_stripe_payment_id;

-- 3. Ver estructura de tabla order_items
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'order_items'
ORDER BY ordinal_position;

-- 4. Ver estructura de tabla payments
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'payments'
ORDER BY ordinal_position;

-- 5. Ver estructura de tabla reviews
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'reviews'
ORDER BY ordinal_position;

-- 6. Verificar índices en orders
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'orders';
