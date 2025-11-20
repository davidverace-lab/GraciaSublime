# Migración de Base de Datos - Supabase

Este archivo contiene todas las migraciones SQL necesarias para que la aplicación funcione correctamente.

## 1. Agregar columnas a la tabla `orders`

```sql
-- Agregar columna payment_method si no existe
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('paypal', 'transferencia'));

-- Agregar columna payment_proof_url si no existe
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;

-- Actualizar pedidos existentes con método de pago por defecto
UPDATE orders
SET payment_method = 'paypal'
WHERE payment_method IS NULL;
```

## 2. Crear bucket de almacenamiento para comprobantes de pago

En el panel de Supabase, ve a Storage y crea un nuevo bucket:
- Nombre: `payment-proofs`
- Public: ✅ Sí (para que los admins puedan ver las imágenes)

O ejecuta esto en SQL:

```sql
-- Crear bucket para comprobantes de pago
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Permitir que usuarios autenticados suban archivos
CREATE POLICY "Users can upload payment proofs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payment-proofs');

-- Permitir que todos lean los comprobantes (para admins)
CREATE POLICY "Anyone can view payment proofs"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'payment-proofs');
```

## 3. Actualizar políticas RLS para order_items

```sql
-- Permitir insertar customization y variant_id en order_items
-- (Asegúrate de que estas columnas existan)
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS customization JSONB;

ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS variant_id INTEGER REFERENCES product_variants(variant_id);
```

## 4. Actualizar tabla de cart_items para soportar personalización

```sql
-- Agregar columna customization si no existe
ALTER TABLE cart_items
ADD COLUMN IF NOT EXISTS customization JSONB;
```

## 5. Verificar estados de pedidos

Asegúrate de que tu tabla `orders` acepta estos estados:

```sql
-- Modificar constraint de status si existe
ALTER TABLE orders
DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders
ADD CONSTRAINT orders_status_check
CHECK (status IN ('pendiente', 'pago_pendiente', 'procesando', 'en_transito', 'completado', 'cancelado'));
```

## 6. Índices para mejorar rendimiento

```sql
-- Índice para búsquedas por usuario
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Índice para filtros por estado
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Índice para ordenar por fecha
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date DESC);
```

## Verificación

Después de ejecutar todas las migraciones, verifica que:

1. ✅ La tabla `orders` tiene las columnas `payment_method` y `payment_proof_url`
2. ✅ Existe el bucket `payment-proofs` en Storage
3. ✅ La tabla `order_items` tiene las columnas `customization` y `variant_id`
4. ✅ La tabla `cart_items` tiene la columna `customization`
5. ✅ Los estados de pedidos incluyen `pago_pendiente`

## Notas Importantes

- **IMPORTANTE**: Ejecuta estas migraciones en orden
- Haz un backup de tu base de datos antes de ejecutar las migraciones
- Algunas migraciones usan `IF NOT EXISTS` para evitar errores si ya existen
- Los índices son opcionales pero recomendados para mejor rendimiento
