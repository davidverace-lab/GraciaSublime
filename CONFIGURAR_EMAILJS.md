# 📧 Configurar EmailJS para Envío de Códigos por Email

## ¿Por qué EmailJS?
- ✅ **100% Gratuito** (200 emails/mes gratis)
- ✅ **No requiere backend ni servidor**
- ✅ **No requiere dominio verificado**
- ✅ **Configuración en 5 minutos**
- ✅ **Funciona con cualquier email (Gmail, Outlook, etc.)**

---

## 🚀 Pasos para Configurar (5 minutos)

### 1. Crear cuenta en EmailJS

1. Ve a https://www.emailjs.com/
2. Haz clic en **"Sign Up"** (Registrarte)
3. Usa tu email personal (puede ser Gmail)
4. Confirma tu email

### 2. Conectar tu cuenta de Gmail

1. En el dashboard de EmailJS, ve a **"Email Services"**
2. Haz clic en **"Add New Service"**
3. Selecciona **"Gmail"**
4. Haz clic en **"Connect Account"**
5. Autoriza con tu cuenta de Gmail (usa la que quieras para enviar)
6. Copia el **Service ID** (ejemplo: `service_abc1234`)

### 3. Crear el Template de Email

1. Ve a **"Email Templates"**
2. Haz clic en **"Create New Template"**
3. Configura así:

**Template Name:** `Código de Recuperación`

**Template ID:** `template_recovery_code` (importante que sea exacto)

**Subject:** `Código de Recuperación - Gracia Sublime`

**Content (Body):**
```html
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">

    <div style="text-align: center; background: linear-gradient(135deg, #FF6B6B, #FF8E53); padding: 30px; border-radius: 12px; margin-bottom: 30px;">
      <h1 style="color: white; margin: 0;">Gracia Sublime</h1>
    </div>

    <h2 style="color: #333;">Hola {{to_name}},</h2>

    <p style="color: #666; font-size: 16px; line-height: 1.6;">
      Recibimos una solicitud para recuperar tu contraseña. Tu código de verificación es:
    </p>

    <div style="background: #FFF5F5; border: 3px solid #FF6B6B; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
      <div style="font-size: 48px; font-weight: bold; letter-spacing: 10px; color: #FF6B6B; font-family: monospace;">
        {{recovery_code}}
      </div>
    </div>

    <div style="background: #FFF9E6; border-left: 4px solid #FFB020; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="color: #856404; margin: 0;">
        <strong>⏰ Importante:</strong> Este código expira en {{expiry_time}}.
      </p>
    </div>

    <p style="color: #666; font-size: 14px;">
      Si no solicitaste este código, puedes ignorar este email.
    </p>

    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

    <p style="color: #999; font-size: 12px; text-align: center;">
      © 2025 Gracia Sublime - Todos los derechos reservados
    </p>

  </div>
</body>
</html>
```

4. Haz clic en **"Save"**

### 4. Obtener tu Public Key

1. Ve a **"Account"** en el menú superior
2. Copia tu **Public Key** (ejemplo: `ZIm8vF5wNxODqVLGX`)

### 5. Actualizar el código de tu app

Abre el archivo `src/services/passwordResetService.js` y actualiza las líneas 80-82:

```javascript
service_id: 'TU_SERVICE_ID_AQUI',      // Del paso 2
template_id: 'template_recovery_code',  // Debe ser exacto
user_id: 'TU_PUBLIC_KEY_AQUI',         // Del paso 4
```

---

## ✅ ¡Listo! Ahora funciona

Cuando alguien use "Olvidé mi contraseña":
1. El código se generará automáticamente
2. Se enviará un email profesional desde TU Gmail
3. El usuario recibirá el código en su bandeja
4. También se mostrará en pantalla (backup)

---

## 🎯 Para tu Presentación de Mañana

**Lo que los jurados verán:**

1. Usuario olvida su contraseña
2. Ingresa su email
3. **Recibe un email REAL con el código** (llega en 2-5 segundos)
4. También se muestra en pantalla como backup
5. Ingresa el código de 6 dígitos
6. Cambia su contraseña exitosamente

**Ventajas para la demo:**
- ✅ Emails reales a cualquier dirección
- ✅ Sin límite de destinatarios
- ✅ Diseño profesional del email
- ✅ Funciona 100% del tiempo
- ✅ Backup en pantalla si no llega

---

## 🔧 Solución de Problemas

**Si no llega el email:**
- Revisar carpeta de SPAM
- Verificar que el Service ID y Public Key estén correctos
- El código también se muestra en pantalla como backup

**Límites del plan gratuito:**
- 200 emails/mes
- Suficiente para tu presentación + demos + pruebas

---

## 📱 Alternativa: Mostrar el Código en Pantalla

Ya está implementado como backup. Si por alguna razón el email falla:
- El código se muestra en un Alert después de enviar
- También aparece en la pantalla de verificación
- Los jurados pueden usarlo directamente

---

**⏰ Tiempo estimado de configuración: 5-10 minutos**
**💰 Costo: $0 (Completamente gratis)**
**🎓 Para producción:** Puedes actualizar al plan de pago ($7/mes) para 1000 emails
