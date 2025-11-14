import React, { createContext, useState, useContext, useEffect } from 'react';
import {
        getUserOrders,
        getOrderById,
        createOrder,
        updateOrderStatus,
        getAllOrders,
        cancelOrder,
} from '../services/ordersService';
import { useAuth } from './AuthContext';

const OrdersContext = createContext(undefined);

export const OrdersProvider = ({ children }) => {
        const { user, is_authenticated } = useAuth();
        const [orders, set_orders] = useState([]);
        const [loading, set_loading] = useState(false);

        // Cargar pedidos cuando el usuario se autentique
        useEffect(() => {
                if (is_authenticated && user?.id) {
                        load_orders();
                } else {
                        set_orders([]);
                }
        }, [is_authenticated, user?.id]);

        const load_orders = async () => {
                try {
                        set_loading(true);
                        const { data, error } = await getUserOrders(user.id);
                        if (error) throw error;
                        set_orders(data || []);
                } catch (error) {
                        console.error('Error al cargar pedidos:', error);
                } finally {
                        set_loading(false);
                }
        };

        // Obtener pedido por ID
        const get_order_by_id = async (orderId) => {
                try {
                        set_loading(true);
                        const { data, error } = await getOrderById(orderId);
                        if (error) throw error;
                        return { success: true, data };
                } catch (error) {
                        console.error('Error al obtener pedido:', error);
                        return { success: false, error: error.message };
                } finally {
                        set_loading(false);
                }
        };

        // Crear nuevo pedido
        const add_order = async (addressId, cartItems, totalPrice) => {
                try {
                        if (!is_authenticated || !user?.id) {
                                console.error('Usuario no autenticado');
                                return { success: false, error: 'Usuario no autenticado' };
                        }

                        set_loading(true);
                        const { data, error } = await createOrder(user.id, addressId, cartItems, totalPrice);
                        if (error) throw error;

                        // Recargar pedidos
                        await load_orders();
                        return { success: true, data };
                } catch (error) {
                        console.error('Error al crear pedido:', error);
                        return { success: false, error: error.message };
                } finally {
                        set_loading(false);
                }
        };

        // Actualizar estado del pedido (admin)
        const update_order_status = async (orderId, status) => {
                try {
                        set_loading(true);
                        const { data, error } = await updateOrderStatus(orderId, status);
                        if (error) throw error;

                        // Actualizar lista local
                        set_orders((prev) =>
                                prev.map((order) =>
                                        order.order_id === orderId ? { ...order, status } : order
                                )
                        );
                        return { success: true, data };
                } catch (error) {
                        console.error('Error al actualizar estado del pedido:', error);
                        return { success: false, error: error.message };
                } finally {
                        set_loading(false);
                }
        };

        // Cancelar pedido
        const cancel_order = async (orderId) => {
                try {
                        set_loading(true);
                        const { data, error } = await cancelOrder(orderId);
                        if (error) throw error;

                        // Actualizar lista local
                        set_orders((prev) =>
                                prev.map((order) =>
                                        order.order_id === orderId ? { ...order, status: 'cancelado' } : order
                                )
                        );
                        return { success: true, data };
                } catch (error) {
                        console.error('Error al cancelar pedido:', error);
                        return { success: false, error: error.message };
                } finally {
                        set_loading(false);
                }
        };

        // Obtener todos los pedidos (admin)
        const get_all_orders = async () => {
                try {
                        set_loading(true);
                        const { data, error } = await getAllOrders();
                        if (error) throw error;
                        return { success: true, data };
                } catch (error) {
                        console.error('Error al obtener todos los pedidos:', error);
                        return { success: false, error: error.message };
                } finally {
                        set_loading(false);
                }
        };

        return (
                <OrdersContext.Provider
                        value={{
                                orders,
                                loading,
                                add_order,
                                get_order_by_id,
                                update_order_status,
                                cancel_order,
                                get_all_orders,
                                reload_orders: load_orders,
                        }}
                >
                        {children}
                </OrdersContext.Provider>
        );
};

export const useOrders = () => {
        const context = useContext(OrdersContext);
        if (context === undefined) {
                throw new Error('useOrders debe ser usado dentro de OrdersProvider');
        }
        return context;
};
