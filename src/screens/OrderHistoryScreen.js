import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors.js';
import { useOrders } from '../context/OrdersContext.js';
import { hasUserReviewedOrder } from '../services/reviewsService.js';
import { useAuth } from '../context/AuthContext.js';
import { addToCart } from '../services/cartService.js';
import { useCart } from '../context/CartContext.js';

const OrderHistoryScreen = ({ navigation }) => {
    const { orders } = useOrders();
    const { user } = useAuth();
    const { reload_cart } = useCart();
    const [reviewedOrders, setReviewedOrders] = useState({});
    const [reorderingOrder, setReorderingOrder] = useState(null);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const getStatusColor = (status) => {
        const normalizedStatus = status?.toLowerCase();
        switch (normalizedStatus) {
            case 'completado':
            case 'entregado':
            case 'delivered':
                return '#4CAF50';
            case 'en proceso':
            case 'en_proceso':
            case 'processing':
            case 'en camino':
            case 'enviado':
            case 'shipped':
                return '#FF9800';
            case 'pago_pendiente':
            case 'pago pendiente':
            case 'pending_payment':
                return '#9C27B0';
            case 'pendiente':
            case 'pending':
                return '#2196F3';
            case 'cancelado':
            case 'cancelled':
                return '#F44336';
            default:
                return '#999';
        }
    };

    const getStatusLabel = (status) => {
        const normalizedStatus = status?.toLowerCase();
        const statusLabels = {
            'pending': 'Pendiente',
            'pendiente': 'Pendiente',
            'pago_pendiente': 'Pago Pendiente',
            'pago pendiente': 'Pago Pendiente',
            'pending_payment': 'Pago Pendiente',
            'processing': 'En Proceso',
            'en_proceso': 'En Proceso',
            'en proceso': 'En Proceso',
            'shipped': 'En Camino',
            'enviado': 'En Camino',
            'en camino': 'En Camino',
            'delivered': 'Entregado',
            'entregado': 'Entregado',
            'completado': 'Completado',
            'cancelled': 'Cancelado',
            'cancelado': 'Cancelado',
        };
        return statusLabels[normalizedStatus] || status;
    };

    // Verificar qué pedidos ya tienen reseña
    useEffect(() => {
        const checkReviews = async () => {
            if (!user || orders.length === 0) return;

            const reviewStatus = {};
            for (const order of orders) {
                const { hasReviewed } = await hasUserReviewedOrder(user.id, order.order_id || order.id);
                reviewStatus[order.order_id || order.id] = hasReviewed;
            }
            setReviewedOrders(reviewStatus);
        };

        checkReviews();
    }, [orders, user]);

    // Verificar si el pedido está completado y puede recibir reseña
    const canReview = (order) => {
        const normalizedStatus = order.status?.toLowerCase();
        return (
            normalizedStatus === 'completado' ||
            normalizedStatus === 'entregado' ||
            normalizedStatus === 'delivered'
        );
    };

    const handleWriteReview = (order) => {
        navigation.navigate('WriteReview', { order });
    };

    const handleReorder = async (order) => {
        try {
            setReorderingOrder(order.id);

            // Agregar cada producto del pedido al carrito
            const addPromises = order.items.map(async (item) => {
                return await addToCart(
                    user.id,
                    item.product.product_id,
                    item.quantity,
                    item.variant_id || null,
                    item.custom_image || item.custom_design ? {
                        custom_image: item.custom_image,
                        custom_design: item.custom_design,
                        design_name: item.design_name
                    } : null
                );
            });

            const results = await Promise.all(addPromises);

            // Verificar si hubo errores
            const hasError = results.some(result => result.error);

            if (hasError) {
                throw new Error('Error al agregar algunos productos');
            }

            // Actualizar el carrito
            await reload_cart();

            // Mostrar mensaje de éxito
            alert('¡Productos agregados al carrito! Puedes continuar comprando o ir al carrito para finalizar tu pedido.');

        } catch (error) {
            console.error('Error al volver a comprar:', error);
            alert('Error al agregar los productos al carrito. Por favor intenta de nuevo.');
        } finally {
            setReorderingOrder(null);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mis Compras</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Lista de pedidos */}
            {orders.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="bag-outline" size={80} color="#ccc" />
                    <Text style={styles.emptyText}>No tienes compras aún</Text>
                    <Text style={styles.emptySubtext}>
                        ¡Explora nuestros productos y haz tu primera compra!
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    renderItem={({ item }) => (
                        <View style={styles.orderCard}>
                            <View style={styles.orderHeader}>
                                <View>
                                    <Text style={styles.orderId}>Pedido #{item.id}</Text>
                                    <Text style={styles.orderDate}>{formatDate(item.date)}</Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                                    <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.itemsContainer}>
                                <Text style={styles.itemsTitle}>Productos:</Text>
                                {item.items.map((orderItem, index) => (
                                    <View key={index} style={styles.itemRow}>
                                        <Text style={styles.itemName}>
                                            {orderItem.product.name}
                                        </Text>
                                        <Text style={styles.itemQuantity}>
                                            x{orderItem.quantity}
                                        </Text>
                                        <Text style={styles.itemPrice}>
                                            ${orderItem.product.price * orderItem.quantity}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Total:</Text>
                                <Text style={styles.totalAmount}>${item.total}</Text>
                            </View>

                            {/* Botón de volver a comprar */}
                            <View style={styles.reorderSection}>
                                <TouchableOpacity
                                    style={[
                                        styles.reorderButton,
                                        reorderingOrder === item.id && styles.reorderButtonDisabled
                                    ]}
                                    onPress={() => handleReorder(item)}
                                    disabled={reorderingOrder === item.id}
                                    activeOpacity={0.7}
                                >
                                    {reorderingOrder === item.id ? (
                                        <>
                                            <Ionicons name="hourglass-outline" size={20} color={COLORS.white} />
                                            <Text style={styles.reorderButtonText}>Agregando...</Text>
                                        </>
                                    ) : (
                                        <>
                                            <Ionicons name="cart-outline" size={20} color={COLORS.white} />
                                            <Text style={styles.reorderButtonText}>Volver a comprar</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* Botón de reseña si el pedido está completado */}
                            {canReview(item) && (
                                <View style={styles.reviewSection}>
                                    {reviewedOrders[item.order_id || item.id] ? (
                                        <View style={styles.reviewedBadge}>
                                            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                                            <Text style={styles.reviewedText}>Ya reseñaste este pedido</Text>
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            style={styles.reviewButton}
                                            onPress={() => handleWriteReview(item)}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="star" size={20} color={COLORS.white} />
                                            <Text style={styles.reviewButtonText}>Escribir Reseña</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        </View>
                    )}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingVertical: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.white,
        flex: 1,
        textAlign: 'center',
    },
    placeholder: {
        width: 34,
    },
    listContent: {
        padding: 15,
    },
    orderCard: {
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 1,
        borderColor: COLORS.inputGray,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    orderId: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginBottom: 4,
    },
    orderDate: {
        fontSize: 13,
        color: '#666',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    statusText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.inputGray,
        marginVertical: 12,
    },
    itemsContainer: {
        marginBottom: 8,
    },
    itemsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    itemName: {
        fontSize: 14,
        color: COLORS.textDark,
        flex: 1,
    },
    itemQuantity: {
        fontSize: 14,
        color: '#666',
        marginHorizontal: 10,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textDark,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textDark,
    },
    totalAmount: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginTop: 20,
        marginBottom: 10,
    },
    emptySubtext: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
    },
    reorderSection: {
        marginTop: 15,
    },
    reorderButton: {
        backgroundColor: COLORS.secondary || '#6C63FF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        gap: 8,
    },
    reorderButtonDisabled: {
        backgroundColor: '#999',
        opacity: 0.7,
    },
    reorderButtonText: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: '600',
    },
    reviewSection: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: COLORS.inputGray,
    },
    reviewButton: {
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        gap: 8,
    },
    reviewButtonText: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: '600',
    },
    reviewedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: '#E8F5E9',
        borderRadius: 12,
        gap: 8,
    },
    reviewedText: {
        color: '#4CAF50',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default OrderHistoryScreen;
