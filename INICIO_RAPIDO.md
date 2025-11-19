# 🚀 Inicio Rápido - Nuevas Funcionalidades

## ✅ Lo que ya funciona

1. **Visualizar contraseña** - Haz clic en el ícono del ojo 👁️
2. **Validación de teléfono** - Solo acepta 10 dígitos numéricos
3. **Email de verificación** - Se envía automáticamente al registrarse
4. **Recuperación con código de 4 dígitos** - Sistema completo

## 🧪 Probar en Desarrollo

### 1. Recuperación de Contraseña

```bash
# Iniciar la app
npm start

# Flujo de prueba:
1. LoginScreen → "¿Olvidaste tu contraseña?"
2. Ingresar email: test@gmail.com
3. Ver código en consola de terminal (4 dígitos)
4. Ingresar código en la app
5. Crear nueva contraseña
6. Login con nueva contraseña
```

**Nota**: En desarrollo, el código se muestra en la consola porque no hay email configurado.

### 2. Email de Verificación

```bash
# Al registrarse, aparecerá notificación:
"¡Bienvenido a Gracia Sublime! 🎉
Tu cuenta ha sido creada exitosamente.

📧 Hemos enviado un correo de verificación a tu email.
Por favor revisa tu bandeja de entrada para confirmar tu cuenta."
```

## 📋 Para Usar en Producción

### Paso 1: Configurar Email (REQUERIDO)

**Opción A - Resend (Recomendado)**
```bash
npm install resend
```

Editar `src/services/passwordResetService.js` línea ~40:
```javascript
// Descomentar y agregar tu API key de Resend
await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${RESEND_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from: 'Gracia Sublime <noreply@gracasublime.com>',
    to: normalizedEmail,
    subject: 'Código de Recuperación',
    html: `<h1>${code}</h1>`
  })
});
```

### Paso 2: Configurar Supabase

1. Ir a: https://supabase.com/dashboard/project/toyyebhfidzhnjtvhhvq

2. **Authentication → Settings**
   - ✅ Enable email confirmations

3. **Authentication → URL Configuration**
   - Agregar: `gracasublime://verify-email`
   - Agregar: `gracasublime://reset-password`
   - Agregar: `exp://localhost:8081` (desarrollo)

4. **SQL Editor** - Ejecutar SQL de `SUPABASE_SQL_SETUP.md` sección 2

### Paso 3: Limpiar Código de Desarrollo

Editar `src/services/passwordResetService.js`:
```javascript
// ELIMINAR ESTA LÍNEA (línea 36-37):
devCode: __DEV__ ? code : undefined

// Cambiar a:
// (no devolver el código)
```

## 📄 Documentación Completa

| Archivo | Descripción |
|---------|-------------|
| `RESUMEN_CAMBIOS.md` | Resumen completo de todos los cambios |
| `CONFIGURACION_SUPABASE.md` | Configurar dashboard de Supabase |
| `SUPABASE_SQL_SETUP.md` | SQL y funciones para producción |

## 🐛 Solución de Problemas

### No llega el código de recuperación
✅ **En desarrollo**: Revisa la consola del terminal
✅ **En producción**: Verifica configuración de email

### Error al actualizar contraseña
✅ Ejecuta el SQL de `SUPABASE_SQL_SETUP.md`
✅ O usa Edge Function (recomendado)

### No llega email de verificación
✅ Verifica configuración en Supabase Dashboard
✅ Revisa carpeta de spam
✅ Configura SMTP personalizado

## 📞 Ayuda Adicional

- Ver logs en consola con `console.log`
- Revisar comentarios en el código
- Consultar documentación en archivos MD

## ⚡ Comandos Útiles

```bash
# Iniciar app
npm start

# Ver logs detallados
npx react-native log-android  # Android
npx react-native log-ios      # iOS

# Limpiar cache
npx expo start -c
```
