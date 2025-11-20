import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Modal,
    ScrollView,
    Image,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { getAllOrders, updateOrderStatus } from '../services/ordersService';

const STATUS_COLORS = {
    pendiente: { bg: '#FFE5E5', color: '#F44336', icon: 'time' },
    pago_pendiente: { bg: '#F3E5F5', color: '#9C27B0', icon: 'card-outline' },
    procesando: { bg: '#FFF4E5', color: '#FF9800', icon: 'construct' },
    en_transito: { bg: '#E3F2FD', color: '#2196F3', icon: 'car' },
    completado: { bg: '#E8F5E9', color: '#4CAF50', icon: 'checkmark-circle' },
    cancelado: { bg: '#F5F5F5', color: '#9E9E9E', icon: 'close-circle' },
};

const STATUS_DISPLAY = {
    pendiente: 'Pendiente',
    pago_pendiente: 'Pago Pendiente',
    procesando: 'Procesando',
    en_transito: 'En Tránsito',
    completado: 'Completado',
    cancelado: 'Cancelado',
};

const AdminOrdersScreen = () => {
    const [orders, set_orders] = useState([]);
    const [filter_status, set_filter_status] = useState('all');
    const [refreshing, set_refreshing] = useState(false);
    const [selected_order, set_selected_order] = useState(null);
    const [modal_visible, set_modal_visible] = useState(false);
    const [loading, set_loading] = useState(true);

    useEffect(() => {
        load_orders();
    }, []);

    const load_orders = async () => {
        try {
            set_loading(true);
            const { data, error } = await getAllOrders();

            if (error) {
                console.error('Error loading orders:', error);
                Alert.alert('Error', 'No se pudieron cargar los pedidos');
                return;
            }

            set_orders(data || []);
        } catch (error) {
            console.error('Error loading orders:', error);
            Alert.alert('Error', 'Ocurrió un error al cargar los pedidos');
        } finally {
            set_loading(false);
        }
    };

    const on_refresh = async () => {
        set_refreshing(true);
        await load_orders();
        set_refreshing(false);
    };

    const change_order_status = async (order_id, new_status) => {
        try {
            const { data, error } = await updateOrderStatus(order_id, new_status);

            if (error) {
                Alert.alert('Error', 'No se pudo actualizar el estado del pedido');
                return;
            }

            // Actualizar localmente
            const updated_orders = orders.map((order) =>
                order.order_id === order_id ? { ...order, status: new_status } : order
            );
            set_orders(updated_orders);

            // Actualizar orden seleccionada
            if (selected_order && selected_order.order_id === order_id) {
                set_selected_order({ ...selected_order, status: new_status });
            }

            Alert.alert('Éxito', `Estado actualizado a: ${STATUS_DISPLAY[new_status]}`);
        } catch (error) {
            console.error('Error updating status:', error);
            Alert.alert('Error', 'Ocurrió un error al actualizar el estado');
        }
    };

    const get_filtered_orders = () => {
        if (filter_status === 'all') return orders;
        return orders.filter((order) => order.status === filter_status);
    };

    const render_order = ({ item }) => {
        const status_style = STATUS_COLORS[item.status] || STATUS_COLORS.pendiente;
        const total_items = item.order_items?.length || 0;

        return (
            <TouchableOpacity
                style={styles.order_card}
                onPress={() => {
                    set_selected_order(item);
                    set_modal_visible(true);
                }}
            >
                <View style={styles.order_header}>
                    <View>
                        <Text style={styles.order_id}>Pedido #{item.order_id}</Text>
                        <Text style={styles.order_date}>
                            {new Date(item.order_date).toLocaleDateString('es-MX', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </Text>
                        {item.profiles?.name && (
                            <Text style={styles.customer_name}>
                                <Ionicons name="person" size={12} color="#666" /> {item.profiles.name}
                            </Text>
                        )}
                    </View>

                    <View style={[styles.status_badge, { backgroundColor: status_style.bg }]}>
                        <Ionicons name={status_style.icon} size={16} color={status_style.color} />
                        <Text style={[styles.status_text, { color: status_style.color }]}>
                            {STATUS_DISPLAY[item.status]}
                        </Text>
                    </View>
                </View>

                <View style={styles.order_info}>
                    <View style={styles.info_row}>
                        <Ionicons name="cart-outline" size={18} color="#666" />
                        <Text style={styles.info_text}>{total_items} productos</Text>
                    </View>

                    <View style={styles.info_row}>
                        <Ionicons name="cash-outline" size={18} color="#666" />
                        <Text style={[styles.info_text, styles.price_text]}>
                            ${item.total_price?.toFixed(2)} MXN
                        </Text>
                    </View>
                </View>

                {item.payment_method && (
                    <View style={styles.payment_method_row}>
                        <Ionicons name="card-outline" size={16} color="#999" />
                        <Text style={styles.payment_method_text}>
                            {item.payment_method === 'transferencia' ? 'Transferencia Bancaria' : 'PayPal'}
                        </Text>
                    </View>
                )}

                <TouchableOpacity style={styles.view_button}>
                    <Text style={styles.view_button_text}>Ver detalles</Text>
                    <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.header_top}>
                    <Text style={styles.header_title}>Pedidos</Text>
                    <TouchableOpacity onPress={load_orders} style={styles.refresh_button}>
                        <Ionicons name="refresh" size={20} color={COLORS.white} />
                    </TouchableOpacity>
                </View>

                {/* Filtros */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filters_container}
                >
                    {['all', 'pago_pendiente', 'pendiente', 'procesando', 'en_transito', 'completado'].map(
                        (status) => (
                            <TouchableOpacity
                                key={status}
                                style={[
                                    styles.filter_chip,
                                    filter_status === status && styles.filter_chip_active,
                                ]}
                                onPress={() => set_filter_status(status)}
                            >
                                <Text
                                    style={[
                                        styles.filter_text,
                                        filter_status === status && styles.filter_text_active,
                                    ]}
                                >
                                    {status === 'all' ? 'Todos' : STATUS_DISPLAY[status]}
                                </Text>
                            </TouchableOpacity>
                        )
                    )}
                </ScrollView>
            </View>

            {/* Lista de pedidos */}
            <FlatList
                data={get_filtered_orders()}
                renderItem={render_order}
                keyExtractor={(item) => item.order_id.toString()}
                contentContainerStyle={styles.list_container}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={on_refresh} />
                }
                ListEmptyComponent={
                    <View style={styles.empty_container}>
                        <Ionicons name="receipt-outline" size={80} color="#ccc" />
                        <Text style={styles.empty_text}>
                            {loading ? 'Cargando pedidos...' : 'No hay pedidos'}
                        </Text>
                    </View>
                }
            />

            {/* Modal de detalle de pedido */}
            <Modal
                visible={modal_visible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => set_modal_visible(false)}
            >
                <View style={styles.modal_overlay}>
                    <View style={styles.modal_container}>
                        <View style={styles.modal_header}>
                            <Text style={styles.modal_title}>
                                Pedido #{selected_order?.order_id}
                            </Text>
                            <TouchableOpacity onPress={() => set_modal_visible(false)}>
                                <Ionicons name="close" size={28} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modal_content}>
                            {/* Estado actual */}
                            <View style={styles.modal_section}>
                                <Text style={styles.modal_section_title}>📊 Estado Actual</Text>
                                {selected_order && (
                                    <View
                                        style={[
                                            styles.current_status,
                                            {
                                                backgroundColor:
                                                    STATUS_COLORS[selected_order.status]?.bg,
                                            },
                                        ]}
                                    >
                                        <Ionicons
                                            name={STATUS_COLORS[selected_order.status]?.icon}
                                            size={24}
                                            color={STATUS_COLORS[selected_order.status]?.color}
                                        />
                                        <Text
                                            style={[
                                                styles.current_status_text,
                                                {
                                                    color: STATUS_COLORS[selected_order.status]
                                                        ?.color,
                                                },
                                            ]}
                                        >
                                            {STATUS_DISPLAY[selected_order.status]}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Comprobante de pago */}
                            {selected_order?.payment_proof_url && (
                                <View style={styles.modal_section}>
                                    <Text style={styles.modal_section_title}>📷 Comprobante de Pago</Text>
                                    <Image
                                        source={{ uri: selected_order.payment_proof_url }}
                                        style={styles.payment_proof_image}
                                        resizeMode="contain"
                                    />
                                </View>
                            )}

                            {/* Productos */}
                            <View style={styles.modal_section}>
                                <Text style={styles.modal_section_title}>
                                    🛍️ Productos ({selected_order?.order_items?.length || 0})
                                </Text>
                                {selected_order?.order_items?.map((item, index) => (
                                    <View key={index} style={styles.order_item}>
                                        {item.products?.image_url && (
                                            <Image
                                                source={{ uri: item.products.image_url }}
                                                style={styles.product_image}
                                            />
                                        )}
                                        <View style={styles.item_info}>
                                            <Text style={styles.item_name}>
                                                {item.products?.name}
                                            </Text>
                                            <Text style={styles.item_quantity}>
                                                Cantidad: {item.quantity}
                                            </Text>
                                            <Text style={styles.item_price}>
                                                ${item.price?.toFixed(2)} MXN c/u
                                            </Text>
                                        </View>
                                        <View style={styles.item_total_container}>
                                            <Text style={styles.item_total_label}>Total</Text>
                                            <Text style={styles.item_total}>
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>

                            {/* Resumen */}
                            <View style={styles.modal_section}>
                                <Text style={styles.modal_section_title}>💰 Resumen</Text>
                                <View style={styles.summary_container}>
                                    <View style={styles.summary_row}>
                                        <Text style={styles.summary_total_label}>Total</Text>
                                        <Text style={styles.summary_total_value}>
                                            ${selected_order?.total_price?.toFixed(2)} MXN
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Cambiar estado */}
                            {selected_order?.status !== 'completado' &&
                                selected_order?.status !== 'cancelado' && (
                                    <View style={styles.modal_section}>
                                        <Text style={styles.modal_section_title}>
                                            🔄 Cambiar Estado
                                        </Text>

                                        {selected_order?.status === 'pago_pendiente' && (
                                            <TouchableOpacity
                                                style={[
                                                    styles.status_button,
                                                    { backgroundColor: '#4CAF50' },
                                                ]}
                                                onPress={() =>
                                                    change_order_status(
                                                        selected_order.order_id,
                                                        'pendiente'
                                                    )
                                                }
                                            >
                                                <Ionicons
                                                    name="checkmark-circle"
                                                    size={20}
                                                    color={COLORS.white}
                                                />
                                                <Text style={styles.status_button_text}>
                                                    Confirmar Pago
                                                </Text>
                                            </TouchableOpacity>
                                        )}

                                        {selected_order?.status === 'pendiente' && (
                                            <TouchableOpacity
                                                style={[
                                                    styles.status_button,
                                                    { backgroundColor: '#FF9800' },
                                                ]}
                                                onPress={() =>
                                                    change_order_status(
                                                        selected_order.order_id,
                                                        'procesando'
                                                    )
                                                }
                                            >
                                                <Ionicons
                                                    name="construct"
                                                    size={20}
                                                    color={COLORS.white}
                                                />
                                                <Text style={styles.status_button_text}>
                                                    Marcar como Procesando
                                                </Text>
                                            </TouchableOpacity>
                                        )}

                                        {selected_order?.status === 'procesando' && (
                                            <TouchableOpacity
                                                style={[
                                                    styles.status_button,
                                                    { backgroundColor: '#2196F3' },
                                                ]}
                                                onPress={() =>
                                                    change_order_status(
                                                        selected_order.order_id,
                                                        'en_transito'
                                                    )
                                                }
                                            >
                                                <Ionicons
                                                    name="car"
                                                    size={20}
                                                    color={COLORS.white}
                                                />
                                                <Text style={styles.status_button_text}>
                                                    Marcar como En Tránsito
                                                </Text>
                                            </TouchableOpacity>
                                        )}

                                        {selected_order?.status === 'en_transito' && (
                                            <TouchableOpacity
                                                style={[
                                                    styles.status_button,
                                                    { backgroundColor: '#4CAF50' },
                                                ]}
                                                onPress={() =>
                                                    change_order_status(
                                                        selected_order.order_id,
                                                        'completado'
                                                    )
                                                }
                                            >
                                                <Ionicons
                                                    name="checkmark-circle"
                                                    size={20}
                                                    color={COLORS.white}
                                                />
                                                <Text style={styles.status_button_text}>
                                                    Marcar como Completado
                                                </Text>
                                            </TouchableOpacity>
                                        )}

                                        <TouchableOpacity
                                            style={[
                                                styles.status_button,
                                                { backgroundColor: '#F44336' },
                                            ]}
                                            onPress={() =>
                                                change_order_status(
                                                    selected_order.order_id,
                                                    'cancelado'
                                                )
                                            }
                                        >
                                            <Ionicons
                                                name="close-circle"
                                                size={20}
                                                color={COLORS.white}
                                            />
                                            <Text style={styles.status_button_text}>
                                                Cancelar Pedido
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
    header_top: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    header_title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    refresh_button: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 10,
        borderRadius: 20,
    },
    filters_container: {
        flexDirection: 'row',
    },
    filter_chip: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginRight: 10,
    },
    filter_chip_active: {
        backgroundColor: COLORS.white,
    },
    filter_text: {
        fontSize: 14,
        color: COLORS.white,
        fontWeight: '600',
    },
    filter_text_active: {
        color: COLORS.primary,
    },
    list_container: {
        padding: 15,
    },
    order_card: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    order_header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    order_id: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    order_date: {
        fontSize: 12,
        color: '#999',
        textTransform: 'capitalize',
    },
    customer_name: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    status_badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    status_text: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    order_info: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    info_row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    info_text: {
        fontSize: 14,
        color: '#666',
    },
    price_text: {
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    payment_method_row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    payment_method_text: {
        fontSize: 12,
        color: '#999',
    },
    view_button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        marginTop: 4,
    },
    view_button_text: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '600',
        marginRight: 4,
    },
    empty_container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
    },
    empty_text: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#999',
        marginTop: 15,
    },
    modal_overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modal_container: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    modal_header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modal_title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    modal_content: {
        padding: 20,
    },
    modal_section: {
        marginBottom: 20,
    },
    modal_section_title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    current_status: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 12,
        gap: 10,
    },
    current_status_text: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    payment_proof_image: {
        width: '100%',
        height: 300,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
    },
    order_item: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        gap: 12,
    },
    product_image: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    item_info: {
        flex: 1,
        justifyContent: 'space-between',
    },
    item_name: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    item_quantity: {
        fontSize: 13,
        color: '#666',
        marginBottom: 2,
    },
    item_price: {
        fontSize: 13,
        color: '#999',
    },
    item_total_container: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    item_total_label: {
        fontSize: 11,
        color: '#999',
        marginBottom: 2,
    },
    item_total: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    summary_container: {
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 15,
    },
    summary_row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    summary_total_label: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    summary_total_value: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    status_button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        gap: 8,
    },
    status_button_text: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.white,
    },
});

export default AdminOrdersScreen;
