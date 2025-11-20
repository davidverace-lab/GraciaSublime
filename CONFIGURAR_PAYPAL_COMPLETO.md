# 🔧 Configuración Completa de PayPal Sandbox

## ✅ Estado Actual

Tu aplicación YA TIENE:
- ✅ Credenciales de PayPal Sandbox configuradas en `app.json`
- ✅ Deep linking configurado (`scheme: "graciasublime"`)
- ✅ Servicio de PayPal completo (`paypalService.js`)
- ✅ Componente PayPalButton funcional
- ✅ Intent filters para Android

## 📋 Verificaciones Necesarias

### 1. Verificar Credenciales de PayPal

Las credenciales actuales en `app.json`:
```
PAYPAL_CLIENT_ID: AXXjQ7YTfKtwTIQ4pZT4m9UebUauEo_DYwBr5tEbvlX_WEl3pyMvGbd0lQfPt1GMFU9_ELKJq7XLFSTH
PAYPAL_SECRET_KEY: EAh4Ba-zxqvVaUZigYFKX-eXLIsbLpH9MkqplL9cAwbvSLYfSO6FPat4oVI6mtZJ9NBHfdqzX07_QgFZ
PAYPAL_MODE: sandbox
```

**IMPORTANTE**: Estas son credenciales sandbox. Para producción necesitarás otras.

### 2. Probar la Integración

#### Paso 1: Iniciar la App en Desarrollo

```bash
npx expo start
```

#### Paso 2: Agregar Productos al Carrito
1. Navega y agrega productos
2. Ve al checkout
3. Selecciona "PayPal" como método de pago

#### Paso 3: Proceso de Pago
1. Presiona el botón "Pagar con PayPal"
2. Se abrirá el navegador con PayPal Sandbox
3. Usa una cuenta de prueba de PayPal:
   - **Email**: sb-buyer@personal.example.com (ejemplo)
   - **Password**: Tu password de cuenta sandbox

#### Paso 4: Completar Pago
1. Aprueba el pago en PayPal
2. Serás redirigido automáticamente a la app
3. El pago se capturará automáticamente
4. Verás un mensaje de "Pago Exitoso"
5. Se creará el pedido en Supabase

## 🔐 Crear Cuenta de Prueba en PayPal

Si no tienes una cuenta sandbox:

1. Ve a https://developer.paypal.com
2. Inicia sesión con tu cuenta de PayPal
3. Ve a "Sandbox" → "Accounts"
4. Crea una cuenta de tipo "Personal" (Buyer)
5. Usa esas credenciales para probar

## 🐛 Solución de Problemas

### Problema 1: "No se pudo autenticar con PayPal"

**Solución**:
- Verifica que las credenciales en `app.json` sean correctas
- Asegúrate de estar usando el modo sandbox
- Verifica tu conexión a internet

### Problema 2: "No se pudo abrir el navegador"

**Solución**:
- En iOS: Asegúrate de tener un navegador instalado
- En Android: Verifica los permisos de la app
- Reinstala la app con `expo run:android` o `expo run:ios`

### Problema 3: No regresa a la app después del pago

**Solución**:

1. **Para desarrollo con Expo**:
```bash
npx expo install expo-linking
```

2. **Verifica app.json**:
```json
{
  "expo": {
    "scheme": "graciasublime",
    "ios": {
      "bundleIdentifier": "com.graciasublime.app"
    },
    "android": {
      "package": "com.graciasublime.app",
      "intentFilters": [...]
    }
  }
}
```

3. **Reconstruye la app**:
```bash
# Android
npx expo run:android

# iOS
npx expo run:ios
```

### Problema 4: Deep linking no funciona

**Solución para Expo Dev Client**:

1. Instala dev client:
```bash
npx expo install expo-dev-client
```

2. Reconstruye:
```bash
npx expo run:android
# o
npx expo run:ios
```

## 🧪 Probar Deep Linking Manualmente

### En Android:
```bash
adb shell am start -W -a android.intent.action.VIEW -d "graciasublime://payment-success"
```

### En iOS (Simulator):
```bash
xcrun simctl openurl booted "graciasublime://payment-success"
```

Si el deep linking funciona, la app debería abrirse.

## 📱 Configuración para Producción

Cuando estés listo para producción:

1. **Obtén credenciales de producción**:
   - Ve a PayPal Developer Dashboard
   - Crea una app en modo "Live"
   - Obtén Client ID y Secret Key

2. **Actualiza app.json**:
```json
{
  "extra": {
    "PAYPAL_CLIENT_ID": "tu_client_id_produccion",
    "PAYPAL_SECRET_KEY": "tu_secret_produccion",
    "PAYPAL_MODE": "live"
  }
}
```

3. **Verifica las URLs de retorno**:
   - Las URLs de retorno deben apuntar a tu app publicada
   - Considera usar URLs universales para mejor UX

## 🎯 Flujo Completo del Pago

```
1. Usuario presiona "Pagar con PayPal"
   ↓
2. App crea orden en PayPal (createPayPalOrder)
   ↓
3. App abre navegador con URL de aprobación
   ↓
4. Usuario aprueba en PayPal
   ↓
5. PayPal redirige a: graciasublime://payment-success
   ↓
6. App detecta deep link
   ↓
7. App captura el pago (capturePayPalPayment)
   ↓
8. App crea pedido en Supabase
   ↓
9. App muestra confirmación
   ↓
10. Usuario ve pantalla "Gracias por tu compra"
```

## 📊 Logs para Debug

El código ya incluye logs extensivos. Monitorea la consola para:

```javascript
// Logs importantes:
"Creando orden de PayPal..."
"Orden creada: ORDER_ID"
"Deep link recibido: URL"
"Capturando pago..."
"Pago capturado exitosamente"
```

## ⚠️ Notas Importantes

1. **Expo Go NO soporta deep linking personalizado**
   - Debes usar Expo Dev Client o build standalone

2. **Credenciales sensibles**
   - En producción, usa variables de entorno
   - No subas credenciales a Git
   - Considera usar un backend para manejar las claves

3. **Testing**
   - Siempre prueba con cuentas sandbox antes de producción
   - Verifica que los montos sean correctos
   - Prueba cancelaciones y errores

4. **UX**
   - El usuario debe ver un indicador de carga
   - Maneja errores graciosamente
   - Proporciona feedback claro

## 🔄 Actualizar a Expo Dev Client

Si no tienes Expo Dev Client:

```bash
# 1. Instalar
npx expo install expo-dev-client

# 2. Actualizar app.json si es necesario
# (Ya está configurado correctamente)

# 3. Build para desarrollo
npx expo run:android
# o
npx expo run:ios

# 4. Iniciar dev server
npx expo start --dev-client
```

## ✅ Checklist de Verificación

Antes de considerar PayPal funcionando, verifica:

- [ ] Las credenciales están en app.json
- [ ] El scheme "graciasublime" está configurado
- [ ] Intent filters están en Android config
- [ ] La app se construye sin errores
- [ ] El botón de PayPal aparece en checkout
- [ ] Al presionar el botón se abre PayPal
- [ ] Después de pagar, regresa a la app
- [ ] El pago se captura correctamente
- [ ] El pedido se crea en Supabase
- [ ] Se muestra el mensaje de éxito

---

**Última actualización**: 2025-01-20
**Estado**: Listo para testing con Expo Dev Client
