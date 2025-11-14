import { supabase } from '../config/supabase';

/**
 * Servicio de Pedidos
 * Maneja todas las operaciones relacionadas con pedidos
 */

// Obtener pedidos del usuario
export const getUserOrders = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        addresses (
          address_id,
          street,
          number,
          city,
          state,
          postal_code
        ),
        order_items (
          order_item_id,
          quantity,
          price,
          products (
            product_id,
            name,
            description,
            image_url
          )
        )
      `)
      .eq('user_id', userId)
      .order('order_date', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error obteniendo pedidos:', error);
    return { data: null, error };
  }
};

// Obtener pedido por ID
export const getOrderById = async (orderId) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        addresses (
          address_id,
          street,
          number,
          city,
          state,
          postal_code
        ),
        order_items (
          order_item_id,
          quantity,
          price,
          products (
            product_id,
            name,
            description,
            image_url
          )
        ),
        payments (
          payment_id,
          payment_method,
          payment_status,
          transaction_id,
          amount,
          payment_date
        )
      `)
      .eq('order_id', orderId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error obteniendo pedido:', error);
    return { data: null, error };
  }
};

// Crear nuevo pedido
export const createOrder = async (userId, addressId, cartItems, totalPrice) => {
  try {
    // 1. Crear el pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: userId,
        address_id: addressId,
        status: 'pendiente',
        total_price: totalPrice,
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Crear los items del pedido
    const orderItems = cartItems.map(item => ({
      order_id: order.order_id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.products.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // 3. Limpiar el carrito
    const { error: clearError } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (clearError) throw clearError;

    return { data: order, error: null };
  } catch (error) {
    console.error('Error creando pedido:', error);
    return { data: null, error };
  }
};

// Actualizar estado del pedido (admin)
export const updateOrderStatus = async (orderId, status) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('order_id', orderId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error actualizando estado del pedido:', error);
    return { data: null, error };
  }
};

// Obtener todos los pedidos (admin)
export const getAllOrders = async () => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        profiles (
          name,
          phone
        ),
        addresses (
          address_id,
          street,
          number,
          city,
          state,
          postal_code
        ),
        order_items (
          order_item_id,
          quantity,
          price,
          products (
            product_id,
            name,
            description,
            image_url
          )
        )
      `)
      .order('order_date', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error obteniendo todos los pedidos:', error);
    return { data: null, error };
  }
};

// Cancelar pedido
export const cancelOrder = async (orderId) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'cancelado' })
      .eq('order_id', orderId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error cancelando pedido:', error);
    return { data: null, error };
  }
};

// Obtener estadísticas de pedidos (admin)
export const getOrderStats = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISOString = today.toISOString();

    // Pedidos de hoy
    const { data: todayOrders, error: todayError } = await supabase
      .from('orders')
      .select('total_price')
      .gte('order_date', todayISOString);

    if (todayError) throw todayError;

    // Calcular ventas de hoy
    const todaySales = todayOrders.reduce((sum, order) => sum + (order.total_price || 0), 0);

    // Pedidos pendientes
    const { count: pendingOrders, error: pendingError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pendiente');

    if (pendingError) throw pendingError;

    return {
      data: {
        todaySales,
        todayOrders: todayOrders.length,
        pendingOrders: pendingOrders || 0
      },
      error: null
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas de pedidos:', error);
    return {
      data: {
        todaySales: 0,
        todayOrders: 0,
        pendingOrders: 0
      },
      error
    };
  }
};
