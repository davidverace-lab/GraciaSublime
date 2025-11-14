import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Modal,
    ScrollView,
    Image,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';
import { MOCK_ORDERS, initializeMockOrders } from '../utils/mockOrdersData';

const STATUS_COLORS = {
    Pendiente: { bg: '#FFE5E5', color: '#F44336', icon: 'time' },
    Procesando: { bg: '#FFF4E5', color: '#FF9800', icon: 'construct' },
    'En Tránsito': { bg: '#E3F2FD', color: '#2196F3', icon: 'car' },
    Completado: { bg: '#E8F5E9', color: '#4CAF50', icon: 'checkmark-circle' },
    Cancelado: { bg: '#F5F5F5', color: '#9E9E9E', icon: 'close-circle' },
};

const AdminOrdersScreen = () => {
    const [orders, set_orders] = useState([]);
    const [filter_status, set_filter_status] = useState('all');
    const [refreshing, set_refreshing] = useState(false);
    const [selected_order, set_selected_order] = useState(null);
    const [modal_visible, set_modal_visible] = useState(false);

    useEffect(() => {
        load_orders();
    }, []);

    const load_orders = async () => {
        try {
            const orders_data = await AsyncStorage.getItem('orders');
            if (orders_data) {
                const parsed_orders = JSON.parse(orders_data);
                // Ordenar por fecha más reciente
                parsed_orders.sort((a, b) => new Date(b.date) - new Date(a.date));
                set_orders(parsed_orders);
            }
        } catch (error) {
            console.error('Error al cargar pedidos:', error);
        }
    };

    const on_refresh = async () => {
        set_refreshing(true);
        await load_orders();
        set_refreshing(false);
    };

    const change_order_status = async (order_id, new_status) => {
        try {
            const updated_orders = orders.map((order) =>
                order.id === order_id ? { ...order, status: new_status } : order
            );
            set_orders(updated_orders);
            await AsyncStorage.setItem('orders', JSON.stringify(updated_orders));
            set_modal_visible(false);
        } catch (error) {
            console.error('Error al actualizar estado:', error);
        }
    };

    const get_filtered_orders = () => {
        if (filter_status === 'all') return orders;
        return orders.filter((order) => order.status === filter_status);
    };

    const load_mock_data = async () => {
        Alert.alert(
            'Cargar Datos de Ejemplo',
            '¿Deseas cargar datos de ejemplo de pedidos? Esto reemplazará todos los pedidos actuales.',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Cargar',
                    onPress: async () => {
                        try {
                            await AsyncStorage.setItem('orders', JSON.stringify(MOCK_ORDERS));
                            await load_orders();
                            Alert.alert('Éxito', 'Datos de ejemplo cargados correctamente');
                        } catch (error) {
                            Alert.alert('Error', 'No se pudieron cargar los datos de ejemplo');
                        }
                    },
                },
            ]
        );
    };

    const render_order = ({ item }) => {
        const status_style = STATUS_COLORS[item.status];

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
                        <Text style={styles.order_id}>Pedido #{item.id}</Text>
                        <Text style={styles.order_date}>
                            {new Date(item.date).toLocaleDateString('es-MX', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </Text>
                    </View>

                    <View style={[styles.status_badge, { backgroundColor: status_style.bg }]}>
                        <Ionicons name={status_style.icon} size={16} color={status_style.color} />
                        <Text style={[styles.status_text, { color: status_style.color }]}>
                            {item.status}
                        </Text>
                    </View>
                </View>

                <View style={styles.order_info}>
                    <View style={styles.info_row}>
                        <Ionicons name="cart-outline" size={18} color="#666" />
                        <Text style={styles.info_text}>{item.items.length} productos</Text>
                    </View>

                    <View style={styles.info_row}>
                        <Ionicons name="cash-outline" size={18} color="#666" />
                        <Text style={[styles.info_text, styles.price_text]}>
                            ${item.total.toFixed(2)} MXN
                        </Text>
                    </View>
                </View>

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
                    <TouchableOpacity onPress={load_mock_data} style={styles.mock_button}>
                        <Ionicons name="download-outline" size={20} color={COLORS.white} />
                        <Text style={styles.mock_button_text}>Datos de Ejemplo</Text>
                    </TouchableOpacity>
                </View>

                {/* Filtros */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filters_container}
                >
                    {['all', 'Pendiente', 'Procesando', 'En Tránsito', 'Completado'].map(
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
                                    {status === 'all' ? 'Todos' : status}
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
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list_container}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={on_refresh} />
                }
                ListEmptyComponent={
                    <View style={styles.empty_container}>
                        <Ionicons name="receipt-outline" size={80} color="#ccc" />
                        <Text style={styles.empty_text}>No hay pedidos</Text>
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
                                Pedido #{selected_order?.id}
                            </Text>
                            <TouchableOpacity onPress={() => set_modal_visible(false)}>
                                <Ionicons name="close" size={28} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modal_content}>
                            {/* Información del pedido */}
                            <View style={styles.modal_section}>
                                <Text style={styles.modal_section_title}>📋 Información del Pedido</Text>

                                <View style={styles.info_card}>
                                    <View style={styles.info_detail_row}>
                                        <Ionicons name="receipt-outline" size={20} color={COLORS.primary} />
                                        <View style={styles.info_detail_content}>
                                            <Text style={styles.info_detail_label}>ID de Pedido</Text>
                                            <Text style={styles.info_detail_value}>#{selected_order?.id}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.info_detail_row}>
                                        <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                                        <View style={styles.info_detail_content}>
                                            <Text style={styles.info_detail_label}>Fecha del Pedido</Text>
                                            <Text style={styles.info_detail_value}>
                                                {selected_order &&
                                                    new Date(selected_order.date).toLocaleDateString(
                                                        'es-MX',
                                                        {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        }
                                                    )}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.info_detail_row}>
                                        <Ionicons name="person-outline" size={20} color={COLORS.primary} />
                                        <View style={styles.info_detail_content}>
                                            <Text style={styles.info_detail_label}>Cliente</Text>
                                            <Text style={styles.info_detail_value}>
                                                {selected_order?.customer_name || 'No especificado'}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.info_detail_row}>
                                        <Ionicons name="card-outline" size={20} color={COLORS.primary} />
                                        <View style={styles.info_detail_content}>
                                            <Text style={styles.info_detail_label}>Método de Pago</Text>
                                            <Text style={styles.info_detail_value}>
                                                {selected_order?.payment_method || 'No especificado'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Dirección de Entrega */}
                            {selected_order?.delivery_address && (
                                <View style={styles.modal_section}>
                                    <Text style={styles.modal_section_title}>📍 Dirección de Entrega</Text>
                                    <View style={styles.address_card}>
                                        <Ionicons name="location" size={24} color={COLORS.primary} />
                                        <Text style={styles.address_text}>
                                            {selected_order.delivery_address}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {/* Notas del Pedido */}
                            {selected_order?.notes && (
                                <View style={styles.modal_section}>
                                    <Text style={styles.modal_section_title}>📝 Notas Especiales</Text>
                                    <View style={styles.notes_card}>
                                        <Text style={styles.notes_text}>{selected_order.notes}</Text>
                                    </View>
                                </View>
                            )}

                            {/* Estado actual */}
                            <View style={styles.modal_section}>
                                <Text style={styles.modal_section_title}>📊 Estado Actual</Text>
                                {selected_order && (
                                    <View
                                        style={[
                                            styles.current_status,
                                            {
                                                backgroundColor:
                                                    STATUS_COLORS[selected_order.status].bg,
                                            },
                                        ]}
                                    >
                                        <Ionicons
                                            name={STATUS_COLORS[selected_order.status].icon}
                                            size={24}
                                            color={STATUS_COLORS[selected_order.status].color}
                                        />
                                        <Text
                                            style={[
                                                styles.current_status_text,
                                                {
                                                    color: STATUS_COLORS[selected_order.status]
                                                        .color,
                                                },
                                            ]}
                                        >
                                            {selected_order.status}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Productos */}
                            <View style={styles.modal_section}>
                                <Text style={styles.modal_section_title}>
                                    🛍️ Productos ({selected_order?.items.length})
                                </Text>
                                {selected_order?.items.map((item, index) => (
                                    <View key={index} style={styles.order_item}>
                                        <Image
                                            source={item.product.image}
                                            style={styles.product_image}
                                        />
                                        <View style={styles.item_info}>
                                            <Text style={styles.item_name}>
                                                {item.product.name}
                                            </Text>
                                            <Text style={styles.item_quantity}>
                                                Cantidad: {item.quantity}
                                            </Text>
                                            <Text style={styles.item_price}>
                                                ${item.product.price.toFixed(2)} MXN c/u
                                            </Text>
                                        </View>
                                        <View style={styles.item_total_container}>
                                            <Text style={styles.item_total_label}>Total</Text>
                                            <Text style={styles.item_total}>
                                                ${(item.product.price * item.quantity).toFixed(2)}
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
                                        <Text style={styles.summary_label}>Subtotal</Text>
                                        <Text style={styles.summary_text}>
                                            ${selected_order?.total.toFixed(2)} MXN
                                        </Text>
                                    </View>
                                    {selected_order?.delivery_fee && (
                                        <View style={styles.summary_row}>
                                            <Text style={styles.summary_label}>Envío</Text>
                                            <Text style={styles.summary_text}>
                                                ${selected_order.delivery_fee.toFixed(2)} MXN
                                            </Text>
                                        </View>
                                    )}
                                    <View style={styles.summary_divider} />
                                    <View style={styles.summary_row}>
                                        <Text style={styles.summary_total_label}>Total</Text>
                                        <Text style={styles.summary_total_value}>
                                            $
                                            {(
                                                selected_order?.total +
                                                (selected_order?.delivery_fee || 0)
                                            ).toFixed(2)}{' '}
                                            MXN
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Cambiar estado */}
                            {selected_order?.status !== 'Completado' &&
                                selected_order?.status !== 'Cancelado' && (
                                    <View style={styles.modal_section}>
                                        <Text style={styles.modal_section_title}>
                                            Cambiar Estado
                                        </Text>

                                        {selected_order?.status === 'Pendiente' && (
                                            <TouchableOpacity
                                                style={[
                                                    styles.status_button,
                                                    { backgroundColor: '#FF9800' },
                                                ]}
                                                onPress={() =>
                                                    change_order_status(
                                                        selected_order.id,
                                                        'Procesando'
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

                                        {selected_order?.status === 'Procesando' && (
                                            <TouchableOpacity
                                                style={[
                                                    styles.status_button,
                                                    { backgroundColor: '#2196F3' },
                                                ]}
                                                onPress={() =>
                                                    change_order_status(
                                                        selected_order.id,
                                                        'En Tránsito'
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

                                        {selected_order?.status === 'En Tránsito' && (
                                            <TouchableOpacity
                                                style={[
                                                    styles.status_button,
                                                    { backgroundColor: '#4CAF50' },
                                                ]}
                                                onPress={() =>
                                                    change_order_status(
                                                        selected_order.id,
                                                        'Completado'
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
                                                    selected_order.id,
                                                    'Cancelado'
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
    mock_button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    mock_button_text: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.white,
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
    info_card: {
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 15,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    info_detail_row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 15,
        gap: 12,
    },
    info_detail_content: {
        flex: 1,
    },
    info_detail_label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#999',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    info_detail_value: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },
    address_card: {
        flexDirection: 'row',
        backgroundColor: '#E3F2FD',
        borderRadius: 12,
        padding: 15,
        gap: 12,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
    },
    address_text: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    notes_card: {
        backgroundColor: '#FFF4E5',
        borderRadius: 12,
        padding: 15,
        borderLeftWidth: 4,
        borderLeftColor: '#FF9800',
    },
    notes_text: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
        fontStyle: 'italic',
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
    summary_label: {
        fontSize: 14,
        color: '#666',
    },
    summary_text: {
        fontSize: 14,
        color: '#333',
    },
    summary_divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 10,
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
