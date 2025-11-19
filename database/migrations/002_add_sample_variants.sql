-- Script para agregar variantes de ejemplo a un producto de camisas
-- IMPORTANTE: Reemplaza <PRODUCT_ID> con el ID real de tu producto

-- Paso 1: Encuentra el ID de tu producto de camisas
-- SELECT product_id, name FROM products WHERE category_id = 3;

-- Paso 2: Reemplaza <PRODUCT_ID> abajo con el ID que encontraste
-- Por ejemplo, si el ID es 5, reemplaza <PRODUCT_ID> con 5

-- Variantes para HOMBRE (male)
INSERT INTO product_variants (product_id, size, gender, stock, is_available) VALUES
  (<PRODUCT_ID>, 'xs', 'male', 10, true),
  (<PRODUCT_ID>, 's', 'male', 15, true),
  (<PRODUCT_ID>, 'm', 'male', 20, true),
  (<PRODUCT_ID>, 'l', 'male', 20, true),
  (<PRODUCT_ID>, 'xl', 'male', 15, true),
  (<PRODUCT_ID>, 'xxl', 'male', 10, true);

-- Variantes para MUJER (female)
INSERT INTO product_variants (product_id, size, gender, stock, is_available) VALUES
  (<PRODUCT_ID>, 'xs', 'female', 10, true),
  (<PRODUCT_ID>, 's', 'female', 15, true),
  (<PRODUCT_ID>, 'm', 'female', 20, true),
  (<PRODUCT_ID>, 'l', 'female', 20, true),
  (<PRODUCT_ID>, 'xl', 'female', 15, true),
  (<PRODUCT_ID>, 'xxl', 'female', 10, true);

-- Verifica que se crearon correctamente:
-- SELECT * FROM product_variants WHERE product_id = <PRODUCT_ID>;
