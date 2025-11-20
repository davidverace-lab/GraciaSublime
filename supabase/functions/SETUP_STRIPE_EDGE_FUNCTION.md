# Configuración de Stripe Edge Function para Supabase

Esta Edge Function permite crear Payment Intents de Stripe de forma segura desde el servidor.

## Requisitos Previos

1. **Supabase CLI instalado**
   ```bash
   npm install -g supabase
   ```

2. **Cuenta de Stripe**
   - Obtén tu Secret Key de: https://dashboard.stripe.com/apikeys

## Pasos para Configurar

### 1. Inicializar Supabase (si no lo has hecho)
```bash
supabase init
```

### 2. Configurar la Secret Key de Stripe

Debes agregar tu STRIPE_SECRET_KEY como variable de entorno en Supabase:

**Opción A: Usando el Dashboard de Supabase**
1. Ve a tu proyecto en https://app.supabase.com
2. Settings → Edge Functions → Secrets
3. Agregar nuevo secreto:
   - Nombre: `STRIPE_SECRET_KEY`
   - Valor: `sk_test_...` (tu clave secreta de Stripe)

**Opción B: Usando CLI**
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_aqui
```

### 3. Desplegar la Edge Function

```bash
supabase functions deploy create-payment-intent
```

### 4. Obtener la URL de la Edge Function

Después del deploy, obtendrás una URL como:
```
https://[TU-PROJECT-REF].supabase.co/functions/v1/create-payment-intent
```

### 5. Configurar la URL en tu App

Actualiza el archivo `src/config/stripe.js` con la URL de tu Edge Function:

```javascript
export const STRIPE_BACKEND_URL = 'https://[TU-PROJECT-REF].supabase.co/functions/v1';
```

## Testing Local

Para probar localmente antes de desplegar:

```bash
# Iniciar Supabase local
supabase start

# Configurar la secret key local
supabase secrets set STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_aqui --local

# Servir la función localmente
supabase functions serve create-payment-intent
```

Luego usa `http://localhost:54321/functions/v1` como STRIPE_BACKEND_URL en desarrollo.

## Probar la Edge Function

Puedes probar la función con curl:

```bash
curl -X POST 'https://[TU-PROJECT-REF].supabase.co/functions/v1/create-payment-intent' \
  -H 'Authorization: Bearer [TU-SUPABASE-ANON-KEY]' \
  -H 'Content-Type: application/json' \
  -d '{
    "amount": 29.99,
    "currency": "usd",
    "metadata": {
      "order_id": "TEST_123",
      "customer_email": "test@example.com"
    }
  }'
```

Deberías recibir una respuesta como:
```json
{
  "success": true,
  "paymentIntentId": "pi_...",
  "clientSecret": "pi_..._secret_...",
  "amount": 2999,
  "currency": "usd"
}
```

## Seguridad

- ✅ La Secret Key de Stripe NUNCA se expone al cliente
- ✅ Toda la lógica de creación de Payment Intent está en el servidor
- ✅ El cliente solo recibe el `clientSecret` necesario para confirmar el pago
- ✅ CORS configurado para aceptar requests desde tu app

## Troubleshooting

**Error: "STRIPE_SECRET_KEY no está configurada"**
- Asegúrate de haber configurado el secreto correctamente (paso 2)

**Error: "Network request failed"**
- Verifica que la URL de la Edge Function sea correcta
- Verifica tu conexión a internet
- Asegúrate de que la función esté desplegada correctamente

**Error: "Invalid API Key"**
- Verifica que tu STRIPE_SECRET_KEY sea válida
- En desarrollo usa claves de test (sk_test_...)
- En producción usa claves live (sk_live_...)
