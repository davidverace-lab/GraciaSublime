import { supabase } from '../config/supabase';

/**
 * Servicio de Usuarios
 * Maneja todas las operaciones relacionadas con usuarios (para admin)
 */

// Obtener todos los usuarios
export const getAllUsers = async () => {
  try {
    console.log('🔍 usersService: Solicitando usuarios desde profiles...');

    // Seleccionar todos los campos incluyendo email
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name', { ascending: true, nullsFirst: false });

    if (error) {
      console.error('❌ usersService: Error de Supabase:', error);
      throw error;
    }

    console.log(`✅ usersService: ${data?.length || 0} usuarios encontrados`);
    if (data && data.length > 0) {
      console.log('📊 Primer usuario:', JSON.stringify(data[0]));
    }

    return { data, error: null };
  } catch (error) {
    console.error('❌ usersService: Error obteniendo usuarios:', error);
    console.error('Error completo:', JSON.stringify(error));
    return { data: null, error };
  }
};

// Obtener usuario por ID
export const getUserById = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return { data: null, error };
  }
};

// Buscar usuarios por nombre o email
export const searchUsers = async (searchTerm) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error buscando usuarios:', error);
    return { data: null, error };
  }
};

// Actualizar usuario (solo admin)
export const updateUser = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    return { data: null, error };
  }
};

// Eliminar usuario (solo admin)
export const deleteUser = async (userId) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    return { error };
  }
};

// Obtener estadísticas de usuarios
export const getUserStats = async () => {
  try {
    // Total de usuarios
    const { count: totalUsers, error: totalError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    // Usuarios nuevos hoy - solo si existe la columna created_at
    let newUsersToday = 0;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISOString = today.toISOString();

      const { count, error: newError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayISOString);

      if (!newError) {
        newUsersToday = count || 0;
      }
    } catch (dateError) {
      // Si falla porque no existe created_at, simplemente devolver 0
      console.log('Column created_at no existe aún, devolviendo 0 usuarios nuevos');
    }

    return {
      data: {
        totalUsers: totalUsers || 0,
        newUsersToday: newUsersToday
      },
      error: null
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas de usuarios:', error);
    return { data: { totalUsers: 0, newUsersToday: 0 }, error };
  }
};
