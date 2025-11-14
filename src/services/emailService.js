/**
 * Servicio de Email
 * Maneja el envío de correos electrónicos usando Supabase Auth
 * Mucho más confiable y sin límites estrictos
 */

import { supabase } from '../config/supabase';

/**
 * Enviar email de reset de contraseña usando Supabase Auth
 * Supabase maneja automáticamente el envío del email con un link mágico
 */
export const sendPasswordResetEmail = async (email) => {
  try {
    console.log('📧 Enviando email de reset a:', email);

    // Supabase envía automáticamente el email con un link para resetear
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'gracasublime://reset-password', // Deep link para tu app
    });

    if (error) {
      console.error('❌ Error de Supabase:', error);
      throw error;
    }

    console.log('✅ Email de reset enviado exitosamente via Supabase');

    return {
      success: true,
      message: 'Te hemos enviado un email con instrucciones para restablecer tu contraseña'
    };
  } catch (error) {
    console.error('❌ Error enviando email de reset:', error);

    return {
      success: false,
      error: error.message || 'Error al enviar el email de recuperación'
    };
  }
};

/**
 * Verificar email de usuario (envía automáticamente el email de verificación)
 * Se usa después del registro
 */
export const sendVerificationEmail = async (email) => {
  try {
    console.log('📧 Enviando email de verificación a:', email);

    // Reenviar email de verificación
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    if (error) {
      console.error('❌ Error al enviar verificación:', error);
      throw error;
    }

    console.log('✅ Email de verificación enviado');

    return {
      success: true,
      message: 'Email de verificación enviado'
    };
  } catch (error) {
    console.error('❌ Error:', error);

    return {
      success: false,
      error: error.message || 'Error al enviar email de verificación'
    };
  }
};

/**
 * Actualizar contraseña del usuario autenticado
 * Supabase envía automáticamente un email de confirmación
 */
export const updatePassword = async (newPassword) => {
  try {
    console.log('🔒 Actualizando contraseña...');

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error('❌ Error actualizando contraseña:', error);
      throw error;
    }

    console.log('✅ Contraseña actualizada exitosamente');

    return {
      success: true,
      message: 'Contraseña actualizada correctamente'
    };
  } catch (error) {
    console.error('❌ Error:', error);

    return {
      success: false,
      error: error.message || 'Error al actualizar la contraseña'
    };
  }
};

/**
 * NOTA: Supabase maneja automáticamente:
 * - Envío de emails de verificación al registrarse
 * - Envío de emails de reset de contraseña
 * - Envío de emails de confirmación de cambios
 * - Rate limiting para prevenir spam
 * - Plantillas personalizables desde el dashboard
 *
 * Configura las plantillas en:
 * https://supabase.com/dashboard/project/YOUR_PROJECT/auth/templates
 */
