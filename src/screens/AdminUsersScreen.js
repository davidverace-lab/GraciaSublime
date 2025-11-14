import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { getAllUsers } from '../services/usersService';

const AdminUsersScreen = () => {
    const [users, set_users] = useState([]);
    const [loading, set_loading] = useState(true);
    const [refreshing, set_refreshing] = useState(false);

    useEffect(() => {
        load_users();
    }, []);

    const load_users = async () => {
        try {
            set_loading(true);
            console.log('📋 Cargando usuarios...');

            const { data, error } = await getAllUsers();

            if (error) {
                console.error('❌ Error cargando usuarios:', error);
                console.error('Error detalles:', JSON.stringify(error));
                return;
            }

            console.log('✅ Usuarios cargados:', data?.length || 0);
            console.log('📊 Datos de usuarios:', JSON.stringify(data?.slice(0, 2))); // Muestra primeros 2

            set_users(data || []);
        } catch (error) {
            console.error('❌ Error al cargar usuarios:', error);
            console.error('Error completo:', JSON.stringify(error));
        } finally {
            set_loading(false);
            set_refreshing(false);
        }
    };

    const on_refresh = async () => {
        set_refreshing(true);
        await load_users();
    };

    const render_user = ({ item }) => {
        const userName = item.name || item.full_name || 'Usuario';
        const userEmail = item.email || 'Sin email';
        const userPhone = item.phone || 'Sin teléfono';
        const isAdmin = item.role === 'admin' || item.is_admin === true;

        return (
            <View style={styles.user_card}>
                <View style={[styles.avatar, isAdmin && styles.avatar_admin]}>
                    <Text style={styles.avatar_text}>{userName.charAt(0).toUpperCase()}</Text>
                    {isAdmin && (
                        <View style={styles.admin_badge}>
                            <Ionicons name="shield-checkmark" size={12} color={COLORS.white} />
                        </View>
                    )}
                </View>

                <View style={styles.user_info}>
                    <View style={styles.name_row}>
                        <Text style={styles.user_name}>{userName}</Text>
                        {isAdmin && <Text style={styles.admin_tag}>ADMIN</Text>}
                    </View>
                    <Text style={styles.user_email}>{userEmail}</Text>
                    <Text style={styles.user_phone}>{userPhone}</Text>
                </View>

                <Ionicons name="chevron-forward" size={24} color="#999" />
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.header_title}>Usuarios</Text>
                </View>
                <View style={styles.loading_container}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loading_text}>Cargando usuarios...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.header_title}>Usuarios</Text>
                <Text style={styles.header_subtitle}>
                    {users.length} {users.length === 1 ? 'usuario registrado' : 'usuarios registrados'}
                </Text>
            </View>

            <FlatList
                data={users}
                renderItem={render_user}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list_container}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={on_refresh}
                        colors={[COLORS.primary]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.empty_container}>
                        <Ionicons name="people-outline" size={60} color="#ccc" />
                        <Text style={styles.empty_text}>No hay usuarios registrados</Text>
                        <Text style={styles.empty_subtext}>
                            Los usuarios aparecerán aquí cuando se registren en la app
                        </Text>
                        <Text style={styles.debug_text}>
                            💡 Tip: Revisa la consola para ver logs de debug
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 15,
        paddingTop: 10,
        backgroundColor: COLORS.primary,
    },
    header_title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    header_subtitle: {
        fontSize: 14,
        color: COLORS.white,
        opacity: 0.9,
        marginTop: 5,
    },
    list_container: {
        padding: 15,
    },
    user_card: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar_text: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    user_info: {
        flex: 1,
        marginLeft: 15,
    },
    user_name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    user_email: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    user_phone: {
        fontSize: 13,
        color: '#999',
    },
    user_date: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
        fontStyle: 'italic',
    },
    loading_container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loading_text: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    empty_container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    empty_text: {
        marginTop: 15,
        fontSize: 16,
        color: '#999',
        fontWeight: 'bold',
    },
    empty_subtext: {
        marginTop: 8,
        fontSize: 14,
        color: '#bbb',
        textAlign: 'center',
        paddingHorizontal: 30,
    },
    debug_text: {
        marginTop: 15,
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
    },
    avatar_admin: {
        backgroundColor: '#FF6B6B',
    },
    admin_badge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    name_row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    admin_tag: {
        marginLeft: 8,
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.white,
        backgroundColor: '#FF6B6B',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
});

export default AdminUsersScreen;
