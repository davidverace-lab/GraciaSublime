import React, { createContext, useState, useContext, useEffect } from 'react';
import {
        getFavorites,
        addToFavorites,
        removeFromFavorites,
        isInFavorites,
        toggleFavorite as toggleFavoriteService,
} from '../services/favoritesService';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(undefined);

export const FavoritesProvider = ({ children }) => {
        const { user, is_authenticated } = useAuth();
        const [favorites, set_favorites] = useState([]);
        const [loading, set_loading] = useState(false);

        // Cargar favoritos cuando el usuario se autentique
        useEffect(() => {
                if (is_authenticated && user?.id) {
                        load_favorites();
                } else {
                        set_favorites([]);
                }
        }, [is_authenticated, user?.id]);

        const load_favorites = async () => {
                try {
                        set_loading(true);
                        const { data, error } = await getFavorites(user.id);
                        if (error) throw error;
                        set_favorites(data || []);
                } catch (error) {
                        console.error('Error al cargar favoritos:', error);
                } finally {
                        set_loading(false);
                }
        };

        // Agregar a favoritos
        const add_to_favorites = async (product) => {
                try {
                        if (!is_authenticated || !user?.id) {
                                console.error('Usuario no autenticado');
                                return { success: false, error: 'Debes iniciar sesión para agregar a favoritos' };
                        }

                        set_loading(true);
                        const productId = product.product_id || product.id;

                        // Verificar si ya está en favoritos
                        if (is_favorite(productId)) {
                                console.log('El producto ya está en favoritos');
                                return { success: true, alreadyExists: true };
                        }

                        const { data, error } = await addToFavorites(user.id, productId);
                        if (error) {
                                // Si el error es de duplicado, no es un error real
                                if (error.code === '23505') {
                                        console.log('El producto ya estaba en favoritos (detectado por BD)');
                                        await load_favorites(); // Recargar para sincronizar
                                        return { success: true, alreadyExists: true };
                                }
                                throw error;
                        }

                        // Actualizar estado local
                        set_favorites((prev) => [...prev, data]);
                        return { success: true, data };
                } catch (error) {
                        console.error('Error al agregar a favoritos:', error);
                        return { success: false, error: error.message };
                } finally {
                        set_loading(false);
                }
        };

        // Remover de favoritos
        const remove_from_favorites = async (product_id) => {
                try {
                        if (!is_authenticated || !user?.id) {
                                console.error('Usuario no autenticado');
                                return { success: false, error: 'Usuario no autenticado' };
                        }

                        set_loading(true);
                        const { error } = await removeFromFavorites(user.id, product_id);
                        if (error) throw error;

                        // Actualizar estado local
                        set_favorites((prev) => prev.filter((fav) => fav.product_id !== product_id));
                        return { success: true };
                } catch (error) {
                        console.error('Error al remover de favoritos:', error);
                        return { success: false, error: error.message };
                } finally {
                        set_loading(false);
                }
        };

        // Verificar si un producto está en favoritos
        const is_favorite = (product_id) => {
                return favorites.some((fav) => fav.product_id === product_id);
        };

        // Toggle favorito (agregar o remover)
        const toggle_favorite = async (product) => {
                try {
                        if (!is_authenticated || !user?.id) {
                                console.error('Usuario no autenticado');
                                return { success: false, error: 'Debes iniciar sesión' };
                        }

                        const productId = product.product_id || product.id;
                        const isFav = is_favorite(productId);

                        if (isFav) {
                                const result = await remove_from_favorites(productId);
                                return { ...result, action: 'removed' };
                        } else {
                                const result = await add_to_favorites(product);
                                return { ...result, action: 'added' };
                        }
                } catch (error) {
                        console.error('Error al alternar favorito:', error);
                        return { success: false, error: error.message };
                }
        };

        return (
                <FavoritesContext.Provider
                        value={{
                                favorites,
                                loading,
                                add_to_favorites,
                                remove_from_favorites,
                                is_favorite,
                                toggle_favorite,
                                reload_favorites: load_favorites,
                        }}
                >
                        {children}
                </FavoritesContext.Provider>
        );
};

// Hook personalizado para usar el contexto
export const useFavorites = () => {
        const context = useContext(FavoritesContext);
        if (context === undefined) {
                throw new Error('useFavorites debe ser usado dentro de FavoritesProvider');
        }
        return context;
};
