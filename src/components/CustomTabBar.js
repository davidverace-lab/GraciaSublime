import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors.js';
import { useCart } from '../context/CartContext.js';

const { width } = Dimensions.get('window');

const CustomTabBar = ({ state, descriptors, navigation }) => {
        const { get_item_count } = useCart();
        const cart_count = get_item_count();
        const tabWidth = width / state.routes.length;
        const translateX = useRef(new Animated.Value(0)).current;
        const scaleAnims = useRef(state.routes.map(() => new Animated.Value(1))).current;

        useEffect(() => {
                // Animar el indicador cuando cambia la pestaña
                Animated.spring(translateX, {
                        toValue: state.index * tabWidth,
                        tension: 80,
                        friction: 10,
                        useNativeDriver: true,
                }).start();

                // Animar el ícono seleccionado
                scaleAnims.forEach((anim, index) => {
                        Animated.spring(anim, {
                                toValue: state.index === index ? 1.2 : 1,
                                tension: 100,
                                friction: 7,
                                useNativeDriver: true,
                        }).start();
                });
        }, [state.index]);

        const getIconName = (routeName, isFocused) => {
                const icons = {
                        Home: isFocused ? 'home' : 'home-outline',
                        Categories: isFocused ? 'grid' : 'grid-outline',
                        Favorites: isFocused ? 'heart' : 'heart-outline',
                        Templates: isFocused ? 'brush' : 'brush-outline',
                        Cart: isFocused ? 'cart' : 'cart-outline',
                };
                return icons[routeName] || 'help-outline';
        };

        return (
                <View style={styles.container}>
                        {/* Animated Indicator */}
                        <Animated.View
                                style={[
                                        styles.indicator,
                                        {
                                                width: tabWidth,
                                                transform: [{ translateX }],
                                        },
                                ]}
                        />

                        {/* Tab Buttons */}
                        {state.routes.map((route, index) => {
                                const { options } = descriptors[route.key];
                                const label = options.tabBarLabel || route.name;
                                const isFocused = state.index === index;

                                const onPress = () => {
                                        const event = navigation.emit({
                                                type: 'tabPress',
                                                target: route.key,
                                                canPreventDefault: true,
                                        });

                                        if (!isFocused && !event.defaultPrevented) {
                                                navigation.navigate(route.name);
                                        }
                                };

                                const onLongPress = () => {
                                        navigation.emit({
                                                type: 'tabLongPress',
                                                target: route.key,
                                        });
                                };

                                return (
                                        <TouchableOpacity
                                                key={route.key}
                                                accessibilityRole="button"
                                                accessibilityState={isFocused ? { selected: true } : {}}
                                                accessibilityLabel={options.tabBarAccessibilityLabel}
                                                testID={options.tabBarTestID}
                                                onPress={onPress}
                                                onLongPress={onLongPress}
                                                style={styles.tab}
                                                activeOpacity={0.7}
                                        >
                                                <Animated.View
                                                        style={[
                                                                styles.iconContainer,
                                                                {
                                                                        transform: [{ scale: scaleAnims[index] }],
                                                                },
                                                        ]}
                                                >
                                                        <Ionicons
                                                                name={getIconName(route.name, isFocused)}
                                                                size={26}
                                                                color={isFocused ? COLORS.primary : '#999'}
                                                        />

                                                        {/* Badge de contador para el carrito */}
                                                        {route.name === 'Cart' && cart_count > 0 && (
                                                                <View style={styles.badge}>
                                                                        <Text style={styles.badgeText}>
                                                                                {cart_count > 99 ? '99+' : cart_count}
                                                                        </Text>
                                                                </View>
                                                        )}
                                                </Animated.View>

                                                <Text
                                                        style={[
                                                                styles.label,
                                                                isFocused ? styles.labelFocused : styles.labelUnfocused,
                                                        ]}
                                                >
                                                        {label}
                                                </Text>
                                        </TouchableOpacity>
                                );
                        })}
                </View>
        );
};

const styles = StyleSheet.create({
        container: {
                flexDirection: 'row',
                height: 65,
                backgroundColor: COLORS.white,
                borderTopWidth: 0,
                elevation: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -3 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
                paddingBottom: 10,
                paddingTop: 8,
        },
        indicator: {
                position: 'absolute',
                top: 0,
                height: 3,
                backgroundColor: COLORS.primary,
                borderBottomLeftRadius: 3,
                borderBottomRightRadius: 3,
        },
        tab: {
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
        },
        iconContainer: {
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 4,
        },
        label: {
                fontSize: 12,
                fontWeight: '600',
        },
        labelFocused: {
                color: COLORS.primary,
        },
        labelUnfocused: {
                color: '#999',
        },
        badge: {
                position: 'absolute',
                top: -4,
                right: -10,
                backgroundColor: '#FF3B30',
                borderRadius: 10,
                minWidth: 18,
                height: 18,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 4,
                borderWidth: 2,
                borderColor: COLORS.white,
        },
        badgeText: {
                color: COLORS.white,
                fontSize: 10,
                fontWeight: 'bold',
        },
});

export default CustomTabBar;
