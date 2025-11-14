import { supabase } from '../config/supabase';

/**
 * Servicio de Carrito
 * Maneja todas las operaciones relacionadas con el carrito de compras
 */

// Obtener items del carrito del usuario
export const getCartItems = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('cart_items')
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
    console.error('Error obteniendo items del carrito:', error);
    return { data: null, error };
  }
};

// Agregar item al carrito
export const addToCart = async (userId, productId, quantity = 1) => {
  try {
    // Primero verificar si el producto ya está en el carrito
    const { data: existingItem, error: checkError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingItem) {
      // Si existe, actualizar cantidad
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('cart_item_id', existingItem.cart_item_id)
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
    } else {
      // Si no existe, crear nuevo item
      const { data, error } = await supabase
        .from('cart_items')
        .insert([{
          user_id: userId,
          product_id: productId,
          quantity,
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
    }
  } catch (error) {
    console.error('Error agregando al carrito:', error);
    return { data: null, error };
  }
};

// Actualizar cantidad de un item en el carrito
export const updateCartItemQuantity = async (cartItemId, quantity) => {
  try {
    if (quantity <= 0) {
      // Si la cantidad es 0 o menor, eliminar el item
      return await removeFromCart(cartItemId);
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('cart_item_id', cartItemId)
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
    console.error('Error actualizando cantidad:', error);
    return { data: null, error };
  }
};

// Eliminar item del carrito
export const removeFromCart = async (cartItemId) => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_item_id', cartItemId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error eliminando del carrito:', error);
    return { error };
  }
};

// Vaciar carrito del usuario
export const clearCart = async (userId) => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error vaciando carrito:', error);
    return { error };
  }
};

// Obtener total del carrito
export const getCartTotal = async (userId) => {
  try {
    const { data, error } = await getCartItems(userId);
    if (error) throw error;

    const total = data.reduce((sum, item) => {
      return sum + (item.products.price * item.quantity);
    }, 0);

    return { total, error: null };
  } catch (error) {
    console.error('Error calculando total del carrito:', error);
    return { total: 0, error };
  }
};
