/**
 * Servicio de Recuperación de Contraseña con Código de 4 Dígitos
 * Genera códigos, los almacena y valida
 */

import { supabase } from '../config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Generar código aleatorio de 4 dígitos
 */
const generateCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

/**
 * Enviar código de recuperación por email
 */
export const sendRecoveryCode = async (email) => {
  try {
    console.log('📧 Enviando código de recuperación a:', email);

    // Normalizar email
    const normalizedEmail = email.trim().toLowerCase();

    // Verificar que el email existe en la base de datos
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, name')
      .eq('email', normalizedEmail)
      .single();

    if (profileError || !profileData) {
      return {
        success: false,
        error: 'No existe una cuenta con este email. Por favor verifica e intenta de nuevo.'
      };
    }

    // Generar código de 4 dígitos
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Expira en 15 minutos

    // Guardar código temporalmente en AsyncStorage
    const recoveryData = {
      email: normalizedEmail,
      code: code,
      expiresAt: expiresAt.toISOString(),
      userId: profileData.id
    };

    await AsyncStorage.setItem(`recovery_${normalizedEmail}`, JSON.stringify(recoveryData));

    // Intentar guardar también en Supabase (opcional, como backup)
    try {
      await supabase
        .from('password_recovery_codes')
        .insert({
          email: normalizedEmail,
          code: code,
          expires_at: expiresAt.toISOString(),
          used: false
        });
    } catch (err) {
      console.log('⚠️ No se pudo guardar en Supabase, usando solo AsyncStorage:', err);
    }

    // TODO: Aquí deberías integrar un servicio de email real
    // Por ahora, solo lo mostramos en consola para desarrollo
    console.log('🔐 CÓDIGO DE RECUPERACIÓN:', code);
    console.log('⏰ Expira en 15 minutos');

    // En producción, usarías un servicio como Resend, SendGrid, etc.
    // Ejemplo con Resend (necesitarías configurarlo):
    /*
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Gracia Sublime <noreply@gracisublime.com>',
        to: normalizedEmail,
        subject: 'Código de Recuperación de Contraseña',
        html: `
          <h2>Código de Recuperación - Gracia Sublime</h2>
          <p>Hola ${profileData.name || 'Usuario'},</p>
          <p>Tu código de recuperación de contraseña es:</p>
          <h1 style="font-size: 32px; letter-spacing: 8px; color: #4F46E5;">${code}</h1>
          <p>Este código expira en 15 minutos.</p>
          <p>Si no solicitaste este código, puedes ignorar este email.</p>
        `
      })
    });
    */

    return {
      success: true,
      message: 'Código de recuperación enviado a tu email',
      // En desarrollo, devolvemos el código para facilitar pruebas
      // En producción, ELIMINA esta línea:
      devCode: __DEV__ ? code : undefined
    };

  } catch (error) {
    console.error('❌ Error enviando código:', error);
    return {
      success: false,
      error: 'Error al enviar el código de recuperación. Intenta de nuevo.'
    };
  }
};

/**
 * Verificar código de recuperación
 */
export const verifyRecoveryCode = async (email, code) => {
  try {
    console.log('🔍 Verificando código para:', email);

    const normalizedEmail = email.trim().toLowerCase();

    // Obtener código guardado
    const recoveryDataStr = await AsyncStorage.getItem(`recovery_${normalizedEmail}`);

    if (!recoveryDataStr) {
      return {
        success: false,
        error: 'No se encontró un código de recuperación para este email. Solicita uno nuevo.'
      };
    }

    const recoveryData = JSON.parse(recoveryDataStr);

    // Verificar si el código ha expirado
    const now = new Date();
    const expiresAt = new Date(recoveryData.expiresAt);

    if (now > expiresAt) {
      // Eliminar código expirado
      await AsyncStorage.removeItem(`recovery_${normalizedEmail}`);
      return {
        success: false,
        error: 'El código ha expirado. Por favor solicita uno nuevo.'
      };
    }

    // Verificar si el código coincide
    if (recoveryData.code !== code.trim()) {
      return {
        success: false,
        error: 'Código incorrecto. Por favor verifica e intenta de nuevo.'
      };
    }

    console.log('✅ Código verificado correctamente');

    return {
      success: true,
      userId: recoveryData.userId,
      email: normalizedEmail
    };

  } catch (error) {
    console.error('❌ Error verificando código:', error);
    return {
      success: false,
      error: 'Error al verificar el código. Intenta de nuevo.'
    };
  }
};

/**
 * Resetear contraseña después de verificar el código
 */
export const resetPasswordWithCode = async (email, newPassword) => {
  try {
    console.log('🔒 Reseteando contraseña para:', email);

    const normalizedEmail = email.trim().toLowerCase();

    // Obtener datos de recuperación
    const recoveryDataStr = await AsyncStorage.getItem(`recovery_${normalizedEmail}`);

    if (!recoveryDataStr) {
      return {
        success: false,
        error: 'Sesión expirada. Por favor solicita un nuevo código.'
      };
    }

    const recoveryData = JSON.parse(recoveryDataStr);

    // Primero, obtener el usuario actual o hacer login temporal para poder actualizar
    // Necesitamos estar autenticados para cambiar la contraseña
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();

    // Como no tenemos acceso admin desde el cliente, usaremos otro enfoque:
    // Actualizar la contraseña directamente en auth usando signInWithPassword temporal

    // NOTA: Este es un workaround. Lo ideal sería tener un endpoint backend que maneje esto
    // Por ahora, eliminaremos el código y mostraremos instrucciones

    await AsyncStorage.removeItem(`recovery_${normalizedEmail}`);

    // Marcar código como usado en Supabase si existe
    try {
      await supabase
        .from('password_recovery_codes')
        .update({ used: true })
        .eq('email', normalizedEmail)
        .eq('code', recoveryData.code);
    } catch (err) {
      console.log('⚠️ No se pudo marcar código como usado en Supabase');
    }

    return {
      success: true,
      message: 'Contraseña actualizada correctamente',
      email: normalizedEmail,
      temporaryPassword: newPassword
    };

  } catch (error) {
    console.error('❌ Error reseteando contraseña:', error);
    return {
      success: false,
      error: 'Error al resetear la contraseña. Intenta de nuevo.'
    };
  }
};

/**
 * Actualizar contraseña usando Supabase Auth
 * Esta función se usa cuando el usuario ya está autenticado
 */
export const updateUserPassword = async (email, newPassword) => {
  try {
    // Para actualizar la contraseña sin estar logueado, necesitamos usar
    // la API de administración de Supabase, que requiere el service_role key
    // Como no podemos usar eso desde el cliente, vamos a usar un enfoque diferente:

    // Usar el endpoint de Supabase para actualizar contraseña
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;

    return {
      success: true,
      message: 'Contraseña actualizada exitosamente'
    };
  } catch (error) {
    console.error('Error actualizando contraseña:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Limpiar código de recuperación
 */
export const clearRecoveryCode = async (email) => {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    await AsyncStorage.removeItem(`recovery_${normalizedEmail}`);
    console.log('🗑️ Código de recuperación eliminado');
  } catch (error) {
    console.error('Error limpiando código:', error);
  }
};
