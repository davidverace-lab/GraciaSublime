# 🔑 Obtener Credenciales de PayPal - Guía Paso a Paso

## ❌ Problema Actual

```
Error 401: No se pudo autenticar con PayPal
```

**Causa**: Las credenciales en tu `.env` son inválidas o han expirado.

**Solución**: Obtener TUS PROPIAS credenciales del dashboard de PayPal.

---

## ✅ Solución en 5 Pasos (10 minutos)

### Paso 1: Ir al Dashboard de PayPal

1. Abre tu navegador
2. Ve a: **https://developer.paypal.com/dashboard/**
3. Verás la página de inicio de PayPal Developer

### Paso 2: Iniciar Sesión

**Opción A - Si YA tienes cuenta de PayPal:**
1. Haz clic en "**Log In**" (arriba a la derecha)
2. Ingresa tu email y contraseña de PayPal
3. Haz clic en "Log In"

**Opción B - Si NO tienes cuenta de PayPal:**
1. Ve a: https://www.paypal.com/signup
2. Haz clic en "**Sign Up**"
3. Selecciona "**Personal Account**" (es gratis)
4. Llena el formulario:
   - Email
   - Contraseña
   - Nombre
   - Dirección
5. Verifica tu email
6. Vuelve a: https://developer.paypal.com/dashboard/
7. Inicia sesión con la cuenta que acabas de crear

### Paso 3: Asegurarte de estar en Modo Sandbox

1. Una vez en el dashboard, mira en la esquina **superior derecha**
2. Debe decir "**Sandbox**" (con un fondo azul/gris)
3. Si dice "**Live**", haz clic y cámbialo a "**Sandbox**"

```
┌─────────────────────────┐
│   [Sandbox ▼]  [Live]   │  ← Debe estar en Sandbox
└─────────────────────────┘
```

### Paso 4: Crear una Nueva App

1. En el menú lateral izquierdo, haz clic en "**Apps & Credentials**"
2. Asegúrate de estar en la pestaña "**Sandbox**" (arriba)
3. Verás una sección "**REST API apps**"
4. Haz clic en el botón azul "**Create App**"

### Paso 5: Configurar la App

1. Te aparecerá un formulario:

   ```
   App Name: GraciaSublime

   App Type:
   [•] Merchant
   [ ] Platform

   Sandbox Business Account:
   [Selecciona la cuenta que aparece] ▼
   ```

2. Llena los campos:
   - **App Name**: Escribe `GraciaSublime`
   - **App Type**: Selecciona `Merchant` (ya está seleccionado)
   - **Sandbox Business Account**: Deja la cuenta que aparece por defecto

3. Haz clic en "**Create App**" (botón azul abajo)

### Paso 6: Copiar las Credenciales

¡Felicidades! Ahora verás la página de tu app con las credenciales:

```
┌─────────────────────────────────────────────────┐
│  GraciaSublime                                  │
│                                                 │
│  Client ID                                      │
│  ┌───────────────────────────────────────────┐ │
│  │ AXXjQ7YTfKtwTIQ4pZT4m9UebUauEo_DYwBr... │ │ ← COPIA ESTO
│  └───────────────────────────────────────────┘ │
│                                                 │
│  Secret                            [Show]       │ ← HAZ CLIC EN "SHOW"
│  ┌───────────────────────────────────────────┐ │
│  │ •••••••••••••••••••••••••••••••••••••••  │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

**Ahora copia las credenciales:**

1. **Client ID**:
   - Haz clic en el botón "📋 Copy" junto al Client ID
   - O selecciona todo el texto y copia (Ctrl+C)
   - **Pégalo en un bloc de notas temporalmente**

2. **Secret**:
   - Haz clic en "**Show**" para revelar el Secret
   - Haz clic en el botón "📋 Copy" junto al Secret
   - O selecciona todo el texto y copia (Ctrl+C)
   - **Pégalo en el bloc de notas junto al Client ID**

**Ejemplo de lo que copiaste:**
```
Client ID: AeK9xL2mN4oP6qR8sT0uV1wX3yZ5bC7dE9fG1hI3jK5lM7nO9pQ1rS
Secret: EDcF5gH7iJ9kL1mN3oP5qR7sT9uV1wX3yZ5aCbDeF7gH9iJ1kL3mN5o
```

---

## 📝 Paso 7: Actualizar el Archivo .env

Ahora vamos a poner estas credenciales en tu proyecto.

### Opción A: Editar desde VS Code (Recomendado)

1. Abre VS Code en tu proyecto:
   ```bash
   code .
   ```

2. En el explorador lateral, busca el archivo `.env`

3. Haz clic para abrirlo

4. Reemplaza las líneas de PayPal con tus credenciales:

   **ANTES:**
   ```
   PAYPAL_CLIENT_ID=AXXjQ7YTfKtwTIQ4pZT4m9UebUauEo_DYwBr5tEbvlX_WEl3pyMvGbd0lQfPt1GMFU9_ELKJq7XLFSTH
   PAYPAL_SECRET_KEY=EAh4Ba-zxqvVaUZigYFKX-eXLIsbLpH9MkqplL9cAwbvSLYfSO6FPat4oVI6mtZJ9NBHfdqzX07_QgFZ
   ```

   **DESPUÉS (con TUS credenciales):**
   ```
   PAYPAL_CLIENT_ID=TU_CLIENT_ID_AQUI
   PAYPAL_SECRET_KEY=TU_SECRET_KEY_AQUI
   ```

5. **Guarda el archivo**: Ctrl+S (Windows) o Cmd+S (Mac)

### Opción B: Editar desde Bloc de Notas

1. Abre el Explorador de Archivos

2. Navega a la carpeta de tu proyecto:
   ```
   C:\Users\Lenovo\Documents\GraciaSublimeRepo\GraciaSublime
   ```

3. Busca el archivo `.env`

4. Haz clic derecho → "Abrir con" → "Bloc de notas"

5. Reemplaza las credenciales de PayPal con las tuyas

6. Guarda el archivo (Ctrl+S)

---

## 🔄 Paso 8: Reiniciar la App (MUY IMPORTANTE)

Después de cambiar el `.env`, **DEBES reiniciar Metro Bundler**:

### En la terminal donde corre tu app:

1. Presiona `Ctrl+C` para detener la app

2. Reinicia:
   ```bash
   npm start
   ```

3. Espera a que se inicie completamente

4. Presiona `r` para recargar la app

**NOTA IMPORTANTE**: Si no reinicias, las credenciales viejas seguirán en caché y el error persistirá.

---

## ✅ Paso 9: Probar de Nuevo

Ahora sí, prueba PayPal:

1. En la app, agrega productos al carrito
2. Ve a Checkout
3. Selecciona dirección
4. Selecciona "PayPal"
5. Haz clic en "Pagar con PayPal"

**Debería funcionar ahora** ✅

---

## 🔍 Verificar que Funcionó

Si todo salió bien, verás en la consola/terminal:

```
✅ Creando orden de PayPal...
✅ Orden creada: XXXXXXXXX
```

Y NO verás:
```
❌ Error 401
❌ No se pudo autenticar con PayPal
```

---

## ❓ Troubleshooting

### Problema 1: Sigue dando error 401

**Solución:**
1. Verifica que copiaste las credenciales correctamente (sin espacios extra)
2. Asegúrate de que el archivo `.env` esté guardado
3. **IMPORTANTE**: Detén la app (Ctrl+C) y reinicia (`npm start`)
4. Verifica que estés en modo "Sandbox" en el dashboard de PayPal

### Problema 2: No encuentro el archivo .env

**Solución:**
1. El archivo `.env` está en la raíz del proyecto
2. Puede estar oculto. En VS Code, deberías verlo en el explorador
3. Si no existe, créalo manualmente

### Problema 3: Las credenciales no se actualizan

**Solución:**
```bash
# 1. Detener la app
Ctrl+C

# 2. Limpiar caché
npx expo start -c

# 3. Esperar a que inicie

# 4. Probar de nuevo
```

### Problema 4: Error al copiar las credenciales

**Solución:**
- Asegúrate de copiar TODA la credencial (es muy larga)
- No dejes espacios antes o después
- Copia directamente desde el dashboard de PayPal
- No copies las comillas si las hay

---

## 📋 Resumen de lo que Debes Hacer

1. ✅ Ir a: https://developer.paypal.com/dashboard/
2. ✅ Iniciar sesión (o crear cuenta)
3. ✅ Cambiar a modo "Sandbox"
4. ✅ Apps & Credentials → Create App
5. ✅ Nombrar app "GraciaSublime"
6. ✅ Copiar Client ID
7. ✅ Mostrar y copiar Secret
8. ✅ Pegar en el archivo `.env`
9. ✅ Guardar `.env`
10. ✅ Reiniciar app (Ctrl+C → npm start)
11. ✅ Probar PayPal de nuevo

---

## 🎯 Ejemplo Completo

Tu archivo `.env` debe verse así (con TUS credenciales):

```bash
# Configuración de Email - Resend
RESEND_API_KEY=tu_api_key_aqui

# Configuración de PayPal
PAYPAL_CLIENT_ID=AeK9xL2mN4oP6qR8sT0uV1wX3yZ5bC7dE9fG1hI3jK5lM7nO9pQ1rS
PAYPAL_SECRET_KEY=EDcF5gH7iJ9kL1mN3oP5qR7sT9uV1wX3yZ5aCbDeF7gH9iJ1kL3mN5o
PAYPAL_MODE=sandbox
```

**Notas:**
- Las credenciales son LARGAS (60-70 caracteres)
- No tienen espacios
- Son una combinación de letras y números
- Client ID comienza generalmente con 'A'
- Secret puede comenzar con 'E'

---

## ✅ ¡Listo!

Después de seguir estos pasos, PayPal debería funcionar correctamente.

Si sigues teniendo problemas, comparte:
1. El mensaje de error exacto
2. Confirma que reiniciaste la app
3. Confirma que estás en modo Sandbox
