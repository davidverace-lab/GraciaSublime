import React, { createContext, useState, useContext, useEffect } from 'react';
import {
        getCartItems,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        clearCart as clearCartService,
        getCartTotal,
} from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext(undefined);

export const CartProvider = ({ children }) => {
        const { user, is_authenticated } = useAuth();
        const [cart_items, set_cart_items] = useState([]);
        const [loading, set_loading] = useState(false);

        // Cargar carrito cuando el usuario se autentique
        useEffect(() => {
                if (is_authenticated && user?.id) {
                        load_cart();
                } else {
                        set_cart_items([]);
                }
        }, [is_authenticated, user?.id]);

        const load_cart = async () => {
                try {
                        set_loading(true);
                        const { data, error } = await getCartItems(user.id);
                        if (error) throw error;
                        set_cart_items(data || []);
                } catch (error) {
                        console.error('Error al cargar carrito:', error);
                }
                finally {
                        set_loading(false);
                }
        };

        // Agregar producto al carrito
        const add_to_cart = async (product, quantity = 1, customization = null) => {
                try {
                        if (!is_authenticated || !user?.id) {
                                console.error('Usuario no autenticado');
                                return { success: false, error: 'Debes iniciar sesión para agregar al carrito' };
                        }

                        console.log('🛒 CartContext - Personalización recibida:', customization);

                        set_loading(true);

                        // Extraer variant_id si existe en el producto
                        const variant_id = product.variant_id || null;
                        const product_id = product.product_id || product.id;

                        console.log('📤 Enviando a cartService:', { user_id: user.id, product_id, quantity, variant_id, customization });

                        const { data, error } = await addToCart(user.id, product_id, quantity, variant_id, customization);
                        if (error) throw error;

                        console.log('📥 Respuesta de cartService:', data);

                        // Recargar carrito para obtener datos actualizados
                        await load_cart();
                        return { success: true, data };
                } catch (error) {
                        console.error('Error al agregar al carrito:', error);
                        return { success: false, error: error.message };
                } finally {
                        set_loading(false);
                }
        };

        // Remover producto del carrito
        const remove_from_cart = async (cart_item_id) => {
                try {
                        if (!is_authenticated || !user?.id) {
                                console.error('Usuario no autenticado');
                                return { success: false, error: 'Usuario no autenticado' };
                        }

                        set_loading(true);
                        const { error } = await removeFromCart(cart_item_id);
                        if (error) throw error;

                        // Actualizar estado local
                        set_cart_items((prev) => prev.filter((item) => item.cart_item_id !== cart_item_id));
                        return { success: true };
                } catch (error) {
                        console.error('Error al remover del carrito:', error);
                        return { success: false, error: error.message };
                } finally {
                        set_loading(false);
                }
        };

        // Actualizar cantidad de un producto
        const update_quantity = async (cart_item_id, quantity) => {
                try {
                        if (!is_authenticated || !user?.id) {
                                console.error('Usuario no autenticado');
                                return { success: false, error: 'Usuario no autenticado' };
                        }

                        set_loading(true);
                        const { data, error } = await updateCartItemQuantity(cart_item_id, quantity);
                        if (error) throw error;

                        // Si la cantidad es 0, el item se elimina
                        if (quantity <= 0) {
                                set_cart_items((prev) => prev.filter((item) => item.cart_item_id !== cart_item_id));
                        } else {
                                // Actualizar estado local
                                set_cart_items((prev) =>
                                        prev.map((item) =>
                                                item.cart_item_id === cart_item_id ? { ...item, quantity } : item
                                        )
                                );
                        }
                        return { success: true, data };
                } catch (error) {
                        console.error('Error al actualizar cantidad:', error);
                        return { success: false, error: error.message };
                } finally {
                        set_loading(false);
                }
        };

        // Limpiar carrito
        const clear_cart = async () => {
                try {
                        if (!is_authenticated || !user?.id) {
                                console.error('Usuario no autenticado');
                                return { success: false, error: 'Usuario no autenticado' };
                        }

                        set_loading(true);
                        const { error } = await clearCartService(user.id);
                        if (error) throw error;

                        set_cart_items([]);
                        return { success: true };
                } catch (error) {
                        console.error('Error al limpiar carrito:', error);
                        return { success: false, error: error.message };
                } finally {
                        set_loading(false);
                }
        };

        // Calcular total
        const get_total = () => {
                return cart_items.reduce((total, item) => {
                        const price = item.products?.price || 0;
                        return total + price * item.quantity;
                }, 0);
        };

        // Obtener cantidad total de items
        const get_item_count = () => {
                return cart_items.reduce((count, item) => count + item.quantity, 0);
        };

        return (
                <CartContext.Provider
                        value={{
                                cart_items,
                                loading,
                                add_to_cart,
                                remove_from_cart,
                                update_quantity,
                                clear_cart,
                                get_total,
                                get_item_count,
                                reload_cart: load_cart,
                        }}
                >
                        {children}
                </CartContext.Provider>
        );
};

// Hook personalizado para usar el contexto
export const useCart = () => {
        const context = useContext(CartContext);
        if (context === undefined) {
                throw new Error('useCart debe ser usado dentro de CartProvider');
        }
        return context;
};
