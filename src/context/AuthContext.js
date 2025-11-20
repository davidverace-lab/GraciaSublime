import React, { createContext, useState, useContext, useEffect } from 'react';
import {
        signIn,
        signUp,
        signOut,
        getCurrentSession,
        getUserProfile,
        updateUserProfile,
        onAuthStateChange,
} from '../services/authService';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
        const [user, set_user] = useState(null);
        const [profile, set_profile] = useState(null);
        const [is_authenticated, set_is_authenticated] = useState(false);
        const [loading, set_loading] = useState(true);
        const [is_admin, set_is_admin] = useState(false);
        const [view_mode, set_view_mode] = useState('client'); // 'client' o 'admin'

        // Inicializar sesión al cargar la app
        useEffect(() => {
                initialize_session();

                // Suscribirse a cambios de autenticación
                const { data: authListener } = onAuthStateChange(async (event, session) => {
                        console.log('Auth event:', event);
                        if (session?.user) {
                                set_user(session.user);
                                set_is_authenticated(true);
                                await load_user_profile(session.user.id);
                        } else {
                                set_user(null);
                                set_profile(null);
                                set_is_authenticated(false);
                        }
                });

                return () => {
                        if (authListener?.subscription) {
                                authListener.subscription.unsubscribe();
                        }
                };
        }, []);

        const initialize_session = async () => {
                try {
                        const { session, error } = await getCurrentSession();
                        if (error) throw error;

                        if (session?.user) {
                                set_user(session.user);
                                set_is_authenticated(true);
                                await load_user_profile(session.user.id);
                        }
                } catch (error) {
                        console.error('Error al inicializar sesión:', error);
                } finally {
                        set_loading(false);
                }
        };

        const load_user_profile = async (userId) => {
                try {
                        const { data, error } = await getUserProfile(userId);
                        if (error) {
                                console.error('Error obteniendo perfil:', error);
                                throw error;
                        }

                        console.log('Perfil cargado:', data);
                        set_profile(data);

                        // Verificar si el usuario tiene rol de admin
                        const isUserAdmin = data?.role === 'admin' || data?.role === 'ADMIN' || data?.is_admin === true;
                        console.log('Es admin?', isUserAdmin, '| role:', data?.role, '| is_admin:', data?.is_admin);
                        set_is_admin(isUserAdmin);

                        // Si es admin, establecer vista admin por defecto
                        if (isUserAdmin) {
                                console.log('Estableciendo modo admin');
                                set_view_mode('admin');
                        } else {
                                console.log('Estableciendo modo cliente');
                                set_view_mode('client');
                        }

                        return data;
                } catch (error) {
                        console.error('Error al cargar perfil:', error);
                        set_is_admin(false);
                        set_view_mode('client');
                        return null;
                }
        };

        // Login con Supabase
        const login = async (email, password) => {
                try {
                        console.log('Intentando login con email:', email);
                        const { data, error } = await signIn(email, password);
                        if (error) {
                                console.error('Error en login:', error.message);
                                return { success: false, error: error.message };
                        }

                        console.log('Login exitoso, datos de usuario:', data.user);

                        if (data?.user) {
                                set_user(data.user);
                                set_is_authenticated(true);

                                // Cargar perfil y obtener nombre
                                const profileData = await load_user_profile(data.user.id);
                                const userName = profileData?.name || data.user.email?.split('@')[0] || 'Usuario';

                                return { success: true, userName };
                        }

                        return { success: false, error: 'Error desconocido' };
                } catch (error) {
                        console.error('Error en login:', error);
                        return { success: false, error: error.message };
                }
        };

        // Registro con Supabase
        const register = async (full_name, email, phone, password) => {
                try {
                        const { data, error } = await signUp(email, password, full_name, phone);
                        if (error) {
                                console.error('Error en registro:', error.message);
                                return { success: false, error: error.message };
                        }

                        if (data?.user) {
                                // Nota: Supabase puede requerir confirmación por email
                                // En ese caso, el usuario no estará autenticado inmediatamente
                                return { success: true, requiresEmailConfirmation: !data.session };
                        }

                        return { success: false, error: 'Error desconocido' };
                } catch (error) {
                        console.error('Error en registro:', error);
                        return { success: false, error: error.message };
                }
        };

        // Logout con Supabase
        const logout = async () => {
                try {
                        const { error } = await signOut();
                        if (error) throw error;

                        // Limpiar completamente el estado
                        set_user(null);
                        set_profile(null);
                        set_is_authenticated(false);
                        set_is_admin(false);
                        set_view_mode('client');
                        set_loading(false);

                        return { success: true };
                } catch (error) {
                        console.error('Error en logout:', error);
                        // Limpiar el estado incluso si hay error
                        set_user(null);
                        set_profile(null);
                        set_is_authenticated(false);
                        set_is_admin(false);
                        set_view_mode('client');
                        set_loading(false);
                        return { success: false, error: error.message };
                }
        };

        // Cambiar entre vista admin y cliente
        const toggle_view_mode = () => {
                if (is_admin) {
                        set_view_mode(prev => prev === 'admin' ? 'client' : 'admin');
                }
        };

        // Actualizar perfil de usuario
        const update_profile = async (updates) => {
                try {
                        if (!user?.id) {
                                throw new Error('No hay usuario autenticado');
                        }

                        const { data, error } = await updateUserProfile(user.id, updates);
                        if (error) throw error;

                        set_profile(data);
                        return { success: true, data };
                } catch (error) {
                        console.error('Error al actualizar perfil:', error);
                        return { success: false, error: error.message };
                }
        };

        return (
                <AuthContext.Provider
                        value={{
                                user,
                                profile,
                                is_authenticated,
                                loading,
                                is_admin,
                                view_mode,
                                login,
                                register,
                                logout,
                                update_profile,
                                toggle_view_mode,
                        }}
                >
                        {children}
                </AuthContext.Provider>
        );
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
        const context = useContext(AuthContext);
        if (context === undefined) {
                throw new Error('useAuth debe ser usado dentro de AuthProvider');
        }
        return context;
};
