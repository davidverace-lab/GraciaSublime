# Configuración de Supabase para GraciaSublime

Este documento describe la configuración necesaria en el dashboard de Supabase para que la aplicación funcione correctamente.

## 1. Configuración de Autenticación

### Habilitar Email Confirmation

Para que los usuarios reciban un email de verificación al registrarse:

1. Ve al Dashboard de Supabase: https://supabase.com/dashboard/project/toyyebhfidzhnjtvhhvq
2. Navega a **Authentication** > **Settings**
3. En la sección **Email Auth**, asegúrate de que esté habilitado:
   - ✅ **Enable email confirmations** - Esto enviará un email de verificación a los nuevos usuarios

### Configurar URLs de Redirección

Para que los links de verificación y recuperación funcionen correctamente:

1. Ve a **Authentication** > **URL Configuration**
2. Agrega las siguientes URLs en **Redirect URLs**:
   - Para desarrollo: `exp://localhost:8081`
   - Para producción: Tu URL de producción
   - Deep links para la app:
     - `gracasublime://verify-email` (para verificación de email)
     - `gracasublime://reset-password` (para recuperación de contraseña)

### Personalizar Plantillas de Email

Puedes personalizar los emails que Supabase envía automáticamente:

1. Ve a **Authentication** > **Email Templates**
2. Personaliza las siguientes plantillas:

#### Confirm signup (Verificación de cuenta)
```html
<h2>¡Bienvenido a Gracia Sublime!</h2>
<p>Gracias por registrarte. Haz clic en el siguiente enlace para verificar tu cuenta:</p>
<p><a href="{{ .ConfirmationURL }}">Verificar mi cuenta</a></p>
```

#### Reset password (Recuperación de contraseña)
```html
<h2>Recuperación de Contraseña - Gracia Sublime</h2>
<p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
<p><a href="{{ .ConfirmationURL }}">Restablecer mi contraseña</a></p>
<p>Si no solicitaste este cambio, puedes ignorar este email.</p>
```

## 2. Configuración de Rate Limiting

Supabase incluye protección automática contra spam de emails:

- **Rate limit por defecto**: Un usuario puede solicitar máximo 4 emails de recuperación por hora
- Puedes ajustar este límite en **Settings** > **Rate Limits**

## 3. Configuración de SMTP (Opcional pero Recomendado)

Por defecto, Supabase usa su propio servicio de email, pero tiene límites:
- **Tier gratuito**: ~4 emails por hora
- **Producción**: Se recomienda configurar tu propio SMTP

Para configurar SMTP personalizado:

1. Ve a **Settings** > **Auth** > **SMTP Settings**
2. Configura tu proveedor de email (Gmail, SendGrid, etc.)
3. Ingresa:
   - Host SMTP
   - Puerto
   - Usuario
   - Contraseña
   - Email remitente

### Opciones de proveedores SMTP recomendados:
- **SendGrid** (gratis hasta 100 emails/día)
- **Mailgun** (gratis hasta 5,000 emails/mes)
- **Amazon SES** (muy económico)
- **Resend** (moderno y fácil de usar)

## 4. Verificar Configuración

Para verificar que todo está funcionando:

1. **Email de Verificación al Registrarse**:
   - Registra un nuevo usuario
   - Verifica que llegue el email de confirmación
   - Haz clic en el link y verifica que la cuenta se active

2. **Email de Recuperación de Contraseña**:
   - En la pantalla de Login, haz clic en "¿Olvidaste tu contraseña?"
   - Ingresa tu email
   - Verifica que llegue el email con el link de recuperación
   - Haz clic en el link y cambia la contraseña

## 5. Consideraciones de Seguridad

- ✅ **Email confirmation está habilitado**: Los usuarios deben verificar su email antes de acceder
- ✅ **Rate limiting activo**: Protege contra spam y abuso
- ✅ **Links de recuperación expiran**: Por defecto expiran en 1 hora
- ✅ **Contraseñas encriptadas**: Supabase usa bcrypt automáticamente

## 6. Monitoreo

Puedes monitorear el envío de emails en:
- **Authentication** > **Users** - Ver estado de confirmación de cada usuario
- **Logs** - Ver logs de envío de emails y errores

## Troubleshooting

### Los emails no llegan

1. **Verifica spam/promociones**: Los emails pueden llegar a estas carpetas
2. **Revisa logs en Supabase**: Ve a la sección Logs para ver errores
3. **Verifica rate limits**: Puede que hayas excedido el límite de emails
4. **Configura SMTP personalizado**: Para producción es altamente recomendado

### Los links de recuperación no funcionan

1. **Verifica las Redirect URLs**: Asegúrate de que estén configuradas correctamente
2. **Revisa la configuración de deep links**: En tu app.json de Expo
3. **Verifica que los links no hayan expirado**: Tienen validez de 1 hora por defecto

## Recursos Adicionales

- [Documentación oficial de Supabase Auth](https://supabase.com/docs/guides/auth)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)
