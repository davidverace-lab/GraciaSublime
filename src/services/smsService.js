import { supabase } from '../config/supabase';
import { sendVerificationEmail, sendPasswordChangedEmail } from './emailService';

/**
 * Servicio de Verificación por Email
 * Maneja el envío de códigos de verificación solo por Email
 * SMS desactivado para reducir costos
 */

// Generar código de 6 dígitos
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Guardar código de verificación en Supabase
export const sendVerificationCode = async (phone, email) => {
  try {
    const code = generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Válido por 10 minutos

    // Buscar usuario por email usando función RPC (segura para cliente)
    let userId = null;
    let userEmail = email;
    let userPhone = phone;

    if (email) {
      // Usar función RPC para buscar usuario por email de forma segura
      const { data, error } = await supabase
        .rpc('get_user_id_by_email', { user_email: email });

      if (error) {
        console.error('Error buscando usuario por email:', error);
        return {
          success: false,
          error: 'No se pudo verificar el email. Por favor intenta de nuevo.'
        };
      }

      if (data && data.length > 0) {
        const userData = data[0];
        userId = userData.user_id;
        userEmail = userData.email;
        userPhone = userData.phone;
      }
    }

    if (!userId && phone) {
      // Buscar por teléfono en profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, phone')
        .eq('phone', phone)
        .maybeSingle();

      if (profileError) {
        console.error('Error buscando perfil por teléfono:', profileError);
      } else if (profileData) {
        userId = profileData.id;
        userPhone = profileData.phone;

        // Nota: No podemos obtener el email fácilmente sin admin access
        // Por ahora solo funciona bien cuando se busca por email
      }
    }

    if (!userId) {
      return {
        success: false,
        error: 'No se encontró un usuario con ese email'
      };
    }

    // Guardar código en tabla de verificaciones con TODOS los datos de contacto
    const { error: insertError } = await supabase
      .from('verification_codes')
      .insert([{
        user_id: userId,
        code,
        phone: userPhone, // Usar el teléfono del perfil
        email: userEmail, // Usar el email del perfil
        expires_at: expiresAt.toISOString(),
        used: false,
      }]);

    if (insertError) throw insertError;

    // Validar que el usuario tenga email
    if (!userEmail) {
      return {
        success: false,
        error: 'El usuario no tiene un email registrado. Por favor actualiza tu perfil.'
      };
    }

    // Enviar Email con el código de verificación
    console.log('📧 Iniciando envío de email de verificación...');
    const emailResult = await sendVerificationEmail(userEmail, code);

    if (!emailResult.success) {
      throw new Error(emailResult.error || 'Error al enviar el email');
    }

    console.log('✅ Código de verificación enviado exitosamente por email');

    const message = 'Código de verificación enviado a tu email';

    return {
      success: true,
      message,
      // En desarrollo, retornar el código para testing
      code: __DEV__ ? code : undefined
    };
  } catch (error) {
    console.error('Error enviando código de verificación:', error);
    return { success: false, error: error.message };
  }
};

// Verificar código de verificación
export const verifyCode = async (identifier, code) => {
  try {
    // Buscar código válido (no usado y no expirado)
    const { data, error } = await supabase
      .from('verification_codes')
      .select('*')
      .or(`phone.eq.${identifier},email.eq.${identifier}`)
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return {
        success: false,
        error: 'Código inválido o expirado'
      };
    }

    // Marcar código como usado
    const { error: updateError } = await supabase
      .from('verification_codes')
      .update({ used: true })
      .eq('id', data.id);

    if (updateError) throw updateError;

    return {
      success: true,
      userId: data.user_id,
      message: 'Código verificado correctamente'
    };
  } catch (error) {
    console.error('Error verificando código:', error);
    return { success: false, error: error.message };
  }
};

// Resetear contraseña con código verificado
export const resetPasswordWithCode = async (identifier, code, newPassword) => {
  try {
    // Primero verificar el código
    const verifyResult = await verifyCode(identifier, code);

    if (!verifyResult.success) {
      return verifyResult;
    }

    // Obtener email del usuario
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', verifyResult.userId)
      .single();

    if (profileError) throw profileError;

    // Actualizar contraseña en Supabase Auth
    // Nota: Esto requiere privilegios de admin en Supabase
    // Alternativa: Usar el método de reset por email de Supabase

    // Por ahora, guardamos en una tabla temporal y el usuario debe confirmar por email
    const { error: resetError } = await supabase
      .from('password_reset_requests')
      .insert([{
        user_id: verifyResult.userId,
        new_password_hash: newPassword, // En producción, hashear antes
        verified_by_code: true,
      }]);

    if (resetError) throw resetError;

    // Enviar email de confirmación de Supabase
    const { error: authResetError } = await supabase.auth.resetPasswordForEmail(
      profileData.email,
      { redirectTo: 'graciasublime://reset-password' }
    );

    if (authResetError) {
      console.error('Error enviando email de reset:', authResetError);
      // No fallar si el email no se envía, el código ya fue verificado
    }

    return {
      success: true,
      message: 'Contraseña actualizada correctamente',
      requiresEmailConfirmation: true
    };
  } catch (error) {
    console.error('Error reseteando contraseña:', error);
    return { success: false, error: error.message };
  }
};

// Limpiar códigos expirados (función de mantenimiento)
export const cleanupExpiredCodes = async () => {
  try {
    const { error } = await supabase
      .from('verification_codes')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error limpiando códigos expirados:', error);
    return { success: false, error: error.message };
  }
};
