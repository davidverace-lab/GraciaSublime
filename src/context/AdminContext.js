import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';
import { getOrderStats } from '../services/ordersService';
import { getUserStats } from '../services/usersService';

const AdminContext = createContext(undefined);

export const AdminProvider = ({ children }) => {
    const [admin, set_admin] = useState(null);
    const [is_admin_authenticated, set_is_admin_authenticated] = useState(false);

    useEffect(() => {
        check_admin_session();
    }, []);

    const check_admin_session = async () => {
        try {
            const admin_data = await AsyncStorage.getItem('current_admin');
            if (admin_data) {
                const parsed_admin = JSON.parse(admin_data);
                set_admin(parsed_admin);
                set_is_admin_authenticated(true);
            }
        } catch (error) {
            console.error('Error al verificar sesión de admin:', error);
        }
    };

    const admin_login = async (email, password) => {
        try {
            // 1. Autenticar con Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                console.error('Error en autenticación:', authError);
                return { success: false, message: 'Credenciales incorrectas' };
            }

            // 2. Verificar que el usuario sea admin en la tabla profiles
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('id, name, email, role, is_admin, phone')
                .eq('id', authData.user.id)
                .single();

            if (profileError || !profileData) {
                console.error('Error obteniendo perfil:', profileError);
                await supabase.auth.signOut();
                return { success: false, message: 'No se pudo obtener el perfil' };
            }

            // 3. Verificar que sea admin
            const isAdmin = profileData.role === 'admin' || profileData.is_admin === true;
            if (!isAdmin) {
                console.log('Usuario no es admin');
                await supabase.auth.signOut();
                return { success: false, message: 'No tienes permisos de administrador' };
            }

            // 4. Guardar datos del admin
            const admin_data = {
                id: profileData.id,
                email: profileData.email || authData.user.email,
                name: profileData.name,
                role: profileData.role || 'admin',
                phone: profileData.phone,
            };

            set_admin(admin_data);
            set_is_admin_authenticated(true);
            await AsyncStorage.setItem('current_admin', JSON.stringify(admin_data));

            return { success: true };
        } catch (error) {
            console.error('Error en login de admin:', error);
            return { success: false, message: 'Error al iniciar sesión' };
        }
    };

    const admin_logout = async () => {
        try {
            await supabase.auth.signOut();
            await AsyncStorage.removeItem('current_admin');
            set_admin(null);
            set_is_admin_authenticated(false);
        } catch (error) {
            console.error('Error en logout de admin:', error);
        }
    };

    // Obtener estadísticas del dashboard usando Supabase
    const get_dashboard_stats = async () => {
        try {
            // Obtener estadísticas de pedidos
            const { data: orderStats, error: orderError } = await getOrderStats();
            if (orderError) throw orderError;

            // Obtener estadísticas de usuarios
            const { data: userStats, error: userError } = await getUserStats();
            if (userError) throw userError;

            return {
                today_sales: orderStats.todaySales || 0,
                today_orders: orderStats.todayOrders || 0,
                pending_orders: orderStats.pendingOrders || 0,
                new_users_today: userStats.newUsersToday || 0,
                total_users: userStats.totalUsers || 0,
            };
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            return {
                today_sales: 0,
                today_orders: 0,
                pending_orders: 0,
                new_users_today: 0,
                total_users: 0,
            };
        }
    };

    return (
        <AdminContext.Provider
            value={{
                admin,
                is_admin_authenticated,
                admin_login,
                admin_logout,
                get_dashboard_stats,
            }}
        >
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error('useAdmin debe ser usado dentro de AdminProvider');
    }
    return context;
};
