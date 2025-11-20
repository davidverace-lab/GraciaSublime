import { supabase } from '../config/supabase';

/**
 * Servicio de Autenticación
 * Maneja todo lo relacionado con registro, login, logout y gestión de sesiones
 */

// Registrar nuevo usuario
export const signUp = async (email, password, name, phone) => {
  try {
    // Normalizar email y teléfono
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();

    // 1. Verificar si el email ya existe en la base de datos
    const { data: existingEmailUser, error: emailCheckError } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingEmailUser) {
      return {
        data: null,
        error: {
          message: 'Este correo electrónico ya está registrado. Por favor usa otro email o inicia sesión.'
        }
      };
    }

    // 2. Verificar si el teléfono ya existe en la base de datos
    const { data: existingPhoneUser, error: phoneCheckError } = await supabase
      .from('profiles')
      .select('phone')
      .eq('phone', normalizedPhone)
      .maybeSingle();

    if (existingPhoneUser) {
      return {
        data: null,
        error: {
          message: 'Este número de teléfono ya está registrado. Por favor usa otro teléfono.'
        }
      };
    }

    // 3. Crear usuario en auth.users
    // Supabase enviará automáticamente un email de verificación
    // El trigger on_auth_user_created creará automáticamente el perfil
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        // Configurar email de verificación
        emailRedirectTo: 'gracasublime://verify-email',
        // Los datos en 'data' se guardan en raw_user_meta_data
        // y el trigger los usa para crear el perfil
        data: {
          name: name.trim(),
          phone: normalizedPhone,
          email: normalizedEmail, // Incluir email en metadata para el trigger
        }
      }
    });

    if (authError) {
      // Mejorar mensajes de error
      if (authError.message.includes('already registered')) {
        authError.message = 'Este email ya está registrado. Por favor inicia sesión o usa otro email.';
      }
      if (authError.message.includes('User already registered')) {
        authError.message = 'Este email ya está registrado. Por favor inicia sesión.';
      }
      throw authError;
    }

    // 4. El perfil se crea automáticamente con el trigger on_auth_user_created
    // Ya no necesitamos hacer update manual
    // Solo esperamos un momento para asegurar que el trigger se ejecute
    if (authData.user) {
      // Pequeña pausa para asegurar que el trigger termine
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verificar que el perfil se haya creado correctamente
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (profileError || !profile) {
        console.error('⚠️ El perfil no se creó automáticamente, creándolo manualmente:', profileError);
        // Fallback: crear perfil manualmente si el trigger falló
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            name: name.trim(),
            phone: normalizedPhone,
            email: normalizedEmail,
          });

        if (insertError) {
          console.error('❌ Error creando perfil manualmente:', insertError);
        } else {
          console.log('✅ Perfil creado manualmente exitosamente');
        }
      } else {
        console.log('✅ Perfil creado automáticamente:', profile);
      }
    }

    console.log('✅ Usuario registrado. Email de verificación enviado a:', normalizedEmail);

    return { data: authData, error: null };
  } catch (error) {
    console.error('Error en signUp:', error);
    return { data: null, error };
  }
};

// Iniciar sesión (con email o teléfono)
export const signIn = async (emailOrPhone, password) => {
  try {
    const identifier = emailOrPhone.trim();

    // Detectar si es email o teléfono
    const isEmail = identifier.includes('@');

    let authResult;

    if (isEmail) {
      // Login con email
      authResult = await supabase.auth.signInWithPassword({
        email: identifier.toLowerCase(),
        password,
      });
    } else {
      // Login con teléfono - buscar el email asociado primero
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('phone', identifier)
        .maybeSingle();

      if (profileError || !profileData?.email) {
        throw new Error('No se encontró una cuenta con ese número de teléfono.');
      }

      // Luego hacer login con el email encontrado
      authResult = await supabase.auth.signInWithPassword({
        email: profileData.email.toLowerCase(),
        password,
      });
    }

    const { data, error } = authResult;

    if (error) {
      // Mejorar mensajes de error
      if (error.message.includes('Invalid login credentials')) {
        error.message = 'Email/teléfono o contraseña incorrectos. Por favor verifica tus credenciales.';
      } else if (error.message.includes('Email not confirmed')) {
        error.message = 'Por favor confirma tu email antes de iniciar sesión. Revisa tu bandeja de entrada.';
      }
      throw error;
    }

    // Si el login fue exitoso, verificar y sincronizar el email en el perfil si falta
    if (data?.user?.id && data?.user?.email) {
      const userEmail = data.user.email.toLowerCase();

      // Verificar si el perfil tiene el email
      const { data: profileCheck, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('id', data.user.id)
        .maybeSingle();

      // Si el perfil existe pero no tiene email, o el email está desactualizado, actualizarlo
      if (profileCheck && (!profileCheck.email || profileCheck.email !== userEmail)) {
        console.log('Sincronizando email en perfil después del login...');
        await supabase
          .from('profiles')
          .update({ email: userEmail })
          .eq('id', data.user.id);
        console.log('✅ Email sincronizado en perfil');
      }
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error en signIn:', error);
    return { data: null, error };
  }
};

// Cerrar sesión
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error en signOut:', error);
    return { error };
  }
};

// Obtener sesión actual
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { session, error: null };
  } catch (error) {
    console.error('Error obteniendo sesión:', error);
    return { session: null, error };
  }
};

// Obtener usuario actual
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { user, error: null };
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return { user: null, error };
  }
};

// Obtener perfil completo del usuario
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    return { data: null, error };
  }
};

// Actualizar perfil de usuario
export const updateUserProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    return { data: null, error };
  }
};

// Restablecer contraseña
export const resetPassword = async (email) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error restableciendo contraseña:', error);
    return { data: null, error };
  }
};

// Actualizar contraseña
export const updatePassword = async (newPassword) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error actualizando contraseña:', error);
    return { data: null, error };
  }
};

// Suscribirse a cambios de autenticación
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
};

// Sincronizar email de auth.users a profiles para un usuario específico
export const syncUserEmailToProfile = async (email) => {
  try {
    const normalizedEmail = email.trim().toLowerCase();

    // Primero intentar obtener el usuario actual
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log('No se pudo obtener el usuario actual para sincronización');
      return { success: false, error: 'Usuario no encontrado' };
    }

    // Verificar si el email coincide
    if (user.email?.toLowerCase() === normalizedEmail) {
      // Actualizar el perfil con el email
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ email: normalizedEmail })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error actualizando email en perfil:', updateError);
        return { success: false, error: updateError.message };
      }

      console.log('✅ Email sincronizado exitosamente en perfil');
      return { success: true };
    }

    return { success: false, error: 'Email no coincide con usuario actual' };
  } catch (error) {
    console.error('Error sincronizando email:', error);
    return { success: false, error: error.message };
  }
};
