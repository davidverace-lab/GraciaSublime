import { supabase } from '../config/supabase';

/**
 * Servicio de Diseños Prediseñados
 * Maneja todas las operaciones relacionadas con diseños
 */

// Obtener todos los diseños activos
export const getAllDesigns = async () => {
  try {
    const { data, error } = await supabase
      .from('designs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error obteniendo diseños:', error);
    return { data: null, error };
  }
};

// Obtener diseños por categoría
export const getDesignsByCategory = async (category) => {
  try {
    const { data, error } = await supabase
      .from('designs')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error obteniendo diseños por categoría:', error);
    return { data: null, error };
  }
};

// Obtener diseño por ID
export const getDesignById = async (designId) => {
  try {
    const { data, error } = await supabase
      .from('designs')
      .select('*')
      .eq('design_id', designId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error obteniendo diseño:', error);
    return { data: null, error };
  }
};

// Obtener categorías de diseños
export const getDesignCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('design_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error obteniendo categorías de diseños:', error);
    return { data: null, error };
  }
};

// Crear diseño (solo admin)
export const createDesign = async (designData) => {
  try {
    const { data, error } = await supabase
      .from('designs')
      .insert([designData])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data, error: null };
  } catch (error) {
    console.error('Error creando diseño:', error);
    return { success: false, data: null, error };
  }
};

// Actualizar diseño (solo admin)
export const updateDesign = async (designId, updates) => {
  try {
    const { data, error } = await supabase
      .from('designs')
      .update(updates)
      .eq('design_id', designId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data, error: null };
  } catch (error) {
    console.error('Error actualizando diseño:', error);
    return { success: false, data: null, error };
  }
};

// Eliminar diseño (solo admin)
export const deleteDesign = async (designId) => {
  try {
    const { error } = await supabase
      .from('designs')
      .delete()
      .eq('design_id', designId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error eliminando diseño:', error);
    return { error };
  }
};

// Desactivar diseño en lugar de eliminar (soft delete)
export const deactivateDesign = async (designId) => {
  try {
    const { error } = await supabase
      .from('designs')
      .update({ is_active: false })
      .eq('design_id', designId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error desactivando diseño:', error);
    return { error };
  }
};

export default {
  getAllDesigns,
  getDesignsByCategory,
  getDesignById,
  getDesignCategories,
  createDesign,
  updateDesign,
  deleteDesign,
  deactivateDesign,
};
