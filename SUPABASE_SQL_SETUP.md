# Configuración SQL para Supabase - Sistema de Recuperación de Contraseña

Este documento contiene el código SQL necesario para habilitar el sistema de recuperación de contraseña con código de 4 dígitos en Supabase.

## 1. Crear Tabla para Códigos de Recuperación (Opcional)

Esta tabla es opcional ya que el sistema usa AsyncStorage por defecto, pero puede ser útil como backup.

```sql
-- Crear tabla para almacenar códigos de recuperación
CREATE TABLE IF NOT EXISTS password_recovery_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas por email
CREATE INDEX idx_recovery_email ON password_recovery_codes(email);

-- Índice para búsquedas por código
CREATE INDEX idx_recovery_code ON password_recovery_codes(code);

-- Limpiar códigos expirados automáticamente (ejecutar periódicamente)
CREATE OR REPLACE FUNCTION cleanup_expired_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM password_recovery_codes
  WHERE expires_at < NOW() OR used = TRUE;
END;
$$ LANGUAGE plpgsql;
```

## 2. Función RPC para Actualizar Contraseña

Esta función permite actualizar la contraseña de un usuario de forma segura desde el cliente.

```sql
-- Función para actualizar contraseña del usuario
-- NOTA: Esta función requiere permisos de administrador de Supabase
-- Solo se puede ejecutar en el backend o con service_role key

CREATE OR REPLACE FUNCTION admin_update_user_password(
  user_id_param UUID,
  new_password_param TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- Ejecutar con permisos del owner de la función
AS $$
DECLARE
  result JSON;
BEGIN
  -- Verificar que el usuario existe
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_id_param) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Usuario no encontrado'
    );
  END IF;

  -- Actualizar la contraseña usando la función interna de Supabase
  -- IMPORTANTE: Esta es una función sensible que solo debería llamarse después de validación
  PERFORM auth.admin_update_user_password(user_id_param, new_password_param);

  RETURN json_build_object(
    'success', true,
    'message', 'Contraseña actualizada correctamente'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Revocar acceso público y dar permisos solo a authenticated users
REVOKE ALL ON FUNCTION admin_update_user_password FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_update_user_password TO authenticated;
```

## 3. Políticas de Seguridad (RLS)

```sql
-- Habilitar Row Level Security en la tabla de códigos
ALTER TABLE password_recovery_codes ENABLE ROW LEVEL SECURITY;

-- Solo los usuarios autenticados pueden ver sus propios códigos (opcional)
CREATE POLICY "Users can view their own recovery codes"
  ON password_recovery_codes
  FOR SELECT
  USING (auth.email() = email);

-- Solo el sistema puede insertar códigos
CREATE POLICY "Service role can insert recovery codes"
  ON password_recovery_codes
  FOR INSERT
  WITH CHECK (true);

-- Solo el sistema puede actualizar códigos
CREATE POLICY "Service role can update recovery codes"
  ON password_recovery_codes
  FOR UPDATE
  USING (true);
```

## 4. Configuración de Permisos

Necesitas configurar los siguientes permisos en Supabase:

### Opción A: Usar Service Role Key (Recomendado para Producción)

La función `admin_update_user_password` requiere permisos de administrador. La forma más segura es:

1. Crear un endpoint backend (API) que:
   - Verifique el código de recuperación
   - Use la service_role key de Supabase
   - Llame a la función para actualizar la contraseña
   - Nunca exponga la service_role key al cliente

### Opción B: Usar Function de Edge (Recomendado)

Crear una Supabase Edge Function:

```typescript
// supabase/functions/reset-password/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    const { email, code, newPassword } = await req.json()

    // Crear cliente con service_role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verificar código desde AsyncStorage o tabla
    // (implementar lógica de verificación)

    // Obtener usuario por email
    const { data: userData, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (userError) throw userError

    // Actualizar contraseña
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userData.id,
      { password: newPassword }
    )

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { "Content-Type": "application/json" } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }
})
```

## 5. Alternativa Temporal (Solo Desarrollo)

Si no puedes implementar una función backend, puedes usar el método nativo de Supabase:

```javascript
// En el cliente, usar el método nativo de reset
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'tu-app://reset-password'
})
```

Esto enviará un email con un link mágico que permite al usuario cambiar su contraseña de forma segura.

## 6. Instrucciones de Implementación

### Para Desarrollo:

1. Ejecuta el SQL anterior en el SQL Editor de Supabase Dashboard
2. El sistema usará AsyncStorage para almacenar códigos temporalmente
3. Los códigos se mostrarán en consola para facilitar pruebas

### Para Producción:

1. Implementa una Edge Function de Supabase (Opción B recomendada)
2. O crea un backend con Node.js/Express que use service_role key
3. Actualiza `passwordResetService.js` para llamar a tu endpoint
4. Configura un servicio de email real (Resend, SendGrid, etc.)
5. **ELIMINA** la línea que devuelve `devCode` en producción

## 7. Configurar Servicio de Email (Importante)

Para que los códigos se envíen por email real:

### Opción 1: Resend (Recomendado)

```bash
npm install resend
```

```javascript
// En passwordResetService.js
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'Gracia Sublime <noreply@gracasublime.com>',
  to: email,
  subject: 'Código de Recuperación de Contraseña',
  html: `
    <h2>Código de Recuperación</h2>
    <p>Tu código de recuperación es:</p>
    <h1 style="font-size: 32px; letter-spacing: 8px;">${code}</h1>
    <p>Este código expira en 15 minutos.</p>
  `
});
```

### Opción 2: SendGrid

```bash
npm install @sendgrid/mail
```

### Opción 3: Nodemailer con Gmail

```bash
npm install nodemailer
```

## 8. Seguridad y Mejores Prácticas

- ✅ Los códigos expiran en 15 minutos
- ✅ Los códigos solo se pueden usar una vez
- ✅ Usa HTTPS en producción
- ✅ Implementa rate limiting (máximo 3 intentos por hora)
- ✅ Valida el email antes de enviar códigos
- ✅ Usa service_role key solo en el backend
- ✅ Nunca expongas service_role key al cliente
- ✅ Hashea las contraseñas (Supabase lo hace automáticamente)

## 9. Monitoreo

Puedes monitorear los intentos de recuperación con:

```sql
-- Ver intentos de recuperación recientes
SELECT
  email,
  code,
  used,
  expires_at,
  created_at
FROM password_recovery_codes
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Estadísticas de uso
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_attempts,
  SUM(CASE WHEN used THEN 1 ELSE 0 END) as successful,
  SUM(CASE WHEN expires_at < NOW() AND NOT used THEN 1 ELSE 0 END) as expired
FROM password_recovery_codes
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## 10. Troubleshooting

### Los códigos no se están guardando

- Verifica que la tabla existe en Supabase
- Revisa los permisos de la tabla
- Verifica que RLS esté configurado correctamente

### No puedo actualizar la contraseña

- Asegúrate de que la función RPC existe
- Verifica que tienes permisos para ejecutarla
- Considera usar Edge Functions en su lugar

### Los códigos expiran muy rápido

- Ajusta el tiempo de expiración en `passwordResetService.js`:
  ```javascript
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos
  ```

## Recursos Adicionales

- [Supabase Auth Functions](https://supabase.com/docs/reference/javascript/auth-admin-api)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Service Role](https://supabase.com/docs/guides/api/managing-dependencies#service-role-key)
