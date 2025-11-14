import { supabase } from '../config/supabase';

/**
 * Servicio de Pagos
 * Maneja todas las operaciones relacionadas con pagos
 */

// Crear registro de pago
export const createPayment = async (orderId, paymentData) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert([{
        order_id: orderId,
        payment_method: paymentData.payment_method,
        payment_status: paymentData.payment_status || 'pendiente',
        transaction_id: paymentData.transaction_id,
        amount: paymentData.amount,
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creando pago:', error);
    return { data: null, error };
  }
};

// Obtener pago por ID de pedido
export const getPaymentByOrderId = async (orderId) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error obteniendo pago:', error);
    return { data: null, error };
  }
};

// Actualizar estado del pago
export const updatePaymentStatus = async (paymentId, status) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .update({ payment_status: status })
      .eq('payment_id', paymentId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error actualizando estado del pago:', error);
    return { data: null, error };
  }
};

// Obtener historial de pagos del usuario
export const getUserPayments = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        orders (
          order_id,
          order_date,
          status,
          total_price
        )
      `)
      .eq('orders.user_id', userId)
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error obteniendo historial de pagos:', error);
    return { data: null, error };
  }
};

// Obtener todos los pagos (admin)
export const getAllPayments = async () => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        orders (
          order_id,
          order_date,
          status,
          total_price,
          profiles (
            name,
            phone
          )
        )
      `)
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error obteniendo todos los pagos:', error);
    return { data: null, error };
  }
};
