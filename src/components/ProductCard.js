import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors.js';
import { useFavorites } from '../context/FavoritesContext.js';

const ProductCard = ({ product, onPress }) => {
        const { is_favorite, toggle_favorite, favorites } = useFavorites();
        const [isAnimating, setIsAnimating] = useState(false);
        const productId = product.product_id || product.id;
        const [isFav, setIsFav] = useState(is_favorite(productId));

        const scaleAnim = useRef(new Animated.Value(0.9)).current;
        const fadeAnim = useRef(new Animated.Value(0)).current;
        const pressAnim = useRef(new Animated.Value(1)).current;
        const heartScaleAnim = useRef(new Animated.Value(1)).current;

        // Actualizar estado local cuando cambie la lista de favoritos
        useEffect(() => {
                setIsFav(is_favorite(productId));
        }, [favorites, productId, is_favorite]);

        useEffect(() => {
                Animated.parallel([
                        Animated.spring(scaleAnim, {
                                toValue: 1,
                                tension: 50,
                                friction: 7,
                                useNativeDriver: true,
                        }),
                        Animated.timing(fadeAnim, {
                                toValue: 1,
                                duration: 400,
                                useNativeDriver: true,
                        }),
                ]).start();
        }, []);

        const handlePressIn = () => {
                Animated.spring(pressAnim, {
                        toValue: 0.96,
                        useNativeDriver: true,
                }).start();
        };

        const handlePressOut = () => {
                Animated.spring(pressAnim, {
                        toValue: 1,
                        friction: 3,
                        useNativeDriver: true,
                }).start();
        };

        const handleToggleFavorite = async (e) => {
                e.stopPropagation();
                if (isAnimating) return;

                setIsAnimating(true);

                // Actualizar estado local inmediatamente para feedback visual
                setIsFav(!isFav);

                // Animación de corazón
                Animated.sequence([
                        Animated.timing(heartScaleAnim, {
                                toValue: 1.5,
                                duration: 150,
                                useNativeDriver: true,
                        }),
                        Animated.spring(heartScaleAnim, {
                                toValue: 1,
                                friction: 3,
                                useNativeDriver: true,
                        }),
                ]).start();

                const result = await toggle_favorite(product);

                // Si falla, revertir el estado
                if (!result.success) {
                        setIsFav(!isFav);
                }

                setIsAnimating(false);
        };

        return (
                <TouchableOpacity
                        onPress={onPress}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        activeOpacity={1}
                >
                        <Animated.View
                                style={[
                                        styles.card,
                                        {
                                                opacity: fadeAnim,
                                                transform: [
                                                        { scale: Animated.multiply(scaleAnim, pressAnim) }
                                                ],
                                        }
                                ]}
                        >
                                {/* Imagen del producto */}
                                <View style={styles.image_container}>
                                        {product.image_url ? (
                                                <Image
                                                        source={{ uri: product.image_url }}
                                                        style={styles.productImage}
                                                        resizeMode="cover"
                                                />
                                        ) : product.image ? (
                                                <Image
                                                        source={product.image}
                                                        style={styles.productImage}
                                                        resizeMode="cover"
                                                />
                                        ) : (
                                                <View style={styles.image_placeholder}>
                                                        <Ionicons name="cafe" size={60} color={COLORS.primary} style={styles.mugIcon} />
                                                </View>
                                        )}

                                        {/* Botón de favoritos */}
                                        <TouchableOpacity
                                                style={styles.favoriteButton}
                                                onPress={handleToggleFavorite}
                                                activeOpacity={0.8}
                                        >
                                                <Animated.View style={{ transform: [{ scale: heartScaleAnim }] }}>
                                                        <Ionicons
                                                                name={isFav ? 'heart' : 'heart-outline'}
                                                                size={26}
                                                                color={isFav ? '#FF0000' : COLORS.white}
                                                        />
                                                </Animated.View>
                                        </TouchableOpacity>
                                </View>

                                <View style={styles.content}>
                                        <Text style={styles.title}>{product.name.toUpperCase()}</Text>
                                        <Text style={styles.subtitle} numberOfLines={2}>
                                                {product.description}
                                        </Text>
                                        <View style={styles.priceRow}>
                                                <Text style={styles.price}>${product.price}</Text>
                                                <View style={styles.addButton}>
                                                        <Ionicons name="add" size={20} color={COLORS.white} />
                                                </View>
                                        </View>
                                </View>
                        </Animated.View>
                </TouchableOpacity>
        );
};

const styles = StyleSheet.create({
        card: {
                backgroundColor: COLORS.white,
                borderRadius: 25,
                overflow: 'hidden',
                marginBottom: 15,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 8,
        },
        image_container: {
                width: '100%',
                height: 200,
                position: 'relative',
                backgroundColor: '#f5f5f5',
                overflow: 'hidden',
        },
        productImage: {
                width: '100%',
                height: '100%',
        },
        image_placeholder: {
                width: '100%',
                height: '100%',
                backgroundColor: COLORS.primaryLight,
                justifyContent: 'center',
                alignItems: 'center',
        },
        mugIcon: {
                opacity: 0.7,
        },
        favoriteButton: {
                position: 'absolute',
                top: 10,
                right: 10,
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: 'rgba(0,0,0,0.6)',
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 6,
        },
        yellow_tag: {
                position: 'absolute',
                top: 15,
                right: 15,
                width: 45,
                height: 45,
                backgroundColor: COLORS.primary,
                borderRadius: 22.5,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.4,
                shadowRadius: 6,
                elevation: 6,
        },
        content: {
                padding: 18,
        },
        title: {
                fontSize: 18,
                fontWeight: '800',
                color: COLORS.textDark,
                marginBottom: 6,
                letterSpacing: 0.3,
        },
        subtitle: {
                fontSize: 13,
                color: '#666',
                marginBottom: 12,
                lineHeight: 19,
        },
        priceRow: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
        },
        price: {
                fontSize: 24,
                fontWeight: 'bold',
                color: COLORS.primary,
        },
        addButton: {
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: COLORS.primary,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
                elevation: 5,
        },
});

export default ProductCard;
