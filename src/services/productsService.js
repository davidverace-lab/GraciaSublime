import { supabase } from '../config/supabase';

/**
 * Servicio de Productos
 * Maneja todas las operaciones relacionadas con productos
 */

// Obtener todos los productos
export const getAllProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          category_id,
          name,
          description
        )
      `)
      .order('product_id', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    return { data: null, error };
  }
};

// Obtener producto por ID
export const getProductById = async (productId) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          category_id,
          name,
          description
        )
      `)
      .eq('product_id', productId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    return { data: null, error };
  }
};

// Obtener productos por categoría
export const getProductsByCategory = async (categoryId) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          category_id,
          name,
          description
        )
      `)
      .eq('category_id', categoryId)
      .order('product_id', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error obteniendo productos por categoría:', error);
    return { data: null, error };
  }
};

// Buscar productos por nombre
export const searchProducts = async (searchTerm) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          category_id,
          name,
          description
        )
      `)
      .ilike('name', `%${searchTerm}%`)
      .order('product_id', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error buscando productos:', error);
    return { data: null, error };
  }
};

// Crear producto (solo admin)
export const createProduct = async (productData) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creando producto:', error);
    return { data: null, error };
  }
};

// Actualizar producto (solo admin)
export const updateProduct = async (productId, updates) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('product_id', productId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error actualizando producto:', error);
    return { data: null, error };
  }
};

// Eliminar producto (solo admin)
export const deleteProduct = async (productId) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('product_id', productId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error eliminando producto:', error);
    return { error };
  }
};

// Obtener reseñas de un producto
export const getProductReviews = async (productId) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles (
          name
        )
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error obteniendo reseñas:', error);
    return { data: null, error };
  }
};

// Agregar reseña a un producto
export const addProductReview = async (productId, userId, rating, comment) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        product_id: productId,
        user_id: userId,
        rating,
        comment,
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error agregando reseña:', error);
    return { data: null, error };
  }
};
