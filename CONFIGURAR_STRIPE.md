# Configuración de Stripe para Gracia Sublime

Esta guía te ayudará a configurar el sistema de pagos con Stripe de forma completa y segura.

## 📋 Requisitos Previos

- Cuenta de Stripe (crear en https://stripe.com)
- Supabase CLI instalado (`npm install -g supabase`)
- Node.js y npm instalados

## 🚀 Paso 1: Obtener Claves de Stripe

### 1.1 Crear/Iniciar sesión en Stripe

1. Ve a https://dashboard.stripe.com
2. Crea una cuenta o inicia sesión
3. Completa la verificación de tu cuenta (para modo producción)

### 1.2 Obtener las Claves API

1. En el dashboard, ve a **Developers** → **API keys**
2. Encontrarás dos claves:
   - **Publishable key** (pk_test_... o pk_live_...)
   - **Secret key** (sk_test_... o sk_live_...)

⚠️ **IMPORTANTE**:
- En desarrollo usa las claves de **Test mode**
- En producción usa las claves de **Live mode**
- NUNCA compartas tu Secret Key

## 🔧 Paso 2: Configurar las Claves en la App

### 2.1 Configurar la Clave Pública (Frontend)

Edita el archivo `src/config/stripe.js`:

```javascript
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_TU_CLAVE_PUBLICABLE_AQUI';
```

Reemplaza `'pk_test_TU_CLAVE_PUBLICABLE_AQUI'` con tu Publishable Key de Stripe.

### 2.2 Configurar la URL del Backend

En el mismo archivo, actualiza:

```javascript
export const STRIPE_BACKEND_URL = 'https://toyyebhfidzhnjtvhhvq.supabase.co/functions/v1';
```

Reemplaza `toyyebhfidzhnjtvhhvq` con tu referencia de proyecto de Supabase.

Para encontrar tu referencia:
1. Ve a https://app.supabase.com
2. Selecciona tu proyecto
3. Ve a **Settings** → **API**
4. Copia la URL que aparece en "Project URL"

## ☁️ Paso 3: Configurar Supabase Edge Function

### 3.1 Configurar la Secret Key en Supabase

**Opción A: Usando el Dashboard de Supabase (Recomendado)**

1. Ve a https://app.supabase.com
2. Selecciona tu proyecto
3. Ve a **Project Settings** → **Edge Functions** → **Manage secrets**
4. Agrega un nuevo secreto:
   - Nombre: `STRIPE_SECRET_KEY`
   - Valor: Tu Secret Key de Stripe (sk_test_... o sk_live_...)
5. Guarda el secreto

**Opción B: Usando Supabase CLI**

```bash
# Desde el directorio raíz del proyecto
supabase secrets set STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_aqui
```

### 3.2 Desplegar la Edge Function

```bash
# Inicializar Supabase (si no lo has hecho)
supabase init

# Desplegar la función
supabase functions deploy create-payment-intent
```

Si todo salió bien, deberías ver:
```
✅ Deployed Function create-payment-intent
```

### 3.3 Verificar la Función

Prueba que la función esté funcionando:

```bash
curl -X POST 'https://[TU-PROJECT-REF].supabase.co/functions/v1/create-payment-intent' \
  -H 'Authorization: Bearer [TU-SUPABASE-ANON-KEY]' \
  -H 'Content-Type: application/json' \
  -d '{
    "amount": 29.99,
    "currency": "usd",
    "metadata": {
      "order_id": "TEST_123"
    }
  }'
```

Deberías recibir una respuesta con `paymentIntentId` y `clientSecret`.

## 🗄️ Paso 4: Configurar la Base de Datos

### 4.1 Ejecutar la Migración SQL

1. Ve a https://app.supabase.com
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Crea una nueva query
5. Copia y pega el contenido del archivo:
   `supabase/migrations/add_stripe_payment_id_to_orders.sql`
6. Ejecuta la query (botón "Run")

Esto agregará:
- Campo `stripe_payment_id` a la tabla `orders`
- Índices para búsquedas rápidas
- Tabla de `reviews` (si no existe)
- Triggers para actualización automática

### 4.2 Verificar la Estructura

Ejecuta esta query para verificar:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'orders';
```

Deberías ver el campo `stripe_payment_id` en la lista.

## 📦 Paso 5: Instalar Dependencias

### En Linux/Mac:
```bash
./install-dependencies.sh
```

### En Windows:
```bash
install-dependencies.bat
```

### Manual:
```bash
npm install
```

## ✅ Paso 6: Probar la Integración

### 6.1 Iniciar la App

```bash
npm start
```

### 6.2 Realizar una Compra de Prueba

1. Agrega productos al carrito
2. Procede al checkout
3. Selecciona una dirección
4. Usa una tarjeta de prueba de Stripe:

**Tarjetas de Prueba:**
- **Éxito**: 4242 4242 4242 4242
- **Requiere autenticación**: 4000 0025 0000 3155
- **Declinada**: 4000 0000 0000 9995
- **Fondos insuficientes**: 4000 0000 0000 9995

**Datos adicionales de prueba:**
- Fecha de expiración: Cualquier fecha futura (ej: 12/25)
- CVC: Cualquier 3 dígitos (ej: 123)
- Código postal: Cualquier 5 dígitos (ej: 12345)

### 6.3 Verificar el Pago

1. El pago debería procesarse exitosamente
2. Deberías ver la pantalla de "Pago Exitoso"
3. El pedido debe aparecer en tu historial
4. En el dashboard de Stripe, deberías ver la transacción en **Payments**

## 🔍 Solución de Problemas

### Error: "STRIPE_SECRET_KEY no está configurada"

**Solución**: Asegúrate de haber configurado el secreto en Supabase (Paso 3.1)

### Error: "No se pudo conectar con el servidor"

**Solución**:
- Verifica que la Edge Function esté desplegada
- Verifica que la URL en `stripe.js` sea correcta
- Verifica tu conexión a internet

### Error: "Payment Intent creation failed"

**Solución**:
- Verifica que tu Secret Key de Stripe sea válida
- Asegúrate de estar usando la clave correcta (test o live)
- Revisa los logs de la Edge Function en Supabase

### La tarjeta es rechazada

**Solución**:
- Verifica que estés usando una tarjeta de prueba válida
- En modo test, usa: 4242 4242 4242 4242
- En modo live, usa una tarjeta real

## 🌐 Paso 7: Pasar a Producción

Cuando estés listo para producción:

### 7.1 Verificar tu Cuenta de Stripe

1. Completa la verificación de tu cuenta en Stripe
2. Proporciona información de tu negocio
3. Configura métodos de pago y desembolsos

### 7.2 Cambiar a Claves Live

1. En Stripe Dashboard, cambia a **Live mode** (toggle superior derecho)
2. Obtén tus claves live (pk_live_... y sk_live_...)
3. Actualiza `src/config/stripe.js` con la clave pública live
4. Actualiza el secreto en Supabase con la clave secreta live:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_tu_clave_live_aqui
   ```

### 7.3 Probar con Pagos Reales

⚠️ **ADVERTENCIA**: En modo live, todas las transacciones son reales y se cobrarán realmente.

1. Realiza una compra de prueba pequeña
2. Verifica que el dinero llegue a tu cuenta de Stripe
3. Configura notificaciones de Webhook (opcional)

## 📊 Monitoreo y Logs

### Ver logs de Edge Function

```bash
supabase functions logs create-payment-intent
```

### Dashboard de Stripe

En https://dashboard.stripe.com puedes ver:
- Todas las transacciones
- Reembolsos
- Disputas
- Informes financieros
- Y mucho más

## 🔒 Seguridad

✅ **Buenas prácticas implementadas**:
- Secret Key nunca se expone al cliente
- Payment Intents se crean en el servidor
- Validación de montos en el backend
- CORS configurado correctamente
- Encriptación end-to-end

⚠️ **Nunca hagas esto**:
- Compartir tu Secret Key
- Hacer commits con claves en el código
- Usar claves live en desarrollo
- Desactivar la verificación SSL

## 📚 Recursos Adicionales

- [Documentación de Stripe](https://stripe.com/docs)
- [Documentación de @stripe/stripe-react-native](https://stripe.dev/stripe-react-native)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Tarjetas de prueba de Stripe](https://stripe.com/docs/testing)

## 💬 Soporte

Si tienes problemas:
1. Revisa esta guía completamente
2. Consulta los logs de la Edge Function
3. Revisa el dashboard de Stripe
4. Contacta al equipo de desarrollo

---

¡Listo! Tu integración de Stripe debería estar funcionando correctamente. 🎉
