import { supabase } from '../config/supabase';

/**
 * Servicio de Direcciones
 * Maneja todas las operaciones relacionadas con direcciones de usuario
 */

// Obtener direcciones del usuario
export const getUserAddresses = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('address_id', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error obteniendo direcciones:', error);
    return { data: null, error };
  }
};

// Obtener dirección por ID
export const getAddressById = async (addressId) => {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('address_id', addressId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error obteniendo dirección:', error);
    return { data: null, error };
  }
};

// Crear nueva dirección
export const createAddress = async (userId, addressData) => {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .insert([{
        user_id: userId,
        ...addressData,
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creando dirección:', error);
    return { data: null, error };
  }
};

// Actualizar dirección
export const updateAddress = async (addressId, updates) => {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .update(updates)
      .eq('address_id', addressId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error actualizando dirección:', error);
    return { data: null, error };
  }
};

// Eliminar dirección
export const deleteAddress = async (addressId) => {
  try {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('address_id', addressId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error eliminando dirección:', error);
    return { error };
  }
};
