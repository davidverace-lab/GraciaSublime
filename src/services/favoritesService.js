import { supabase } from '../config/supabase';

/**
 * Servicio de Favoritos
 * Maneja todas las operaciones relacionadas con productos favoritos
 */

// Obtener favoritos del usuario
export const getFavorites = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        products (
          product_id,
          name,
          description,
          price,
          image_url,
          category_id
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error obteniendo favoritos:', error);
    return { data: null, error };
  }
};

// Agregar producto a favoritos
export const addToFavorites = async (userId, productId) => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .insert([{
        user_id: userId,
        product_id: productId,
      }])
      .select(`
        *,
        products (
          product_id,
          name,
          description,
          price,
          image_url,
          category_id
        )
      `)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error agregando a favoritos:', error);
    return { data: null, error };
  }
};

// Eliminar producto de favoritos
export const removeFromFavorites = async (userId, productId) => {
  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error eliminando de favoritos:', error);
    return { error };
  }
};

// Verificar si un producto está en favoritos
export const isInFavorites = async (userId, productId) => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('favorite_id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (error) throw error;
    return { isFavorite: !!data, error: null };
  } catch (error) {
    console.error('Error verificando favorito:', error);
    return { isFavorite: false, error };
  }
};

// Alternar favorito (agregar si no está, eliminar si está)
export const toggleFavorite = async (userId, productId) => {
  try {
    const { isFavorite, error: checkError } = await isInFavorites(userId, productId);
    if (checkError) throw checkError;

    if (isFavorite) {
      return await removeFromFavorites(userId, productId);
    } else {
      return await addToFavorites(userId, productId);
    }
  } catch (error) {
    console.error('Error alternando favorito:', error);
    return { data: null, error };
  }
};
