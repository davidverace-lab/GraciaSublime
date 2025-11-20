import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors.js';

const CustomInput = ({
        placeholder,
        value,
        on_change_text,
        style,
        secure_text_entry = false,
        keyboard_type = 'default',
        error = null,
        show_password_toggle = false,
        icon = null,
        max_length = null,
        editable = true,
        autoCapitalize = 'none',
        ...props
}) => {
        const [is_password_visible, set_is_password_visible] = useState(false);
        const [shake_animation] = useState(new Animated.Value(0));

        // Animar shake cuando hay error
        React.useEffect(() => {
                if (error) {
                        Animated.sequence([
                                Animated.timing(shake_animation, { toValue: 10, duration: 50, useNativeDriver: true }),
                                Animated.timing(shake_animation, { toValue: -10, duration: 50, useNativeDriver: true }),
                                Animated.timing(shake_animation, { toValue: 10, duration: 50, useNativeDriver: true }),
                                Animated.timing(shake_animation, { toValue: 0, duration: 50, useNativeDriver: true }),
                        ]).start();
                }
        }, [error]);

        return (
                <View style={styles.container}>
                        <Animated.View
                                style={[
                                        styles.input_wrapper,
                                        error && styles.input_error,
                                        { transform: [{ translateX: shake_animation }] },
                                ]}
                        >
                                {icon && (
                                        <Ionicons
                                                name={icon}
                                                size={20}
                                                color={error ? COLORS.error : COLORS.textGray}
                                                style={styles.icon}
                                        />
                                )}
                                <TextInput
                                        style={[styles.input, icon && styles.input_with_icon, style]}
                                        placeholder={placeholder}
                                        placeholderTextColor="#999"
                                        value={value}
                                        onChangeText={on_change_text}
                                        secureTextEntry={secure_text_entry && !is_password_visible}
                                        keyboardType={keyboard_type}
                                        autoCapitalize={autoCapitalize}
                                        autoCorrect={false}
                                        returnKeyType="done"
                                        blurOnSubmit={true}
                                        maxLength={max_length}
                                        editable={editable}
                                        {...props}
                                />
                                {show_password_toggle && (
                                        <TouchableOpacity
                                                style={styles.password_toggle}
                                                onPress={() => set_is_password_visible(!is_password_visible)}
                                                activeOpacity={0.7}
                                        >
                                                <Ionicons
                                                        name={is_password_visible ? 'eye-off-outline' : 'eye-outline'}
                                                        size={22}
                                                        color={COLORS.textGray}
                                                />
                                        </TouchableOpacity>
                                )}
                        </Animated.View>
                        {error && (
                                <Animated.View
                                        style={styles.error_container}
                                        entering="fadeIn"
                                >
                                        <Ionicons name="alert-circle" size={14} color={COLORS.error} />
                                        <Text style={styles.error_text}>{error}</Text>
                                </Animated.View>
                        )}
                </View>
        );
};

const styles = StyleSheet.create({
        container: {
                marginBottom: 15,
        },
        input_wrapper: {
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.inputGray,
                borderRadius: 15,
                borderWidth: 2,
                borderColor: 'transparent',
                paddingRight: 15,
        },
        input_error: {
                borderColor: COLORS.error,
                backgroundColor: '#FFF5F5',
        },
        icon: {
                marginLeft: 15,
                marginRight: 10,
        },
        input: {
                flex: 1,
                height: 50,
                paddingHorizontal: 20,
                fontSize: 15,
                color: COLORS.textDark,
        },
        input_with_icon: {
                paddingLeft: 0,
        },
        password_toggle: {
                padding: 5,
                marginLeft: 5,
        },
        error_container: {
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 5,
                marginLeft: 5,
        },
        error_text: {
                color: COLORS.error,
                fontSize: 12,
                marginLeft: 5,
                flex: 1,
        },
});

export default CustomInput;
