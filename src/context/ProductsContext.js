import React, { createContext, useState, useContext, useEffect } from 'react';
import {
        getAllProducts,
        getProductById,
        getProductsByCategory,
        searchProducts,
        createProduct,
        updateProduct,
        deleteProduct,
        getProductReviews,
        addProductReview,
} from '../services/productsService';

const ProductsContext = createContext(undefined);

export const ProductsProvider = ({ children }) => {
        const [products, set_products] = useState([]);
        const [loading, set_loading] = useState(false);
        const [error, set_error] = useState(null);

        // Cargar productos al iniciar
        useEffect(() => {
                load_products();
        }, []);

        const load_products = async () => {
                try {
                        set_loading(true);
                        set_error(null);
                        const { data, error } = await getAllProducts();
                        if (error) throw error;
                        set_products(data || []);
                } catch (error) {
                        console.error('Error al cargar productos:', error);
                        set_error(error.message);
                } finally {
                        set_loading(false);
                }
        };

        // Obtener producto por ID
        const get_product_by_id = async (productId) => {
                try {
                        set_loading(true);
                        const { data, error } = await getProductById(productId);
                        if (error) throw error;
                        return { success: true, data };
                } catch (error) {
                        console.error('Error al obtener producto:', error);
                        return { success: false, error: error.message };
                } finally {
                        set_loading(false);
                }
        };

        // Obtener productos por categoría
        const get_products_by_category = async (categoryId) => {
                try {
                        set_loading(true);
                        const { data, error } = await getProductsByCategory(categoryId);
                        if (error) throw error;
                        return { success: true, data };
                } catch (error) {
                        console.error('Error al obtener productos por categoría:', error);
                        return { success: false, error: error.message };
                } finally {
                        set_loading(false);
                }
        };

        // Buscar productos
        const search_products = async (searchTerm) => {
                try {
                        set_loading(true);
                        const { data, error } = await searchProducts(searchTerm);
                        if (error) throw error;
                        return { success: true, data };
                } catch (error) {
                        console.error('Error al buscar productos:', error);
                        return { success: false, error: error.message };
                } finally {
                        set_loading(false);
                }
        };

        // Crear producto (admin)
        const create_product = async (productData) => {
                try {
                        set_loading(true);
                        const { data, error } = await createProduct(productData);
                        if (error) throw error;

                        // Actualizar lista local
                        set_products((prev) => [...prev, data]);
                        return { success: true, data };
                } catch (error) {
                        console.error('Error al crear producto:', error);
                        return { success: false, error: error.message };
                } finally {
                        set_loading(false);
                }
        };

        // Actualizar producto (admin)
        const update_product = async (productId, updates) => {
                try {
                        set_loading(true);
                        const { data, error } = await updateProduct(productId, updates);
                        if (error) throw error;

                        // Actualizar lista local
                        set_products((prev) =>
                                prev.map((p) => (p.product_id === productId ? data : p))
                        );
                        return { success: true, data };
                } catch (error) {
                        console.error('Error al actualizar producto:', error);
                        return { success: false, error: error.message };
                } finally {
                        set_loading(false);
                }
        };

        // Eliminar producto (admin)
        const delete_product = async (productId) => {
                try {
                        set_loading(true);
                        const { error } = await deleteProduct(productId);
                        if (error) throw error;

                        // Actualizar lista local
                        set_products((prev) => prev.filter((p) => p.product_id !== productId));
                        return { success: true };
                } catch (error) {
                        console.error('Error al eliminar producto:', error);
                        return { success: false, error: error.message };
                } finally {
                        set_loading(false);
                }
        };

        // Obtener reseñas de un producto
        const get_product_reviews = async (productId) => {
                try {
                        const { data, error } = await getProductReviews(productId);
                        if (error) throw error;
                        return { success: true, data };
                } catch (error) {
                        console.error('Error al obtener reseñas:', error);
                        return { success: false, error: error.message };
                }
        };

        // Agregar reseña
        const add_review = async (productId, userId, rating, comment) => {
                try {
                        const { data, error } = await addProductReview(productId, userId, rating, comment);
                        if (error) throw error;
                        return { success: true, data };
                } catch (error) {
                        console.error('Error al agregar reseña:', error);
                        return { success: false, error: error.message };
                }
        };

        return (
                <ProductsContext.Provider
                        value={{
                                products,
                                loading,
                                error,
                                load_products,
                                get_product_by_id,
                                get_products_by_category,
                                search_products,
                                create_product,
                                update_product,
                                delete_product,
                                get_product_reviews,
                                add_review,
                        }}
                >
                        {children}
                </ProductsContext.Provider>
        );
};

// Hook personalizado para usar el contexto
export const useProducts = () => {
        const context = useContext(ProductsContext);
        if (context === undefined) {
                throw new Error('useProducts debe ser usado dentro de ProductsProvider');
        }
        return context;
};
