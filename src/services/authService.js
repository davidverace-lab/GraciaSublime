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
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        // Configurar email de verificación
        emailRedirectTo: 'gracasublime://verify-email',
        data: {
          name: name,
          phone: normalizedPhone,
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

    // 4. Actualizar perfil con información adicional
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ name, phone: normalizedPhone })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error('Error actualizando perfil:', profileError);
        // No lanzar error aquí, el usuario ya fue creado
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
