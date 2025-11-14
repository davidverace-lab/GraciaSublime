import React, { createContext, useState, useContext, useEffect } from 'react';
import {
        getUserNotifications,
        getUnreadNotifications,
        createNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        subscribeToNotifications,
        unsubscribeFromNotifications,
} from '../services/notificationsService';
import { useAuth } from './AuthContext';

const NotificationsContext = createContext(undefined);

export const NotificationsProvider = ({ children }) => {
        const { user, is_authenticated } = useAuth();
        const [notifications, set_notifications] = useState([]);
        const [loading, set_loading] = useState(false);

        // Cargar notificaciones y suscribirse a cambios cuando el usuario se autentique
        useEffect(() => {
                if (is_authenticated && user?.id) {
                        load_notifications();

                        // Suscribirse a nuevas notificaciones en tiempo real
                        const subscription = subscribeToNotifications(user.id, (newNotification) => {
                                console.log('Nueva notificación:', newNotification);
                                set_notifications((prev) => [newNotification, ...prev]);
                        });

                        return () => {
                                unsubscribeFromNotifications(subscription);
                        };
                } else {
                        set_notifications([]);
                }
        }, [is_authenticated, user?.id]);

        const load_notifications = async () => {
                try {
                        set_loading(true);
                        const { data, error } = await getUserNotifications(user.id);
                        if (error) throw error;
                        set_notifications(data || []);
                } catch (error) {
                        console.error('Error al cargar notificaciones:', error);
                } finally {
                        set_loading(false);
                }
        };

        // Agregar notificación
        const add_notification = async (message) => {
                try {
                        if (!is_authenticated || !user?.id) {
                                // Silenciar el error en la consola para evitar spam
                                return { success: false, error: 'Usuario no autenticado' };
                        }

                        set_loading(true);
                        const { data, error } = await createNotification(user.id, message);
                        if (error) throw error;

                        // Actualizar lista local
                        set_notifications((prev) => [data, ...prev]);
                        return { success: true, data };
                } catch (error) {
                        console.error('Error al agregar notificación:', error);
                        return { success: false, error: error.message };
                } finally {
                        set_loading(false);
                }
        };

        // Marcar como leída
        const mark_as_read = async (notification_id) => {
                try {
                        set_loading(true);
                        const { error } = await markAsRead(notification_id);
                        if (error) throw error;

                        // Actualizar lista local
                        set_notifications((prev) =>
                                prev.map((notif) =>
                                        notif.notification_id === notification_id
                                                ? { ...notif, status: 'leída' }
                                                : notif
                                )
                        );
                        return { success: true };
                } catch (error) {
                        console.error('Error al marcar como leída:', error);
                        return { success: false, error: error.message };
                } finally {
                        set_loading(false);
                }
        };

        // Marcar todas como leídas
        const mark_all_as_read = async () => {
                try {
                        if (!is_authenticated || !user?.id) {
                                // Silenciar el error en la consola para evitar spam
                                return { success: false, error: 'Usuario no autenticado' };
                        }

                        set_loading(true);
                        const { error } = await markAllAsRead(user.id);
                        if (error) throw error;

                        // Actualizar lista local
                        set_notifications((prev) =>
                                prev.map((notif) => ({ ...notif, status: 'leída' }))
                        );
                        return { success: true };
                } catch (error) {
                        console.error('Error al marcar todas como leídas:', error);
                        return { success: false, error: error.message };
                } finally {
                        set_loading(false);
                }
        };

        // Eliminar notificación
        const delete_notification_fn = async (notification_id) => {
                try {
                        set_loading(true);
                        const { error } = await deleteNotification(notification_id);
                        if (error) throw error;

                        // Actualizar lista local
                        set_notifications((prev) =>
                                prev.filter((notif) => notif.notification_id !== notification_id)
                        );
                        return { success: true };
                } catch (error) {
                        console.error('Error al eliminar notificación:', error);
                        return { success: false, error: error.message };
                } finally {
                        set_loading(false);
                }
        };

        // Obtener conteo de no leídas
        const get_unread_count = () => {
                return notifications.filter((notif) => notif.status === 'no leída').length;
        };

        return (
                <NotificationsContext.Provider
                        value={{
                                notifications,
                                loading,
                                add_notification,
                                mark_as_read,
                                mark_all_as_read,
                                delete_notification: delete_notification_fn,
                                get_unread_count,
                                reload_notifications: load_notifications,
                        }}
                >
                        {children}
                </NotificationsContext.Provider>
        );
};

export const useNotifications = () => {
        const context = useContext(NotificationsContext);
        if (context === undefined) {
                throw new Error('useNotifications debe ser usado dentro de NotificationsProvider');
        }
        return context;
};
