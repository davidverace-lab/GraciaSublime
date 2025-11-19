# 🚀 Configuración Rápida de PayPal

## ✅ Estado Actual

La integración de PayPal **ya está completamente implementada** en el proyecto. Solo necesitas configurar tus credenciales.

---

## 📋 Paso 1: Crear Cuenta de Desarrollador

1. Ve a: https://developer.paypal.com/
2. Haz clic en "Log In" (usa tu cuenta personal de PayPal)
3. Si no tienes cuenta, crea una: https://www.paypal.com/signup

---

## 🔑 Paso 2: Obtener Credenciales

### En el Dashboard de PayPal:

1. Ve a: https://developer.paypal.com/dashboard/
2. Haz clic en "**Apps & Credentials**" en el menú lateral
3. Asegúrate de estar en modo "**Sandbox**" (arriba a la derecha)
4. Haz clic en "**Create App**"

### Crear la App:

1. **App Name**: `GraciaSublime` (o el nombre que prefieras)
2. **App Type**: Merchant
3. Haz clic en "**Create App**"

### Copiar Credenciales:

Una vez creada la app, verás:
- **Client ID** (público)
- **Secret** (privado - haz clic en "Show" para verlo)

**Cópialos**, los necesitarás en el siguiente paso.

---

## ⚙️ Paso 3: Configurar el Proyecto

### 3.1 Crear archivo .env

En la raíz del proyecto:

```bash
# Si ya existe .env, úsalo. Si no, cópialo del ejemplo:
cp .env.example .env
```

### 3.2 Editar .env

Abre el archivo `.env` y agrega tus credenciales:

```bash
# Configuración de PayPal
PAYPAL_CLIENT_ID=tu_client_id_aqui
PAYPAL_SECRET_KEY=tu_secret_key_aqui
PAYPAL_MODE=sandbox

# Ejemplo con credenciales reales (modo sandbox):
# PAYPAL_CLIENT_ID=AeDf8xKbH5JnMkLp9QrStUvWxYz0123456789
# PAYPAL_SECRET_KEY=ECvWxYz0123456789-AeDf8xKbH5JnMkLp9QrStUv
# PAYPAL_MODE=sandbox
```

**IMPORTANTE**:
- ✅ Reemplaza `tu_client_id_aqui` con tu Client ID real
- ✅ Reemplaza `tu_secret_key_aqui` con tu Secret Key real
- ✅ Mantén `PAYPAL_MODE=sandbox` para pruebas
- ❌ **NUNCA** subas el archivo `.env` a GitHub

---

## 🧪 Paso 4: Crear Cuentas de Prueba

Para probar pagos necesitas cuentas de prueba de PayPal.

### 4.1 Ir a Sandbox Accounts

1. Ve a: https://developer.paypal.com/dashboard/accounts
2. Asegúrate de estar en modo "**Sandbox**"

### 4.2 Cuentas Pre-creadas

PayPal crea automáticamente 2 cuentas de prueba:
- **Personal** (Buyer) - Para hacer compras
- **Business** (Seller) - Para recibir pagos

### 4.3 Ver Credenciales de Cuentas de Prueba

Para cada cuenta:
1. Haz clic en los 3 puntos (⋮)
2. Selecciona "**View/Edit account**"
3. En la pestaña "**Account details**" verás:
   - Email
   - Password (clic en "Show" para verla)

**Copia estas credenciales**, las usarás para hacer pagos de prueba.

---

## 🎮 Paso 5: Probar PayPal

### 5.1 Iniciar la App

```bash
npm start
```

### 5.2 Flujo de Prueba

1. **En la app**:
   - Regístrate o inicia sesión
   - Agrega productos al carrito
   - Ve al carrito
   - Haz clic en "Proceder al Checkout"

2. **Pantalla de Dirección**:
   - Agrega o selecciona una dirección
   - Haz clic en "Continuar"

3. **Pantalla de Pago**:
   - Selecciona "**PayPal**"
   - Haz clic en "**Pagar con PayPal**"

4. **En el navegador (PayPal Sandbox)**:
   - Se abrirá el navegador con PayPal Sandbox
   - Usa las credenciales de tu cuenta **Personal** (Buyer)
   - Email: `sb-xxxxx@personal.example.com` (el que copiaste)
   - Password: La contraseña que copiaste
   - Haz clic en "Log In"

5. **Aprobar Pago**:
   - Revisa el monto
   - Haz clic en "**Pay Now**" o "**Pagar ahora**"

6. **Volver a la App**:
   - Se cerrará el navegador automáticamente
   - La app capturará el pago
   - Verás una alerta: "Pago Exitoso"
   - Serás redirigido a la confirmación

---

## 🔍 Verificar Transacción

### En el Dashboard de PayPal:

1. Ve a: https://developer.paypal.com/dashboard/
2. Haz clic en "**Sandbox**" → "**Accounts**"
3. Encuentra tu cuenta **Business** (Seller)
4. Haz clic en "**View/Edit account**"
5. En la pestaña "**Transactions**" verás el pago

---

## 📱 Deep Links para la App

Las URLs de retorno ya están configuradas en el código:

```javascript
return_url: 'graciasublime://payment-success'
cancel_url: 'graciasublime://payment-cancel'
```

### En app.json (ya debe estar configurado):

```json
{
  "expo": {
    "scheme": "graciasublime"
  }
}
```

Si no está, agrégalo.

---

## 🚀 Paso 6: Producción

Cuando estés listo para producción:

### 6.1 Cambiar a Modo Live

En PayPal Dashboard:
1. Cambia de "**Sandbox**" a "**Live**" (arriba a la derecha)
2. Ve a "**Apps & Credentials**"
3. Selecciona tu app o crea una nueva para producción
4. Copia las credenciales **Live** (Client ID y Secret)

### 6.2 Actualizar .env

```bash
PAYPAL_CLIENT_ID=tu_client_id_live_aqui
PAYPAL_SECRET_KEY=tu_secret_key_live_aqui
PAYPAL_MODE=live  # ⚠️ Cambiar a 'live'
```

### 6.3 Aprobar la App (si es necesario)

Algunas funcionalidades requieren aprobación de PayPal:
- Pagos recurrentes
- Pagos internacionales
- Funciones avanzadas

Sigue las instrucciones en el Dashboard si te las solicita.

---

## ❓ Troubleshooting

### Error: "No se pudo autenticar con PayPal"

**Solución**:
- Verifica que `PAYPAL_CLIENT_ID` sea correcto
- Verifica que `PAYPAL_SECRET_KEY` sea correcto
- Asegúrate de estar en modo `sandbox` si usas credenciales de sandbox
- Revisa que no haya espacios extra en las credenciales

### Error: "No se pudo abrir el navegador"

**Solución**:
- Verifica que `Linking` esté funcionando
- Prueba en dispositivo físico (no siempre funciona en simulador)
- Verifica que el deep link esté configurado en `app.json`

### El pago se aprueba pero no se captura

**Solución**:
- Verifica los logs en consola
- Asegúrate de que el deep link regrese a la app
- Verifica que `graciasublime://payment-success` esté configurado

### No puedo hacer login en PayPal Sandbox

**Solución**:
- Usa las credenciales de la cuenta **Personal** (Buyer)
- Verifica que estés usando el email completo: `sb-xxxxx@personal.example.com`
- Si olvidaste la contraseña, restablécela desde el Dashboard

---

## 📊 Monitoreo de Transacciones

### En desarrollo (Sandbox):
1. Ve a: https://developer.paypal.com/dashboard/
2. Sandbox → Accounts
3. Selecciona cuenta Business
4. Pestaña "Transactions"

### En producción (Live):
1. Inicia sesión en: https://www.paypal.com/
2. Ve a "Activity"
3. Verás todas las transacciones reales

---

## 🔐 Seguridad

### Mejores Prácticas:

1. **Nunca compartas tus credenciales**
   - No las subas a GitHub
   - No las compartas en chats
   - No las pongas en el código

2. **Usa variables de entorno**
   - Siempre usa `.env`
   - Agrega `.env` al `.gitignore`
   - Usa `.env.example` como plantilla

3. **Modo Sandbox para pruebas**
   - Usa sandbox para desarrollo
   - Solo cambia a live cuando estés listo

4. **Rota tus credenciales periódicamente**
   - Cambia tus Secret Keys cada cierto tiempo
   - Usa credenciales diferentes para dev y prod

---

## 📚 Recursos Adicionales

### Documentación:
- [PayPal Developer Docs](https://developer.paypal.com/docs/)
- [PayPal Checkout](https://developer.paypal.com/docs/checkout/)
- [PayPal API Reference](https://developer.paypal.com/api/rest/)

### Soporte:
- [PayPal Developer Community](https://www.paypal-community.com/)
- [PayPal Support](https://www.paypal.com/smarthelp/contact-us)

### Testing:
- [Test Credit Cards](https://developer.paypal.com/tools/sandbox/card-testing/)
- [Sandbox Accounts](https://developer.paypal.com/dashboard/accounts)

---

## ✅ Checklist Final

Antes de empezar a recibir pagos reales:

- [ ] Credenciales de producción configuradas
- [ ] `PAYPAL_MODE=live` en .env
- [ ] App aprobada por PayPal (si es necesario)
- [ ] Cuenta bancaria vinculada a PayPal
- [ ] Términos y condiciones configurados
- [ ] Política de reembolsos definida
- [ ] Pruebas completas realizadas
- [ ] Deep links funcionando correctamente
- [ ] Logs de errores monitoreados

---

## 🎉 ¡Listo!

Tu integración de PayPal está completa. Solo necesitas:

1. ✅ Configurar credenciales en `.env`
2. ✅ Crear cuentas de prueba
3. ✅ Probar el flujo completo
4. ✅ Cambiar a producción cuando estés listo

**¡A recibir pagos! 💰**
