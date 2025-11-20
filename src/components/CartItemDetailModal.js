import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Image,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors.js';

const CartItemDetailModal = ({ visible, item, onClose }) => {
    if (!item) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Detalles del Producto</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={28} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Imagen del producto o personalización */}
                        <View style={styles.imageContainer}>
                            {item.custom_image ? (
                                <View>
                                    <Image
                                        source={{ uri: item.custom_image }}
                                        style={styles.productImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.customBadge}>
                                        <Ionicons name="brush" size={16} color={COLORS.white} />
                                        <Text style={styles.customBadgeText}>Imagen Personalizada</Text>
                                    </View>
                                </View>
                            ) : item.custom_design ? (
                                <View style={[styles.designContainer, { backgroundColor: item.custom_design.color || COLORS.primary }]}>
                                    <Ionicons
                                        name={item.custom_design.icon || 'color-palette'}
                                        size={80}
                                        color={COLORS.white}
                                    />
                                </View>
                            ) : item.products?.image_url ? (
                                <Image
                                    source={{ uri: item.products.image_url }}
                                    style={styles.productImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={styles.placeholderImage}>
                                    <Ionicons name="image-outline" size={60} color="#ccc" />
                                </View>
                            )}
                        </View>

                        {/* Información del producto */}
                        <View style={styles.infoSection}>
                            <Text style={styles.productName}>{item.products?.name?.toUpperCase()}</Text>

                            {item.products?.description && (
                                <Text style={styles.description}>{item.products.description}</Text>
                            )}

                            {/* Personalización */}
                            {(item.custom_image || item.custom_design || item.design_name) && (
                                <View style={styles.customizationSection}>
                                    <View style={styles.sectionHeader}>
                                        <Ionicons name="brush" size={20} color={COLORS.primary} />
                                        <Text style={styles.sectionTitle}>Personalización</Text>
                                    </View>

                                    {item.design_name && (
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>Diseño:</Text>
                                            <Text style={styles.detailValue}>{item.design_name}</Text>
                                        </View>
                                    )}

                                    {item.custom_image && (
                                        <View style={styles.detailRow}>
                                            <Ionicons name="image" size={16} color={COLORS.textDark} />
                                            <Text style={styles.detailValue}>Imagen personalizada cargada</Text>
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* Variante (talla y género) */}
                            {item.product_variants && (
                                <View style={styles.variantSection}>
                                    <View style={styles.sectionHeader}>
                                        <Ionicons name="resize-outline" size={20} color={COLORS.primary} />
                                        <Text style={styles.sectionTitle}>Variante</Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Talla:</Text>
                                        <Text style={styles.detailValue}>{item.product_variants.size?.toUpperCase()}</Text>
                                    </View>

                                    {item.product_variants.gender && (
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>Género:</Text>
                                            <Text style={styles.detailValue}>
                                                {item.product_variants.gender === 'male' ? 'Hombre' : 'Mujer'}
                                            </Text>
                                        </View>
                                    )}

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Stock disponible:</Text>
                                        <Text style={styles.detailValue}>{item.product_variants.stock} unidades</Text>
                                    </View>
                                </View>
                            )}

                            {/* Detalles del pedido */}
                            <View style={styles.orderSection}>
                                <View style={styles.sectionHeader}>
                                    <Ionicons name="cart" size={20} color={COLORS.primary} />
                                    <Text style={styles.sectionTitle}>Detalles del Pedido</Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Precio unitario:</Text>
                                    <Text style={styles.detailValue}>${item.products?.price}</Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Cantidad:</Text>
                                    <Text style={styles.detailValue}>{item.quantity} {item.quantity === 1 ? 'pieza' : 'piezas'}</Text>
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.detailRow}>
                                    <Text style={styles.totalLabel}>Subtotal:</Text>
                                    <Text style={styles.totalValue}>${(item.products?.price * item.quantity).toFixed(2)}</Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        maxHeight: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 10,
    },
    header: {
        backgroundColor: COLORS.primary,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    closeButton: {
        padding: 5,
    },
    content: {
        flex: 1,
    },
    imageContainer: {
        width: '100%',
        height: 300,
        backgroundColor: COLORS.primaryLight,
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    designContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    customBadge: {
        position: 'absolute',
        top: 15,
        right: 15,
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    customBadgeText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '600',
    },
    infoSection: {
        padding: 20,
    },
    productName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginBottom: 10,
    },
    description: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 20,
    },
    customizationSection: {
        backgroundColor: COLORS.primaryLight,
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
    },
    variantSection: {
        backgroundColor: '#f5f5f5',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
    },
    orderSection: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textDark,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        gap: 10,
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 14,
        color: COLORS.textDark,
        fontWeight: '600',
        flex: 1,
        textAlign: 'right',
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 10,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textDark,
    },
    totalValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
});

export default CartItemDetailModal;
