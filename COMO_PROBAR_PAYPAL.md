# 🧪 Cómo Probar PayPal - Guía Paso a Paso

## ✅ Tu configuración actual

- ✅ Archivo `.env` creado
- ✅ Credenciales de PayPal configuradas
- ✅ Modo: Sandbox (pruebas)

---

## 🚀 Paso 1: Obtener Cuenta de Prueba de PayPal

### 1.1 Ir al Dashboard de PayPal

Abre tu navegador y ve a:
```
https://developer.paypal.com/dashboard/
```

### 1.2 Iniciar Sesión

- Si NO tienes cuenta de PayPal:
  1. Ve a https://www.paypal.com/signup
  2. Crea una cuenta personal (es gratis)
  3. Luego regresa a https://developer.paypal.com/dashboard/

- Si YA tienes cuenta de PayPal:
  1. Haz clic en "Log In"
  2. Ingresa tu email y contraseña de PayPal

### 1.3 Ir a Sandbox Accounts

1. En el menú lateral izquierdo, haz clic en "**Testing Tools**"
2. Luego haz clic en "**Sandbox Accounts**"
3. O ve directamente a: https://developer.paypal.com/dashboard/accounts

### 1.4 Ver Cuentas de Prueba

Verás una tabla con cuentas de prueba. PayPal crea automáticamente 2 cuentas:

| Tipo | Nombre | Uso |
|------|--------|-----|
| **Personal** | sb-xxxxx47@personal.example.com | Para COMPRAR (como cliente) |
| **Business** | sb-xxxxx47@business.example.com | Para VENDER (como comercio) |

### 1.5 Obtener Credenciales de la Cuenta Personal

1. Busca la cuenta tipo "**Personal**" (la que NO dice Business)
2. Haz clic en los **3 puntos** (⋮) al final de la fila
3. Selecciona "**View/Edit account**"
4. Verás una ventana emergente con:
   - **Email Address**: `sb-xxxxx47@personal.example.com`
   - **System Generated Password**: ********
5. Haz clic en "**Show**" junto a la contraseña
6. **COPIA estos datos** (email y password) - los necesitarás pronto

**Ejemplo:**
```
Email: sb-abc12347@personal.example.com
Password: 1234567890
```

---

## 📱 Paso 2: Preparar la App

### 2.1 Verificar que .env esté configurado

Tu archivo `.env` ya está listo con:
```
PAYPAL_CLIENT_ID=AXXjQ7YTfKtwTIQ4pZT4m9UebUauEo_DYwBr5tEbvlX_WEl3pyMvGbd0lQfPt1GMFU9_ELKJq7XLFSTH
PAYPAL_SECRET_KEY=EAh4Ba-zxqvVaUZigYFKX-eXLIsbLpH9MkqplL9cAwbvSLYfSO6FPat4oVI6mtZJ9NBHfdqzX07_QgFZ
PAYPAL_MODE=sandbox
```

### 2.2 Iniciar la App

Abre tu terminal en la carpeta del proyecto y ejecuta:

```bash
npm start
```

Espera a que se inicie Expo. Verás algo como:

```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
```

### 2.3 Abrir la App

- **Android (recomendado para pruebas de PayPal)**: Presiona `a`
- **iOS**: Presiona `i`
- **Emulador ya abierto**: La app se cargará automáticamente

---

## 🛒 Paso 3: Flujo Completo de Compra

### 3.1 Registrarse o Iniciar Sesión

1. Si no tienes cuenta en la app:
   - Haz clic en "**Sign Up**"
   - Llena el formulario
   - Regístrate

2. Si ya tienes cuenta:
   - Inicia sesión

### 3.2 Agregar Productos al Carrito

1. En la pantalla de **Inicio**, verás productos
2. Haz clic en cualquier producto
3. En la pantalla de detalles, haz clic en "**Agregar al Carrito**"
4. Repite con 2 o 3 productos más

### 3.3 Ir al Carrito

1. Haz clic en el tab "**Carrito**" (abajo a la derecha) 🛒
2. Verás tus productos agregados
3. Verifica el total a pagar
4. Haz clic en "**Proceder al Checkout**"

### 3.4 Seleccionar Dirección de Envío

1. Si NO tienes dirección guardada:
   - Haz clic en "**Agregar Nueva Dirección**"
   - Llena el formulario:
     ```
     Nombre completo: Juan Pérez
     Dirección: Av. Principal 123
     Colonia: Centro
     Ciudad: Ciudad de México
     Estado: CDMX
     Código Postal: 06000
     Teléfono: 5512345678
     ```
   - Haz clic en "**Guardar Dirección**"

2. Si YA tienes dirección:
   - Selecciona la dirección
   - Haz clic en "**Continuar**"

### 3.5 Seleccionar Método de Pago (¡AQUÍ ES LA PRUEBA!)

Ahora estás en la pantalla de "**Método de Pago**". Verás 3 opciones:

1. ✅ **PayPal** ← Selecciona esta opción
2. ⬜ Tarjeta (PayPal)
3. ⬜ Transferencia Bancaria

**Selecciona "PayPal"**

Verás:
- Un recuadro azul con información sobre PayPal
- Un botón grande azul: "**Pagar con PayPal**" con el total

### 3.6 Hacer Clic en "Pagar con PayPal"

1. Haz clic en el botón "**Pagar con PayPal**"
2. Verás un mensaje "Procesando..." por unos segundos
3. **Se abrirá tu navegador automáticamente** con la página de PayPal

---

## 💳 Paso 4: Completar el Pago en PayPal

### 4.1 Página de PayPal Sandbox

Tu navegador se abrió en una página de PayPal que dice:
- "PayPal Sandbox"
- "Log in to your account"

### 4.2 Iniciar Sesión con Cuenta de Prueba

**Usa las credenciales que copiaste en el Paso 1.5:**

1. **Email**: Pega el email de la cuenta Personal
   ```
   Ejemplo: sb-abc12347@personal.example.com
   ```

2. **Password**: Pega la contraseña
   ```
   Ejemplo: 1234567890
   ```

3. Haz clic en "**Log In**"

### 4.3 Revisar el Pago

Ahora verás una pantalla con:
- **Gracia Sublime** (nombre de tu tienda)
- El monto total a pagar: `$xxx.xx USD`
- Mensaje: "You're paying Gracia Sublime"
- Un botón: "**Pay Now**" o "**Pagar ahora**"

**Verifica que:**
- ✅ El monto sea correcto
- ✅ Diga "Gracia Sublime"

### 4.4 Confirmar el Pago

1. Haz clic en "**Pay Now**"
2. Verás un spinner de carga
3. PayPal procesará el pago (toma 2-5 segundos)

### 4.5 Redirección Automática

PayPal te redirigirá automáticamente de vuelta a tu app.

**En Android**: Se cerrará el navegador y volverás a la app

**En iOS**: Puede que tengas que cerrar manualmente el navegador

---

## ✅ Paso 5: Confirmación en la App

### 5.1 Alerta de Éxito

Verás una alerta en la app:

```
┌─────────────────────────────┐
│     Pago Exitoso            │
│                             │
│  Tu pago de USD $xxx.xx     │
│  fue procesado              │
│  correctamente.             │
│                             │
│          [ OK ]             │
└─────────────────────────────┘
```

### 5.2 Pantalla de Confirmación

Después de hacer clic en "OK":
- Serás llevado a la pantalla de "**Confirmación del Pedido**"
- Verás un resumen completo:
  - ✅ Productos comprados
  - ✅ Dirección de envío
  - ✅ Método de pago: PayPal
  - ✅ Estado: Pagado
  - ✅ ID de transacción

### 5.3 Mensaje de Éxito

Haz clic en "**Finalizar Pedido**" y verás:
- Pantalla de éxito con confeti 🎉
- "¡Pedido Realizado con Éxito!"
- Número de orden

---

## 🔍 Paso 6: Verificar la Transacción en PayPal

### 6.1 Volver al Dashboard

1. Abre tu navegador
2. Ve a: https://developer.paypal.com/dashboard/accounts
3. Asegúrate de estar en modo "**Sandbox**"

### 6.2 Ver Transacción en Cuenta Business

1. Busca tu cuenta "**Business**" (la que recibe pagos)
2. Haz clic en los 3 puntos (⋮)
3. Selecciona "**View/Edit account**"
4. Haz clic en la pestaña "**Transactions**"
5. Verás tu transacción:
   ```
   Status: Completed
   Amount: $xxx.xx USD
   Type: Payment received
   Description: Compra en Gracia Sublime
   ```

### 6.3 Ver Transacción en Cuenta Personal

1. Busca tu cuenta "**Personal**" (la que hizo el pago)
2. Haz clic en los 3 puntos (⋮)
3. Selecciona "**View/Edit account**"
4. Haz clic en la pestaña "**Transactions**"
5. Verás tu pago:
   ```
   Status: Completed
   Amount: -$xxx.xx USD
   Type: Payment sent
   To: Gracia Sublime
   ```

---

## 🎯 Resumen del Flujo Completo

```
1. Obtener cuenta de prueba PayPal → ✅
   ↓
2. Iniciar app (npm start) → ✅
   ↓
3. Agregar productos al carrito → ✅
   ↓
4. Ir a Checkout → ✅
   ↓
5. Seleccionar dirección → ✅
   ↓
6. Seleccionar "PayPal" → ✅
   ↓
7. Clic en "Pagar con PayPal" → ✅
   ↓
8. Se abre navegador con PayPal → ✅
   ↓
9. Login con cuenta Personal de prueba → ✅
   ↓
10. Hacer clic en "Pay Now" → ✅
   ↓
11. Volver a la app automáticamente → ✅
   ↓
12. Ver alerta "Pago Exitoso" → ✅
   ↓
13. Ver confirmación del pedido → ✅
   ↓
14. ¡LISTO! 🎉
```

---

## 🔧 Troubleshooting

### Problema 1: "No se pudo abrir el navegador"

**Solución:**
- Asegúrate de estar en un dispositivo físico o emulador con navegador
- Verifica que tengas conexión a Internet
- Reinicia la app: Presiona `r` en la terminal

### Problema 2: "Error al crear la orden"

**Solución:**
- Verifica que las credenciales en `.env` sean correctas
- Asegúrate de tener conexión a Internet
- Revisa la terminal/consola por errores

### Problema 3: No puedo hacer login en PayPal

**Solución:**
- Usa el email COMPLETO: `sb-xxxxx@personal.example.com`
- Copia y pega la contraseña (no la escribas a mano)
- Asegúrate de estar usando la cuenta "Personal" (NO Business)

### Problema 4: El navegador se cierra pero no vuelvo a la app

**Solución en Android:**
- Abre la app manualmente
- El pago ya se procesó, solo haz clic en "OK" en la alerta

**Solución en iOS:**
- Cierra el navegador manualmente
- Vuelve a la app
- El pago ya se procesó

### Problema 5: "Payment already captured" o similar

**Solución:**
- Esto significa que el pago ya se procesó exitosamente
- Ve a tu pantalla de confirmación
- El pedido ya está creado

---

## 📝 Notas Importantes

1. **Modo Sandbox = Dinero ficticio**
   - No usas dinero real
   - Es solo para pruebas
   - Las cuentas de prueba tienen $1,000 USD ficticios

2. **Las transacciones no son reales**
   - No llegarán a tu banco
   - Solo se registran en PayPal Sandbox
   - Son solo para desarrollo

3. **Deep Links**
   - La app usa deep links para volver después del pago
   - En Android funciona automáticamente
   - En iOS puede requerir cerrar el navegador manualmente

4. **Logs útiles**
   - Revisa la consola/terminal mientras pruebas
   - Verás mensajes como:
     ```
     Creando orden de PayPal...
     Orden creada: XXXXXXXXXXXXX
     Deep link recibido: gracasublime://payment-success
     Capturando pago...
     Pago capturado exitosamente
     ```

---

## 🎉 ¡Felicidades!

Si completaste todos los pasos, ¡ya probaste PayPal con éxito!

Ahora puedes:
- ✅ Hacer más pagos de prueba
- ✅ Probar con diferentes montos
- ✅ Ver las transacciones en el Dashboard
- ✅ Cuando estés listo, cambiar a modo Live (producción)

---

## 🚀 Siguiente Paso: Producción

Cuando quieras usar PayPal real:

1. Cambia en `.env`:
   ```
   PAYPAL_MODE=live
   ```

2. Usa credenciales de producción (no sandbox)

3. Vincula tu cuenta bancaria a PayPal

4. ¡Listo para recibir pagos reales! 💰

---

## 📞 ¿Necesitas Ayuda?

Si algo no funciona:
1. Revisa los logs en la terminal
2. Verifica tu `.env`
3. Asegúrate de tener Internet
4. Intenta con otro producto/monto
5. Reinicia la app
