import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../constants/colors.js';

const CustomButton = ({
        title,
        on_press,
        onPress,
        style,
        text_style,
        variant = 'primary',
        disabled = false,
}) => {
        const scaleAnim = useRef(new Animated.Value(1)).current;
        const pressHandler = on_press || onPress;

        const handlePressIn = () => {
                if (disabled) return;
                Animated.spring(scaleAnim, {
                        toValue: 0.95,
                        useNativeDriver: true,
                }).start();
        };

        const handlePressOut = () => {
                if (disabled) return;
                Animated.spring(scaleAnim, {
                        toValue: 1,
                        friction: 3,
                        tension: 40,
                        useNativeDriver: true,
                }).start();
        };

        return (
                <TouchableOpacity
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        onPress={pressHandler}
                        activeOpacity={disabled ? 1 : 0.7}
                        disabled={disabled}
                >
                        <Animated.View
                                style={[
                                        styles.button,
                                        variant === 'primary' ? styles.primary_button : styles.secondary_button,
                                        disabled && styles.disabled_button,
                                        style,
                                        { transform: [{ scale: scaleAnim }] },
                                ]}
                        >
                                <Text
                                        style={[
                                                styles.button_text,
                                                variant === 'primary' ? styles.primary_text : styles.secondary_text,
                                                disabled && styles.disabled_text,
                                                text_style,
                                        ]}
                                >
                                        {title}
                                </Text>
                        </Animated.View>
                </TouchableOpacity>
        );
};

const styles = StyleSheet.create({
        button: {
                height: 55,
                borderRadius: 25,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 6,
        },
        primary_button: {
                backgroundColor: COLORS.primary,
        },
        secondary_button: {
                backgroundColor: COLORS.white,
                borderWidth: 2,
                borderColor: COLORS.primary,
        },
        button_text: {
                fontSize: 16,
                fontWeight: '700',
                letterSpacing: 0.5,
        },
        primary_text: {
                color: COLORS.white,
        },
        secondary_text: {
                color: COLORS.primary,
        },
        disabled_button: {
                opacity: 0.6,
        },
        disabled_text: {
                opacity: 0.7,
        },
});

export default CustomButton;
