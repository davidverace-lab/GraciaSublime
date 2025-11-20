# Instrucciones para Habilitar Personalización en el Carrito

## ⚠️ PASO IMPORTANTE: Ejecutar Script SQL

Antes de usar la funcionalidad de personalización, **DEBES** ejecutar el siguiente script en Supabase:

### 1. Ve a tu panel de Supabase
- Abre https://app.supabase.com
- Selecciona tu proyecto

### 2. Abre el SQL Editor
- En el menú lateral, haz clic en "SQL Editor"
- Haz clic en "New Query"

### 3. Ejecuta el siguiente script:

```sql
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
```

### 4. Verifica que se ejecutó correctamente
- Deberías ver un mensaje de éxito
- La última consulta te mostrará todas las columnas de `cart_items`
- Verifica que aparezcan `custom_image`, `custom_design` y `design_name`

## 📱 Cómo usar la funcionalidad

### 1. Cargar una imagen personalizada
1. Ve a la pantalla de detalle de un producto
2. Busca el botón "Cargar Imagen" o "Personalizar"
3. Selecciona una imagen JPG o PNG de tu galería
4. La imagen se mostrará en una vista previa
5. Puedes eliminarla con el botón X si lo deseas

### 2. Agregar al carrito
1. Después de cargar tu imagen
2. Selecciona la cantidad
3. Haz clic en "Agregar al Carrito"
4. La imagen personalizada se guardará con el producto

### 3. Ver en el carrito
1. Ve al carrito
2. Verás cada producto con su información
3. Si tiene personalización, verás:
   - La imagen personalizada
   - Un badge "Personalizada"
   - El nombre del diseño (si aplica)
   - Un indicador "Imagen personalizada"

## 🔍 Verificación con Logs

Los siguientes logs aparecerán en la consola del navegador/dispositivo:

1. **Al cargar imagen**: `custom_image actualizado: [URI]`
2. **Al agregar al carrito**:
   - `📦 Agregando al carrito con personalización:`
   - `🖼️ Imagen personalizada:`
   - `🎨 Diseño seleccionado:`
3. **En CartContext**: `🛒 CartContext - Personalización recibida:`
4. **En cartService**:
   - `💾 Guardando personalización:`
   - `💾 Datos a insertar en cart_items:`
   - `✅ Item insertado en carrito:`
5. **En CartItem**:
   - `🛒 CartItem - Item recibido:`
   - `🖼️ CartItem - custom_image:`
   - `🎨 CartItem - custom_design:`
   - `📝 CartItem - design_name:`

## ❌ Solución de Problemas

### No se ve la personalización en el carrito

1. **Verifica que ejecutaste el script SQL**
   - Ve a Supabase > SQL Editor
   - Ejecuta: `SELECT * FROM cart_items LIMIT 1;`
   - Verifica que existan las columnas `custom_image`, `custom_design`, `design_name`

2. **Revisa los logs en la consola**
   - Abre las herramientas de desarrollador
   - Ve a la pestaña Console
   - Busca los logs con emojis mencionados arriba
   - Verifica que los datos se estén pasando correctamente

3. **Verifica que la imagen se haya cargado**
   - Debe aparecer la vista previa después de seleccionar la imagen
   - El log debe mostrar: `custom_image actualizado: [URI]`

4. **Limpia el carrito y vuelve a agregar**
   - Elimina todos los productos del carrito
   - Vuelve a agregar el producto con la imagen
   - Esto asegura que uses la nueva estructura

### La imagen no se muestra en ProductDetailScreen

1. Verifica que seleccionaste un archivo JPG o PNG
2. El componente `customImageContainer` debe aparecer después de seleccionar
3. Revisa los logs: `custom_image actualizado:`

### Error al insertar en cart_items

1. Si ves: `❌ Error insertando en cart_items:`
2. Lee el mensaje de error completo
3. Probablemente falte ejecutar el script SQL
4. O las columnas tienen un tipo de dato incorrecto

## 📊 Estructura de Datos

Los datos de personalización se guardan así:

```javascript
{
  custom_image: "file:///path/to/image.jpg",  // URI de la imagen
  custom_design: { ... },                      // Objeto del diseño (si aplica)
  design_name: "Nombre del diseño"             // Nombre legible
}
```

En la base de datos:
- `custom_image`: TEXT (URL/URI de la imagen)
- `custom_design`: JSONB (objeto completo del diseño)
- `design_name`: TEXT (nombre para mostrar)
