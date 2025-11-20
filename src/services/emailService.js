/**
 * Servicio de Email
 * Maneja el envío de correos electrónicos usando Supabase Auth y EmailJS
 * Mucho más confiable y sin límites estrictos
 */

import { supabase } from '../config/supabase';
import { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY } from '@env';

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

/**
 * Enviar email con datos bancarios para transferencia
 * Usa EmailJS para envío personalizado
 */
export const sendBankTransferEmail = async (userEmail, userName, bankInfo, orderTotal) => {
  try {
    console.log('📧 Enviando datos bancarios a:', userEmail);

    const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID || 'service_1cqkwt9',
        template_id: 'template_bank_transfer', // Necesitarás crear este template en EmailJS
        user_id: EMAILJS_PUBLIC_KEY || '0GEWU_olXFLxsXNG5',
        template_params: {
          to_email: userEmail,
          to_name: userName || 'Cliente',
          bank_name: bankInfo.bank_name,
          account_number: bankInfo.account_number,
          clabe: bankInfo.clabe,
          beneficiary: bankInfo.beneficiary,
          reference: bankInfo.reference,
          amount: orderTotal,
        }
      })
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error('⚠️ Error enviando email con EmailJS:', errorData);
      throw new Error('Error al enviar email con datos bancarios');
    }

    console.log('✅ Email con datos bancarios enviado exitosamente');

    return {
      success: true,
      message: 'Datos bancarios enviados por email'
    };
  } catch (error) {
    console.error('❌ Error enviando email con datos bancarios:', error);

    // No fallar todo el proceso si el email falla
    return {
      success: false,
      error: error.message || 'Error al enviar email'
    };
  }
};
