-- ============================================
-- PASO 2: VER TUS PRODUCTOS EXISTENTES
-- Ejecuta esto para ver qué productos tienes
-- ============================================

-- Ver todos los productos de playeras/camisas
SELECT
  product_id,
  name,
  category_id,
  price
FROM products
WHERE category_id = 3  -- 3 = Camisas/Playeras
ORDER BY product_id;

-- ANOTA LOS product_id QUE VES ARRIBA
-- Los necesitarás para el siguiente paso
