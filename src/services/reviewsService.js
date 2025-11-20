import { supabase } from '../config/supabase';

/**
 * Servicio de Reseñas
 * Maneja todas las operaciones relacionadas con reseñas de pedidos
 */

/**
 * Crear una nueva reseña
 * @param {string} userId - ID del usuario
 * @param {number} orderId - ID del pedido
 * @param {number} productId - ID del producto
 * @param {number} rating - Calificación (1-5)
 * @param {string} comment - Comentario de la reseña
 */
export const createReview = async (userId, orderId, productId, rating, comment) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        user_id: userId,
        order_id: orderId,
        product_id: productId,
        rating: rating,
        comment: comment,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creando reseña:', error);
    return { data: null, error };
  }
};

/**
 * Obtener reseñas de un producto
 * @param {number} productId - ID del producto
 */
export const getProductReviews = async (productId) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        review_id,
        rating,
        comment,
        created_at,
        profiles (
          name
        )
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error obteniendo reseñas del producto:', error);
    return { data: null, error };
  }
};

/**
 * Verificar si un usuario ya dejó reseña para un pedido
 * @param {string} userId - ID del usuario
 * @param {number} orderId - ID del pedido
 */
export const hasUserReviewedOrder = async (userId, orderId) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('review_id')
      .eq('user_id', userId)
      .eq('order_id', orderId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return { hasReviewed: !!data, error: null };
  } catch (error) {
    console.error('Error verificando reseña:', error);
    return { hasReviewed: false, error };
  }
};

/**
 * Obtener reseñas de un usuario
 * @param {string} userId - ID del usuario
 */
export const getUserReviews = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        review_id,
        rating,
        comment,
        created_at,
        products (
          product_id,
          name,
          image_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error obteniendo reseñas del usuario:', error);
    return { data: null, error };
  }
};

/**
 * Actualizar una reseña existente
 * @param {number} reviewId - ID de la reseña
 * @param {number} rating - Nueva calificación
 * @param {string} comment - Nuevo comentario
 */
export const updateReview = async (reviewId, rating, comment) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .update({
        rating: rating,
        comment: comment,
      })
      .eq('review_id', reviewId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error actualizando reseña:', error);
    return { data: null, error };
  }
};

/**
 * Eliminar una reseña
 * @param {number} reviewId - ID de la reseña
 */
export const deleteReview = async (reviewId) => {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('review_id', reviewId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error eliminando reseña:', error);
    return { error };
  }
};

export default {
  createReview,
  getProductReviews,
  hasUserReviewedOrder,
  getUserReviews,
  updateReview,
  deleteReview,
};
