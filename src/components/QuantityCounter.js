import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../constants/colors.js';

const QuantityCounter = ({
        quantity,
        on_increment,
        on_decrement,
        variant = 'default',
}) => {
        const is_small = variant === 'small';
        const scaleAnimDec = useRef(new Animated.Value(1)).current;
        const scaleAnimInc = useRef(new Animated.Value(1)).current;

        const handlePressInDec = () => {
                Animated.spring(scaleAnimDec, {
                        toValue: 0.85,
                        useNativeDriver: true,
                }).start();
        };

        const handlePressOutDec = () => {
                Animated.spring(scaleAnimDec, {
                        toValue: 1,
                        friction: 3,
                        useNativeDriver: true,
                }).start();
                on_decrement();
        };

        const handlePressInInc = () => {
                Animated.spring(scaleAnimInc, {
                        toValue: 0.85,
                        useNativeDriver: true,
                }).start();
        };

        const handlePressOutInc = () => {
                Animated.spring(scaleAnimInc, {
                        toValue: 1,
                        friction: 3,
                        useNativeDriver: true,
                }).start();
                on_increment();
        };

        return (
                <View style={styles.container}>
                        <TouchableOpacity
                                onPressIn={handlePressInDec}
                                onPressOut={handlePressOutDec}
                                activeOpacity={1}
                        >
                                <Animated.View
                                        style={[
                                                styles.button,
                                                is_small && styles.small_button,
                                                { transform: [{ scale: scaleAnimDec }] }
                                        ]}
                                >
                                        <Text style={[styles.button_text, is_small && styles.small_button_text]}>-</Text>
                                </Animated.View>
                        </TouchableOpacity>

                        <Text style={[styles.quantity, is_small && styles.small_quantity]}>{quantity}</Text>

                        <TouchableOpacity
                                onPressIn={handlePressInInc}
                                onPressOut={handlePressOutInc}
                                activeOpacity={1}
                        >
                                <Animated.View
                                        style={[
                                                styles.button,
                                                is_small && styles.small_button,
                                                { transform: [{ scale: scaleAnimInc }] }
                                        ]}
                                >
                                        <Text style={[styles.button_text, is_small && styles.small_button_text]}>+</Text>
                                </Animated.View>
                        </TouchableOpacity>
                </View>
        );
};

const styles = StyleSheet.create({
        container: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
        },
        button: {
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: COLORS.primary,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
                elevation: 5,
        },
        small_button: {
                width: 32,
                height: 32,
                borderRadius: 16,
        },
        button_text: {
                fontSize: 24,
                fontWeight: '700',
                color: COLORS.white,
        },
        small_button_text: {
                fontSize: 18,
        },
        quantity: {
                fontSize: 22,
                fontWeight: '800',
                color: COLORS.textDark,
                marginHorizontal: 20,
                minWidth: 35,
                textAlign: 'center',
        },
        small_quantity: {
                fontSize: 17,
                marginHorizontal: 15,
        },
});

export default QuantityCounter;
