# Guía de Implementación - Sistema de Tallas

## Resumen de Cambios

Se ha implementado un sistema completo de gestión de tallas para productos de tipo **Camisas** y **Gorras** con las siguientes características:

### Tallas Disponibles
- **XS, S, M, L, XL, XXL** para todos los productos

### Distinción de Género
- **Camisas (category_id: 3)**: Tienen distinción entre **Hombre** y **Mujer**
- **Gorras (category_id: 2)**: Son **unisex** (sin distinción de género)

---

## Pasos de Implementación

### 1. Ejecutar Migración SQL en Supabase

1. Abre tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **SQL Editor**
3. Abre el archivo `/database/migrations/001_create_product_variants.sql`
4. Copia y pega todo el contenido en el editor SQL de Supabase
5. Ejecuta el script

**¿Qué hace esta migración?**
- Crea la tabla `product_variants` para almacenar las variantes de tallas
- Agrega la columna `variant_id` a la tabla `cart_items`
- Configura políticas RLS (Row Level Security)
- Crea índices para optimizar consultas
- Incluye triggers para actualizar timestamps automáticamente

---

## Archivos Creados/Modificados

### Archivos Nuevos ✨

1. **`/database/migrations/001_create_product_variants.sql`**
   - Script de migración SQL completo
   - Incluye comentarios explicativos

2. **`/src/services/productVariantsService.js`**
   - Servicio completo para manejar variantes
   - Funciones CRUD y helpers útiles
   - Funciones para generar variantes automáticamente

3. **`/src/screens/AdminProductVariantsScreen.js`**
   - Pantalla de administración de variantes
   - Permite crear, editar, eliminar variantes
   - Generación automática de todas las tallas
   - Gestión de stock por variante

### Archivos Modificados 🔧

1. **`/src/screens/ProductDetailScreen.js`**
   - Agregado selector de género (solo camisas)
   - Agregado selector de tallas
   - Validación de stock por variante
   - Visualización de disponibilidad
   - Pasa `variant_id` al agregar al carrito

2. **`/src/services/cartService.js`**
   - Actualizado para incluir `variant_id` en las operaciones
   - Diferencia items por variante (mismo producto, diferentes tallas = items separados)
   - Incluye información de variantes en los selects

3. **`/src/context/CartContext.js`**
   - Extrae y pasa `variant_id` al servicio

4. **`/src/components/CartItem.js`**
   - Muestra talla y género seleccionados
   - Badges visuales para cada variante

---

## Estructura de Base de Datos

### Tabla: `product_variants`

```sql
CREATE TABLE product_variants (
  variant_id UUID PRIMARY KEY,
  product_id INTEGER REFERENCES products(product_id),
  size VARCHAR(10) NOT NULL,          -- xs, s, m, l, xl, xxl
  gender VARCHAR(10),                 -- 'male', 'female', null (unisex)
  stock INTEGER DEFAULT 0,
  price_adjustment NUMERIC(10, 2) DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,

  UNIQUE(product_id, size, gender)
);
```

### Tabla Modificada: `cart_items`

```sql
ALTER TABLE cart_items
ADD COLUMN variant_id UUID REFERENCES product_variants(variant_id);
```

---

## Cómo Usar el Sistema

### Para Usuarios (Frontend)

#### 1. Ver Producto con Tallas

Cuando un usuario ve una **camisa** o **gorra**, verá:

**Para Camisas:**
1. Selector de **Género** (Hombre/Mujer)
2. Selector de **Tallas** (XS - XXL)
3. Indicador de stock disponible
4. Alertas de bajo stock

**Para Gorras:**
1. Selector de **Tallas** (XS - XXL) - sin género
2. Indicador de stock disponible

#### 2. Agregar al Carrito

- El sistema **requiere** seleccionar una talla antes de agregar al carrito
- Valida que haya stock suficiente
- Muestra error si no hay stock

#### 3. Ver Carrito

En el carrito, cada item muestra:
- **Talla seleccionada** (ej: "Talla: M")
- **Género** (solo para camisas, ej: "Hombre" o "Mujer")
- Badges visuales con íconos

---

### Para Administradores (Backend)

#### Acceder a Gestión de Variantes

**Opción 1: Desde la navegación**
- Necesitarás agregar un botón/enlace a `AdminProductVariantsScreen` en tu navegación admin

**Opción 2: Agregar botón en AdminProductFormScreen**

Puedes agregar un botón en `AdminProductFormScreen` después de guardar un producto:

```javascript
// En AdminProductFormScreen.js, después de crear/editar un producto
navigation.navigate('AdminProductVariants', { product: savedProduct });
```

#### Gestionar Variantes

1. **Generar Todas las Tallas Automáticamente**
   - Botón "Generar Todas" crea todas las combinaciones:
     - **Camisas**: 12 variantes (6 tallas × 2 géneros)
     - **Gorras**: 6 variantes (6 tallas)
   - Stock inicial: 10 unidades por defecto

2. **Agregar Talla Individual**
   - Seleccionar talla
   - Seleccionar género (si es camisa)
   - Definir stock inicial
   - Ajuste de precio opcional (ej: +$50 para tallas XXL)

3. **Editar Variante**
   - Modificar stock
   - Cambiar ajuste de precio
   - Activar/Desactivar disponibilidad

4. **Eliminar Variante**
   - Elimina una talla específica
   - Confirmación antes de eliminar

---

## Funciones Útiles del Servicio

### `productVariantsService.js`

```javascript
// Obtener todas las variantes de un producto
const { data } = await getProductVariants(productId);

// Obtener variantes agrupadas por género
const { data } = await getVariantsByGender(productId);
// Retorna: { male: [], female: [], unisex: [] }

// Encontrar variante específica
const { data } = await findVariant(productId, 'm', 'male');

// Verificar stock
const { inStock, availableQuantity } = await checkVariantStock(variantId, 2);

// Generar variantes automáticamente para camisas
const variants = generateShirtVariants(productId, defaultStock);
await createBulkVariants(variants);

// Generar variantes para gorras
const variants = generateCapVariants(productId, defaultStock);
await createBulkVariants(variants);

// Actualizar stock después de una compra
await decreaseVariantStock(variantId, quantity);
```

---

## Ejemplo de Flujo Completo

### 1. Administrador crea un producto de camisa

```javascript
// En AdminProductFormScreen
const newProduct = {
  name: "Camisa Básica",
  category_id: 3,  // Camisas
  price: 299,
  // ... otros campos
};

await createProduct(newProduct);
```

### 2. Administrador genera todas las tallas

```javascript
// En AdminProductVariantsScreen
// Click en "Generar Todas"
const variants = generateShirtVariants(productId, 10);
// Crea:
// - XS, S, M, L, XL, XXL para Hombre
// - XS, S, M, L, XL, XXL para Mujer
// Total: 12 variantes con 10 unidades cada una

await createBulkVariants(variants);
```

### 3. Usuario selecciona y compra

```javascript
// En ProductDetailScreen
// Usuario selecciona:
// - Género: Hombre
// - Talla: M

// Al agregar al carrito:
const selectedVariant = await findVariant(productId, 'm', 'male');

await add_to_cart({
  ...product,
  variant_id: selectedVariant.variant_id,
  selected_size: 'm',
  selected_gender: 'male'
}, quantity);
```

### 4. Carrito muestra la información

```javascript
// En CartItem.js
// Se muestra automáticamente:
// 📏 Talla: M
// 👨 Hombre
```

---

## Validaciones Implementadas

### Frontend (ProductDetailScreen)

✅ No permite agregar al carrito sin seleccionar talla
✅ Valida que la talla esté disponible
✅ Verifica que haya stock suficiente
✅ Muestra alertas de bajo stock (< 5 unidades)
✅ Deshabilita tallas sin stock

### Backend (productVariantsService)

✅ Evita duplicados (UNIQUE constraint en BD)
✅ Valida que el producto exista
✅ Controla stock negativo
✅ RLS políticas para seguridad

---

## Próximos Pasos Sugeridos

1. **Agregar navegación a AdminProductVariantsScreen**
   - En el menú de administración
   - Como botón en AdminProductFormScreen

2. **Integrar con sistema de órdenes**
   - Decrementar stock al confirmar orden
   - Restaurar stock al cancelar

3. **Reportes de stock**
   - Dashboard de tallas más vendidas
   - Alertas de productos con bajo stock

4. **Imágenes por variante** (opcional)
   - Permitir diferentes imágenes por color/género

---

## Troubleshooting

### Error: "relation product_variants does not exist"
**Solución:** Ejecuta la migración SQL en Supabase

### No se muestran las tallas en ProductDetailScreen
**Solución:**
- Verifica que el producto sea categoría 2 (Gorras) o 3 (Camisas)
- Verifica que existan variantes creadas en la BD

### Error al agregar al carrito
**Solución:**
- Verifica que la columna `variant_id` exista en `cart_items`
- Ejecuta la migración SQL completa

### Las variantes no se muestran en el carrito
**Solución:**
- Verifica que `CartService.getCartItems()` incluya el select de `product_variants`
- Revisa que el campo esté correctamente mapeado

---

## Soporte

Si encuentras problemas, revisa:
1. Logs de consola en React Native
2. Logs de Supabase (SQL Editor > Logs)
3. Network tab para ver requests fallidos

---

## Resumen de Tecnologías Usadas

- **Supabase**: Base de datos PostgreSQL
- **React Native**: Frontend móvil
- **Expo**: Framework para React Native
- **JavaScript**: Lenguaje principal

---

**¡Sistema de tallas implementado exitosamente! 🎉**

Ahora tu aplicación puede manejar productos con múltiples tallas y géneros.
