import { supabase } from '../config/supabase';

/**
 * Servicio de Categorías
 * Maneja todas las operaciones relacionadas con categorías
 */

// Obtener todas las categorías
export const getAllCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('category_id', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    return { data: null, error };
  }
};

// Obtener categoría por ID
export const getCategoryById = async (categoryId) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('category_id', categoryId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error obteniendo categoría:', error);
    return { data: null, error };
  }
};

// Crear categoría (solo admin)
export const createCategory = async (categoryData) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creando categoría:', error);
    return { data: null, error };
  }
};

// Actualizar categoría (solo admin)
export const updateCategory = async (categoryId, updates) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('category_id', categoryId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error actualizando categoría:', error);
    return { data: null, error };
  }
};

// Eliminar categoría (solo admin)
export const deleteCategory = async (categoryId) => {
  try {
    // Verificar si hay productos en esta categoría
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId);

    if (countError) throw countError;

    if (count > 0) {
      return {
        error: {
          message: `No se puede eliminar la categoría porque tiene ${count} producto(s) asociado(s)`
        }
      };
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('category_id', categoryId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error eliminando categoría:', error);
    return { error };
  }
};

// Obtener categoría con productos
export const getCategoryWithProducts = async (categoryId) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        *,
        products (
          *
        )
      `)
      .eq('category_id', categoryId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error obteniendo categoría con productos:', error);
    return { data: null, error };
  }
};

// Obtener categorías con conteo de productos
export const getCategoriesWithProductCount = async () => {
  try {
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select(`
        *,
        products:products(count)
      `)
      .order('name', { ascending: true });

    if (categoriesError) throw categoriesError;

    // Transformar para facilitar el uso
    const categoriesWithCount = categories.map(cat => ({
      ...cat,
      productCount: cat.products?.[0]?.count || 0
    }));

    return { data: categoriesWithCount, error: null };
  } catch (error) {
    console.error('Error obteniendo categorías con conteo:', error);
    return { data: null, error };
  }
};
