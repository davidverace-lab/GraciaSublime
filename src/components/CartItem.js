import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors.js';
import QuantityCounter from './QuantityCounter.js';
import CartItemDetailModal from './CartItemDetailModal.js';

const CartItem = ({ item, on_update_quantity, on_remove }) => {
        const [showDetailModal, setShowDetailModal] = useState(false);
        const slideAnim = useRef(new Animated.Value(-50)).current;
        const fadeAnim = useRef(new Animated.Value(0)).current;

        useEffect(() => {
                console.log('🛒 CartItem - Item recibido:', item);
                console.log('🖼️ CartItem - custom_image:', item.custom_image);
                console.log('🎨 CartItem - custom_design:', item.custom_design);
                console.log('📝 CartItem - design_name:', item.design_name);

                Animated.parallel([
                        Animated.spring(slideAnim, {
                                toValue: 0,
                                tension: 50,
                                friction: 8,
                                useNativeDriver: true,
                        }),
                        Animated.timing(fadeAnim, {
                                toValue: 1,
                                duration: 300,
                                useNativeDriver: true,
                        }),
                ]).start();
        }, []);

        const handle_increment = () => {
                console.log('➕ Incrementando cantidad:', item.quantity + 1);
                on_update_quantity(item.quantity + 1);
        };

        const handle_decrement = () => {
                console.log('➖ Decrementando cantidad:', item.quantity - 1);
                if (item.quantity > 1) {
                        on_update_quantity(item.quantity - 1);
                } else {
                        on_remove();
                }
        };

        const handle_press_product = () => {
                console.log('🔍 Abriendo detalles del producto en el carrito');
                setShowDetailModal(true);
        };

        return (
                <>
                        <Animated.View
                                style={[
                                        styles.container,
                                        {
                                                opacity: fadeAnim,
                                                transform: [{ translateX: slideAnim }],
                                        }
                                ]}
                        >
                                <TouchableOpacity
                                        onPress={handle_press_product}
                                        activeOpacity={0.7}
                                        style={styles.product_info_container}
                                >
                                        {/* Imagen del producto o personalización */}
                                        <View style={styles.image_placeholder}>
                                                {item.custom_image ? (
                                                        <Image
                                                                source={{ uri: item.custom_image }}
                                                                style={styles.custom_image}
                                                                resizeMode="cover"
                                                        />
                                                ) : item.custom_design ? (
                                                        <View style={[styles.design_icon_container, { backgroundColor: item.custom_design.color || COLORS.primary }]}>
                                                                <Ionicons
                                                                        name={item.custom_design.icon || 'color-palette'}
                                                                        size={30}
                                                                        color={COLORS.white}
                                                                />
                                                        </View>
                                                ) : item.products?.image_url ? (
                                                        <Image
                                                                source={{ uri: item.products.image_url }}
                                                                style={styles.product_image}
                                                                resizeMode="cover"
                                                        />
                                                ) : item.products?.image ? (
                                                        <Image
                                                                source={item.products.image}
                                                                style={styles.product_image}
                                                                resizeMode="cover"
                                                        />
                                                ) : (
                                                        <View style={styles.placeholder_icon}>
                                                                <Ionicons name="cafe" size={40} color={COLORS.primary} />
                                                        </View>
                                                )}
                                        </View>

                                        <View style={styles.content}>
                                                <Text style={styles.name} numberOfLines={2}>{item.products?.name?.toUpperCase()}</Text>

                                                {/* Mostrar información de personalización */}
                                                {(item.custom_image || item.custom_design || item.design_name) && (
                                                        <View style={styles.customization_section}>
                                                                <View style={styles.customization_badge}>
                                                                        <Ionicons name="brush" size={12} color={COLORS.primary} />
                                                                        <Text style={styles.customization_text}>Personalizada</Text>
                                                                </View>

                                                                {item.design_name && (
                                                                        <Text style={styles.design_name_text}>
                                                                                Diseño: {item.design_name}
                                                                        </Text>
                                                                )}

                                                                {item.custom_image && (
                                                                        <View style={styles.image_info}>
                                                                                <Ionicons name="image" size={12} color={COLORS.textDark} />
                                                                                <Text style={styles.image_info_text}>Imagen personalizada</Text>
                                                                        </View>
                                                                )}
                                                        </View>
                                                )}

                                                {/* Mostrar talla y género si existen */}
                                                {item.product_variants && (
                                                        <View style={styles.variant_info_container}>
                                                                {item.product_variants.gender && (
                                                                        <View style={styles.variant_badge}>
                                                                                <Ionicons
                                                                                        name={item.product_variants.gender === 'male' ? 'male' : 'female'}
                                                                                        size={12}
                                                                                        color={COLORS.primary}
                                                                                />
                                                                                <Text style={styles.variant_text}>
                                                                                        {item.product_variants.gender === 'male' ? 'Hombre' : 'Mujer'}
                                                                                </Text>
                                                                        </View>
                                                                )}
                                                                <View style={styles.variant_badge}>
                                                                        <Ionicons name="resize-outline" size={12} color={COLORS.primary} />
                                                                        <Text style={styles.variant_text}>
                                                                                Talla: {item.product_variants.size?.toUpperCase()}
                                                                        </Text>
                                                                </View>
                                                        </View>
                                                )}

                                                {item.products?.category && (
                                                        <Text style={styles.category_text}>{item.products.category}</Text>
                                                )}
                                                <View style={styles.price_row}>
                                                        <Text style={styles.price}>${item.products?.price}</Text>
                                                        <Text style={styles.unit_text}>c/u</Text>
                                                </View>
                                                {item.quantity > 1 && (
                                                        <Text style={styles.subtotal_text}>
                                                                Subtotal: ${(item.products?.price || 0) * item.quantity}
                                                        </Text>
                                                )}
                                        </View>
                                </TouchableOpacity>

                                <View style={styles.quantity_container}>
                                        <QuantityCounter
                                                quantity={item.quantity}
                                                on_increment={handle_increment}
                                                on_decrement={handle_decrement}
                                                variant="small"
                                        />
                                </View>
                        </Animated.View>

                        {/* Modal de detalles del producto */}
                        <CartItemDetailModal
                                visible={showDetailModal}
                                item={item}
                                onClose={() => setShowDetailModal(false)}
                        />
                </>
        );
};

const styles = StyleSheet.create({
        container: {
                flexDirection: 'row',
                backgroundColor: COLORS.white,
                borderRadius: 20,
                padding: 15,
                marginBottom: 15,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 8,
                elevation: 5,
                borderWidth: 1,
                borderColor: '#f0f0f0',
        },
        product_info_container: {
                flexDirection: 'row',
                flex: 1,
                alignItems: 'center',
        },
        image_placeholder: {
                width: 85,
                height: 85,
                backgroundColor: COLORS.primaryLight,
                borderRadius: 18,
                marginRight: 15,
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
        },
        custom_image: {
                width: '100%',
                height: '100%',
        },
        product_image: {
                width: '100%',
                height: '100%',
        },
        placeholder_icon: {
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: COLORS.primaryLight,
        },
        design_icon_container: {
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
        },
        content: {
                flex: 1,
                paddingRight: 5,
        },
        name: {
                fontSize: 15,
                fontWeight: 'bold',
                color: COLORS.textDark,
                marginBottom: 4,
                lineHeight: 18,
        },
        category_text: {
                fontSize: 11,
                color: '#999',
                textTransform: 'capitalize',
                marginBottom: 4,
        },
        customization_section: {
                marginBottom: 5,
        },
        customization_badge: {
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.primaryLight,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 10,
                alignSelf: 'flex-start',
                marginBottom: 4,
        },
        customization_text: {
                fontSize: 11,
                color: COLORS.primary,
                fontWeight: '600',
                marginLeft: 4,
        },
        design_name_text: {
                fontSize: 11,
                color: COLORS.textDark,
                fontWeight: '500',
                marginBottom: 3,
        },
        image_info: {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                marginTop: 2,
        },
        image_info_text: {
                fontSize: 10,
                color: COLORS.textDark,
                fontStyle: 'italic',
        },
        price_row: {
                flexDirection: 'row',
                alignItems: 'baseline',
                marginBottom: 2,
        },
        price: {
                fontSize: 18,
                fontWeight: 'bold',
                color: COLORS.primary,
                marginRight: 4,
        },
        unit_text: {
                fontSize: 11,
                color: '#999',
        },
        subtotal_text: {
                fontSize: 13,
                fontWeight: '600',
                color: COLORS.textDark,
                marginTop: 2,
        },
        quantity_container: {
                marginLeft: 10,
        },
        variant_info_container: {
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 6,
                marginTop: 5,
                marginBottom: 5,
        },
        variant_badge: {
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#f0f0f0',
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 8,
                gap: 4,
        },
        variant_text: {
                fontSize: 11,
                color: COLORS.textDark,
                fontWeight: '600',
        },
});

export default CartItem;
