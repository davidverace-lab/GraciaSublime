-- ============================================
-- PASO 3: AGREGAR TALLAS A TODOS LOS PRODUCTOS DE PLAYERAS/CAMISAS
-- Este script agrega automáticamente todas las tallas (XS-XXL)
-- para Hombre y Mujer a TODOS los productos de category_id = 3
-- ============================================

-- Esto creará 12 variantes por cada producto:
-- - 6 tallas para Hombre (XS, S, M, L, XL, XXL)
-- - 6 tallas para Mujer (XS, S, M, L, XL, XXL)

DO $$
DECLARE
    producto RECORD;
    talla TEXT;
    genero TEXT;
    tallas TEXT[] := ARRAY['xs', 's', 'm', 'l', 'xl', 'xxl'];
    generos TEXT[] := ARRAY['male', 'female'];
BEGIN
    -- Para cada producto de camisas/playeras
    FOR producto IN
        SELECT product_id FROM products WHERE category_id = 3
    LOOP
        -- Para cada género
        FOREACH genero IN ARRAY generos
        LOOP
            -- Para cada talla
            FOREACH talla IN ARRAY tallas
            LOOP
                -- Insertar variante (ignorar si ya existe)
                INSERT INTO product_variants (product_id, size, gender, stock, is_available)
                VALUES (producto.product_id, talla, genero, 10, true)
                ON CONFLICT (product_id, size, gender) DO NOTHING;
            END LOOP;
        END LOOP;

        RAISE NOTICE 'Variantes creadas para producto ID: %', producto.product_id;
    END LOOP;
END $$;

-- Ver cuántas variantes se crearon
SELECT
    p.product_id,
    p.name AS producto,
    COUNT(*) AS total_variantes,
    SUM(CASE WHEN pv.gender = 'male' THEN 1 ELSE 0 END) AS tallas_hombre,
    SUM(CASE WHEN pv.gender = 'female' THEN 1 ELSE 0 END) AS tallas_mujer
FROM products p
LEFT JOIN product_variants pv ON p.product_id = pv.product_id
WHERE p.category_id = 3
GROUP BY p.product_id, p.name
ORDER BY p.product_id;

-- ✅ Deberías ver algo como:
-- producto_id | producto        | total_variantes | tallas_hombre | tallas_mujer
-- ------------|-----------------|-----------------|---------------|-------------
-- 5           | Playera Básica  | 12              | 6             | 6
-- 7           | Camisa Polo     | 12              | 6             | 6

-- Si ves números, ¡funcionó! 🎉
