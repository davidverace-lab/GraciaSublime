import { supabase } from '../config/supabase';

/**
 * Servicio de Notificaciones
 * Maneja todas las operaciones relacionadas con notificaciones de usuario
 */

// Obtener notificaciones del usuario
export const getUserNotifications = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    return { data: null, error };
  }
};

// Obtener notificaciones no leídas
export const getUnreadNotifications = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'no leída')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error obteniendo notificaciones no leídas:', error);
    return { data: null, error };
  }
};

// Crear notificación
export const createNotification = async (userId, message) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        message,
        status: 'no leída',
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creando notificación:', error);
    return { data: null, error };
  }
};

// Marcar notificación como leída
export const markAsRead = async (notificationId) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ status: 'leída' })
      .eq('notification_id', notificationId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error marcando notificación como leída:', error);
    return { data: null, error };
  }
};

// Marcar todas las notificaciones como leídas
export const markAllAsRead = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ status: 'leída' })
      .eq('user_id', userId)
      .eq('status', 'no leída')
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error marcando todas como leídas:', error);
    return { data: null, error };
  }
};

// Eliminar notificación
export const deleteNotification = async (notificationId) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('notification_id', notificationId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error eliminando notificación:', error);
    return { error };
  }
};

// Suscribirse a nuevas notificaciones en tiempo real
export const subscribeToNotifications = (userId, callback) => {
  const subscription = supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return subscription;
};

// Cancelar suscripción a notificaciones
export const unsubscribeFromNotifications = (subscription) => {
  if (subscription) {
    supabase.removeChannel(subscription);
  }
};
