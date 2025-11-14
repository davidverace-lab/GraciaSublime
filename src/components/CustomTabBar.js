import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors.js';

const { width } = Dimensions.get('window');

const CustomTabBar = ({ state, descriptors, navigation }) => {
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

                                                        {/* Dot indicator cuando está activo */}
                                                        {isFocused && (
                                                                <Animated.View
                                                                        style={[
                                                                                styles.activeDot,
                                                                                {
                                                                                        opacity: scaleAnims[index].interpolate({
                                                                                                inputRange: [1, 1.2],
                                                                                                outputRange: [0, 1],
                                                                                        }),
                                                                                },
                                                                        ]}
                                                                />
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
        activeDot: {
                position: 'absolute',
                bottom: -8,
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: COLORS.primary,
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
});

export default CustomTabBar;
