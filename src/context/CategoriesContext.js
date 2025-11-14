import React, { createContext, useState, useContext, useEffect } from 'react';
import {
        getAllCategories,
        getCategoryById,
        createCategory,
        updateCategory,
        deleteCategory,
        getCategoryWithProducts,
} from '../services/categoriesService';

const CategoriesContext = createContext(undefined);

export const CategoriesProvider = ({ children }) => {
        const [categories, set_categories] = useState([]);
        const [loading, set_loading] = useState(false);
        const [error, set_error] = useState(null);

        // Cargar categorías al iniciar
        useEffect(() => {
                load_categories();
        }, []);

        const load_categories = async () => {
                try {
                        set_loading(true);
                        set_error(null);
                        const { data, error } = await getAllCategories();
                        if (error) throw error;
                        set_categories(data || []);
                } catch (error) {
                        console.error('Error al cargar categorías:', error);
                        set_error(error.message);
                } finally {
                        set_loading(false);
                }
        };

        // Obtener categoría por ID
        const get_category_by_id = async (categoryId) => {
                try {
                        set_loading(true);
                        const { data, error } = await getCategoryById(categoryId);
                        if (error) throw error;
                        return { success: true, data };
                } catch (error) {
                        console.error('Error al obtener categoría:', error);
                        return { success: false, error: error.message };
                } finally {
                        set_loading(false);
                }
        };

        // Obtener categoría con productos
        const get_category_with_products = async (categoryId) => {
                try {
                        set_loading(true);
                        const { data, error } = await getCategoryWithProducts(categoryId);
                        if (error) throw error;
                        return { success: true, data };
                } catch (error) {
                        console.error('Error al obtener categoría con productos:', error);
                        return { success: false, error: error.message };
                } finally {
                        set_loading(false);
                }
        };

        // Crear categoría (admin)
        const create_category = async (categoryData) => {
                try {
                        set_loading(true);
                        const { data, error } = await createCategory(categoryData);
                        if (error) throw error;

                        // Actualizar lista local
                        set_categories((prev) => [...prev, data]);
                        return { success: true, data };
                } catch (error) {
                        console.error('Error al crear categoría:', error);
                        return { success: false, error: error.message };
                } finally {
                        set_loading(false);
                }
        };

        // Actualizar categoría (admin)
        const update_category = async (categoryId, updates) => {
                try {
                        set_loading(true);
                        const { data, error } = await updateCategory(categoryId, updates);
                        if (error) throw error;

                        // Actualizar lista local
                        set_categories((prev) =>
                                prev.map((c) => (c.category_id === categoryId ? data : c))
                        );
                        return { success: true, data };
                } catch (error) {
                        console.error('Error al actualizar categoría:', error);
                        return { success: false, error: error.message };
                } finally {
                        set_loading(false);
                }
        };

        // Eliminar categoría (admin)
        const delete_category = async (categoryId) => {
                try {
                        set_loading(true);
                        const { error } = await deleteCategory(categoryId);
                        if (error) throw error;

                        // Actualizar lista local
                        set_categories((prev) => prev.filter((c) => c.category_id !== categoryId));
                        return { success: true };
                } catch (error) {
                        console.error('Error al eliminar categoría:', error);
                        return { success: false, error: error.message };
                } finally {
                        set_loading(false);
                }
        };

        return (
                <CategoriesContext.Provider
                        value={{
                                categories,
                                loading,
                                error,
                                load_categories,
                                get_category_by_id,
                                get_category_with_products,
                                create_category,
                                update_category,
                                delete_category,
                        }}
                >
                        {children}
                </CategoriesContext.Provider>
        );
};

// Hook personalizado para usar el contexto
export const useCategories = () => {
        const context = useContext(CategoriesContext);
        if (context === undefined) {
                throw new Error('useCategories debe ser usado dentro de CategoriesProvider');
        }
        return context;
};
