import React from 'react';
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

const OrderHistoryScreen = ({ navigation }) => {
    const { orders } = useOrders();

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completado':
                return '#4CAF50';
            case 'En proceso':
                return '#FF9800';
            case 'Cancelado':
                return '#F44336';
            default:
                return '#999';
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
                                    <Text style={styles.statusText}>{item.status}</Text>
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
});

export default OrderHistoryScreen;
