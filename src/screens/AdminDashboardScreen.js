import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useAdmin } from '../context/AdminContext';
import { supabase } from '../config/supabase';
import StatCard from '../components/StatCard';

const AdminDashboardScreen = ({ navigation }) => {
    const { admin, admin_logout, get_dashboard_stats } = useAdmin();
    const [stats, set_stats] = useState({
        today_sales: 0,
        today_orders: 0,
        pending_orders: 0,
        new_users_today: 0,
        total_users: 0,
    });
    const [refreshing, set_refreshing] = useState(false);

    useEffect(() => {
        load_stats();

        // Suscribirse a cambios en tiempo real en pedidos
        const ordersChannel = supabase
            .channel('admin_orders_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                },
                (payload) => {
                    console.log('Cambio en orders:', payload);
                    load_stats(); // Recargar estadísticas cuando hay cambios
                }
            )
            .subscribe();

        // Suscribirse a cambios en tiempo real en usuarios
        const usersChannel = supabase
            .channel('admin_users_changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'profiles',
                },
                (payload) => {
                    console.log('Nuevo usuario:', payload);
                    load_stats(); // Recargar estadísticas cuando hay nuevos usuarios
                }
            )
            .subscribe();

        // Cleanup al desmontar
        return () => {
            supabase.removeChannel(ordersChannel);
            supabase.removeChannel(usersChannel);
        };
    }, []);

    const load_stats = async () => {
        const dashboard_stats = await get_dashboard_stats();
        set_stats(dashboard_stats);
    };

    const on_refresh = async () => {
        set_refreshing(true);
        await load_stats();
        set_refreshing(false);
    };

    const handle_logout = () => {
        admin_logout();
        navigation.replace('Login');
    };

    const get_greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Buenos días';
        if (hour < 18) return 'Buenas tardes';
        return 'Buenas noches';
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.header_content}>
                    <View>
                        <Text style={styles.greeting}>{get_greeting()}</Text>
                        <Text style={styles.admin_name}>{admin?.name}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.logout_button}
                        onPress={handle_logout}
                    >
                        <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                </View>

                <View style={styles.date_container}>
                    <Ionicons name="calendar-outline" size={16} color={COLORS.white} />
                    <Text style={styles.date_text}>
                        {new Date().toLocaleDateString('es-MX', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </Text>
                </View>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={on_refresh} />
                }
            >
                {/* Resumen de Hoy */}
                <View style={styles.section}>
                    <Text style={styles.section_title}>📊 Resumen de Hoy</Text>

                    <StatCard
                        title="Ventas"
                        value={`$${stats.today_sales.toFixed(2)}`}
                        icon="cash-outline"
                        gradient={['#667eea', '#764ba2']}
                        subtitle="Ventas del día"
                        trend={12}
                        onPress={() => navigation.navigate('AdminOrders')}
                    />

                    <View style={styles.row}>
                        <View style={styles.half_card}>
                            <StatCard
                                title="Pedidos Nuevos"
                                value={stats.today_orders.toString()}
                                icon="cart-outline"
                                gradient={['#f093fb', '#f5576c']}
                                trend={8}
                            />
                        </View>
                        <View style={styles.half_card}>
                            <StatCard
                                title="Nuevos Usuarios"
                                value={stats.new_users_today.toString()}
                                icon="people-outline"
                                gradient={['#4facfe', '#00f2fe']}
                                trend={15}
                            />
                        </View>
                    </View>
                </View>

                {/* Alertas */}
                {stats.pending_orders > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.section_title}>⚠️ Alertas</Text>

                        <TouchableOpacity
                            style={styles.alert_card}
                            onPress={() => navigation.navigate('AdminOrders')}
                        >
                            <View style={styles.alert_icon}>
                                <Ionicons name="warning" size={24} color="#FF9800" />
                            </View>
                            <View style={styles.alert_content}>
                                <Text style={styles.alert_title}>
                                    {stats.pending_orders} pedidos pendientes
                                </Text>
                                <Text style={styles.alert_subtitle}>
                                    Requieren tu atención
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="#999" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Acceso Rápido */}
                <View style={styles.section}>
                    <Text style={styles.section_title}>⚡ Acceso Rápido</Text>

                    <View style={styles.quick_access_grid}>
                        <TouchableOpacity
                            style={[styles.quick_access_card, styles.quick_access_gradient]}
                            onPress={() => navigation.navigate('AdminProducts')}
                        >
                            <Ionicons name="cube-outline" size={32} color={COLORS.white} />
                            <Text style={styles.quick_access_text}>Productos</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.quick_access_card, styles.quick_access_gradient2]}
                            onPress={() => navigation.navigate('AdminOrders')}
                        >
                            <Ionicons
                                name="receipt-outline"
                                size={32}
                                color={COLORS.white}
                            />
                            <Text style={styles.quick_access_text}>Pedidos</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.quick_access_card, styles.quick_access_gradient3]}
                            onPress={() => navigation.navigate('AdminCategories')}
                        >
                            <Ionicons name="grid-outline" size={32} color={COLORS.white} />
                            <Text style={styles.quick_access_text}>
                                Categorías
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.quick_access_card, styles.quick_access_gradient4]}
                            onPress={() => navigation.navigate('AdminUsers')}
                        >
                            <Ionicons name="people-outline" size={32} color={COLORS.white} />
                            <Text style={styles.quick_access_text}>
                                Usuarios
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Estadísticas Generales */}
                <View style={styles.section}>
                    <Text style={styles.section_title}>📈 Estadísticas Generales</Text>

                    <View style={styles.stats_container}>
                        <View style={styles.stat_item}>
                            <Text style={styles.stat_value}>{stats.total_users}</Text>
                            <Text style={styles.stat_label}>Usuarios Registrados</Text>
                        </View>
                        <View style={styles.stat_divider} />
                        <View style={styles.stat_item}>
                            <Text style={styles.stat_value}>4.8</Text>
                            <Text style={styles.stat_label}>Promedio Rating</Text>
                        </View>
                    </View>
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 20,
        paddingTop: 10,
        backgroundColor: COLORS.primary,
    },
    header_content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    greeting: {
        fontSize: 16,
        color: COLORS.white,
        opacity: 0.9,
    },
    admin_name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    logout_button: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    date_container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    date_text: {
        fontSize: 13,
        color: COLORS.white,
        marginLeft: 8,
        opacity: 0.9,
        textTransform: 'capitalize',
    },
    content: {
        flex: 1,
        padding: 15,
    },
    section: {
        marginBottom: 20,
    },
    section_title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    half_card: {
        flex: 1,
        marginHorizontal: 5,
    },
    alert_card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: 15,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    alert_icon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFF3E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    alert_content: {
        flex: 1,
    },
    alert_title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 3,
    },
    alert_subtitle: {
        fontSize: 13,
        color: '#666',
    },
    quick_access_grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    quick_access_card: {
        width: '48%',
        marginBottom: 15,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        height: 120,
    },
    quick_access_gradient: {
        backgroundColor: '#fa709a',
    },
    quick_access_gradient2: {
        backgroundColor: '#30cfd0',
    },
    quick_access_gradient3: {
        backgroundColor: '#a8edea',
    },
    quick_access_gradient4: {
        backgroundColor: '#ff9a9e',
    },
    quick_access_text: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.white,
        marginTop: 10,
    },
    stats_container: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    stat_item: {
        flex: 1,
        alignItems: 'center',
    },
    stat_divider: {
        width: 1,
        backgroundColor: '#e0e0e0',
        marginHorizontal: 15,
    },
    stat_value: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 5,
    },
    stat_label: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
});

export default AdminDashboardScreen;
