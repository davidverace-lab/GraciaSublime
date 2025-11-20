# 🔐 Guía de Credenciales - Gracia Sublime

## 📍 Ubicación de las Credenciales

**Todas las credenciales están en un solo archivo:**
```
📁 GraciaSublime/
   └── .env
```

---

## ✅ Credenciales YA Configuradas

### 1. **Supabase** ✅
```
SUPABASE_URL=https://toyyebhfidzhnjtvhhvq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Estado:** ✅ Funcionando

---

### 2. **EmailJS** ✅
```
EMAILJS_SERVICE_ID=service_1cqkwt9
EMAILJS_TEMPLATE_ID=template_w64swso
EMAILJS_PUBLIC_KEY=0GEWU_olXFLxsXNG5
EMAILJS_PRIVATE_KEY=36Mxyc8Foc6eaMIKdmhCP
```
**Estado:** ✅ Funcionando
**Función:** Envío de códigos de recuperación por email

---

### 3. **PayPal Sandbox** ⚠️ FALTA CONFIGURAR

```
PAYPAL_CLIENT_ID=TU_PAYPAL_CLIENT_ID_AQUI
PAYPAL_SECRET_KEY=TU_PAYPAL_SECRET_KEY_AQUI
PAYPAL_MODE=sandbox
```

**Estado:** ⚠️ Necesitas agregar tus credenciales

---

## 🚀 Cómo Obtener las Credenciales de PayPal (5 minutos)

### Paso 1: Ir al Dashboard de PayPal Developer
Ve a: **https://developer.paypal.com/dashboard/**

### Paso 2: Iniciar Sesión
- Si no tienes cuenta, créala gratis
- Usa tu email personal

### Paso 3: Ir a Apps & Credentials
1. En el menú superior, haz clic en **"Apps & Credentials"**
2. Asegúrate de estar en la pestaña **"Sandbox"** (arriba a la derecha)

### Paso 4: Crear una App (si no tienes una)
1. Haz clic en **"Create App"**
2. Nombre de la app: **"Gracia Sublime App"**
3. Selecciona **"Merchant"** como tipo de cuenta
4. Haz clic en **"Create App"**

### Paso 5: Copiar las Credenciales
Verás dos credenciales:

**Client ID:**
```
Ejemplo: AfqGtL8xZr3hP2m9Kn5Vw...
```

**Secret:**
```
(Haz clic en "Show" para verla)
Ejemplo: ELgR9pXm2Kt8Zn4Vw5Bq...
```

### Paso 6: Pegar en el archivo .env
Abre el archivo `.env` y reemplaza:
```env
PAYPAL_CLIENT_ID=AfqGtL8xZr3hP2m9Kn5Vw...
PAYPAL_SECRET_KEY=ELgR9pXm2Kt8Zn4Vw5Bq...
PAYPAL_MODE=sandbox
```

### Paso 7: Crear Cuentas de Prueba (opcional pero recomendado)

Para probar pagos, necesitas cuentas de prueba:

1. En el Dashboard de PayPal, ve a **"Accounts"** (menú izquierdo bajo "Sandbox")
2. Verás 2 cuentas predeterminadas:
   - 🟦 **Business Account** (para recibir pagos)
   - 🟩 **Personal Account** (para pagar)

**Email de ejemplo:** `sb-xxxxx@business.example.com`
**Password:** Haz clic en los 3 puntos (...) → **"View/Edit Account"** → **"System Generated Password"**

---

## 🧪 Probar PayPal Sandbox

### En tu app:
1. Agrega productos al carrito
2. Ve a checkout
3. Selecciona **"Pagar con PayPal"**
4. Se abrirá el navegador
5. **Inicia sesión con la cuenta PERSONAL de prueba:**
   - Email: `sb-xxxxx@personal.example.com`
   - Password: (la que copiaste)
6. Aprueba el pago
7. Vuelve a la app
8. ✅ ¡Pedido creado!

---

## 📱 Para Generar la APK

Una vez que tengas todas las credenciales en el `.env`:

```bash
# Opción 1: Con EAS Build (recomendado)
eas build -p android --profile preview

# Opción 2: Local
npx expo build:android
```

**IMPORTANTE:** El archivo `.env` se incluirá automáticamente en la APK. No necesitas hacer nada más.

---

## ⚠️ Seguridad

### Para Desarrollo/Presentación:
✅ Está bien tener las credenciales en `.env`

### Para Producción:
1. Cambia `PAYPAL_MODE=sandbox` a `PAYPAL_MODE=live`
2. Usa credenciales **LIVE** en lugar de Sandbox
3. Considera usar **variables de entorno del servidor** o **Supabase Edge Functions**

---

## 🔍 Verificar que Todo Funciona

### 1. EmailJS
```bash
# Prueba "Olvidé mi contraseña"
# Deberías recibir un email real
```

### 2. PayPal
```bash
# Prueba el checkout con PayPal
# Deberías ver la pantalla de login de PayPal Sandbox
```

### 3. Supabase
```bash
# Prueba login/registro
# Deberías poder crear usuarios y ver datos
```

---

## 📞 Soporte

Si tienes problemas:

1. **EmailJS no envía emails:**
   - Verifica que el Service ID, Template ID y Public Key estén correctos
   - Ve a https://dashboard.emailjs.com/ y revisa los logs

2. **PayPal no funciona:**
   - Verifica que tengas Client ID y Secret correctos
   - Asegúrate de estar en modo **Sandbox**
   - Crea cuentas de prueba si no tienes

3. **Variables de entorno no se cargan:**
   - Cierra completamente la app
   - Ejecuta: `expo start --clear`
   - Vuelve a abrir

---

## ✅ Checklist Final

Antes de tu presentación, verifica:

- [ ] Archivo `.env` existe
- [ ] Credenciales de EmailJS están correctas
- [ ] Credenciales de PayPal están agregadas
- [ ] Probaste "Olvidé mi contraseña" y llegó el email
- [ ] Probaste un pago con PayPal y funcionó
- [ ] La app corre sin errores

---

**¡Todo listo para tu presentación! 🎉**
