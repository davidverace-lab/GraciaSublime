-- Migración para agregar soporte de Stripe a la tabla orders
-- Ejecuta este SQL en el SQL Editor de Supabase

-- 1. Agregar columna stripe_payment_id a la tabla orders
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS stripe_payment_id TEXT;

-- 2. Agregar índice para búsquedas más rápidas por stripe_payment_id
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_id
ON orders(stripe_payment_id);

-- 3. Actualizar comentarios de la tabla
COMMENT ON COLUMN orders.stripe_payment_id IS 'ID del Payment Intent de Stripe';
COMMENT ON COLUMN orders.payment_method IS 'Método de pago: stripe, transferencia, etc.';
COMMENT ON COLUMN orders.status IS 'Estado del pedido: pending, paid, processing, shipped, completed, cancelled';

-- 4. Verificar que la tabla tenga todos los campos necesarios
-- (Solo para referencia, NO ejecutar si ya existen)
/*
CREATE TABLE IF NOT EXISTS orders (
  order_id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address_id BIGINT REFERENCES addresses(address_id) ON DELETE SET NULL,
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending',
  total_price DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'stripe',
  payment_proof_url TEXT,
  stripe_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
*/

-- 5. Crear trigger para updated_at (si no existe)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 6. Actualizar los estados existentes (opcional)
-- Convertir estados antiguos a los nuevos estándares si es necesario
/*
UPDATE orders
SET status = 'paid'
WHERE status = 'pendiente' AND payment_method = 'stripe';

UPDATE orders
SET status = 'pending'
WHERE status = 'pendiente' AND payment_method != 'stripe';
*/

-- 7. Crear tabla de reviews si no existe (para el sistema de reseñas)
CREATE TABLE IF NOT EXISTS reviews (
  review_id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id BIGINT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, order_id, product_id)
);

-- 8. Crear índices para reviews
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);

-- 9. Crear trigger para reviews updated_at
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;

CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 10. Agregar comentarios a reviews
COMMENT ON TABLE reviews IS 'Reseñas de productos por usuarios después de completar un pedido';
COMMENT ON COLUMN reviews.rating IS 'Calificación de 1 a 5 estrellas';
COMMENT ON COLUMN reviews.order_id IS 'Pedido del cual proviene esta reseña';

-- Fin de la migración
