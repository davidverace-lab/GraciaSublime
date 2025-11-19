-- ============================================
-- GUÍA PASO A PASO PARA CONFIGURAR TALLAS
-- ============================================

-- PASO 1: Ver todas las categorías disponibles
SELECT * FROM categories;
-- Busca la categoría de "Camisas" o "Playeras" - anota su category_id

-- PASO 2: Ver productos de camisas (normalmente category_id = 3)
SELECT product_id, name, category_id, price
FROM products
WHERE category_id = 3;
-- Si no hay productos, créalos primero desde tu app

-- PASO 3: Ver si ya existen variantes para algún producto
SELECT
  pv.variant_id,
  p.name as producto,
  pv.size as talla,
  pv.gender as genero,
  pv.stock,
  pv.is_available as disponible
FROM product_variants pv
JOIN products p ON pv.product_id = p.product_id
ORDER BY p.name, pv.gender, pv.size;

-- PASO 4: Si no hay variantes, créalas para un producto específico
-- (Descomenta y reemplaza <PRODUCT_ID> con el ID real)

/*
-- Para producto ID 1 por ejemplo:
INSERT INTO product_variants (product_id, size, gender, stock, is_available) VALUES
  -- Tallas para HOMBRE
  (1, 'xs', 'male', 10, true),
  (1, 's', 'male', 15, true),
  (1, 'm', 'male', 20, true),
  (1, 'l', 'male', 20, true),
  (1, 'xl', 'male', 15, true),
  (1, 'xxl', 'male', 10, true),

  -- Tallas para MUJER
  (1, 'xs', 'female', 10, true),
  (1, 's', 'female', 15, true),
  (1, 'm', 'female', 20, true),
  (1, 'l', 'female', 20, true),
  (1, 'xl', 'female', 15, true),
  (1, 'xxl', 'female', 10, true);
*/

-- PASO 5: Verificar que se crearon correctamente
SELECT
  size as talla,
  gender as genero,
  stock,
  CASE
    WHEN gender = 'male' THEN 'Hombre'
    WHEN gender = 'female' THEN 'Mujer'
    ELSE 'Unisex'
  END as genero_español
FROM product_variants
WHERE product_id = 1  -- Cambia el 1 por tu product_id
ORDER BY gender, size;
