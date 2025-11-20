import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors.js';

const SimpleInput = ({
        placeholder,
        value,
        onChangeText,
        secureTextEntry = false,
        keyboardType = 'default',
        error = null,
        icon = null,
        showPasswordToggle = false,
        autoCapitalize = 'none',
        editable = true,
        maxLength,
        ...props
}) => {
        const [isPasswordVisible, setIsPasswordVisible] = useState(false);

        return (
                <View style={styles.container}>
                        <View style={[styles.inputWrapper, error && styles.inputError]}>
                                {icon && (
                                        <Ionicons
                                                name={icon}
                                                size={20}
                                                color={error ? COLORS.error : COLORS.textGray}
                                                style={styles.icon}
                                        />
                                )}
                                <TextInput
                                        style={[styles.input, icon && styles.inputWithIcon]}
                                        placeholder={placeholder}
                                        placeholderTextColor="#999"
                                        value={value}
                                        onChangeText={onChangeText}
                                        secureTextEntry={secureTextEntry && !isPasswordVisible}
                                        keyboardType={keyboardType}
                                        autoCapitalize={autoCapitalize}
                                        autoCorrect={false}
                                        editable={editable}
                                        maxLength={maxLength}
                                        {...props}
                                />
                                {showPasswordToggle && (
                                        <TouchableOpacity
                                                style={styles.passwordToggle}
                                                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                                                activeOpacity={0.7}
                                        >
                                                <Ionicons
                                                        name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                                                        size={22}
                                                        color={COLORS.textGray}
                                                />
                                        </TouchableOpacity>
                                )}
                        </View>
                        {error && (
                                <View style={styles.errorContainer}>
                                        <Ionicons name="alert-circle" size={14} color={COLORS.error} />
                                        <Text style={styles.errorText}>{error}</Text>
                                </View>
                        )}
                </View>
        );
};

const styles = StyleSheet.create({
        container: {
                marginBottom: 15,
        },
        inputWrapper: {
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.inputGray,
                borderRadius: 15,
                borderWidth: 2,
                borderColor: 'transparent',
                paddingRight: 15,
        },
        inputError: {
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
        inputWithIcon: {
                paddingLeft: 0,
        },
        passwordToggle: {
                padding: 5,
                marginLeft: 5,
        },
        errorContainer: {
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 5,
                marginLeft: 5,
        },
        errorText: {
                color: COLORS.error,
                fontSize: 12,
                marginLeft: 5,
                flex: 1,
        },
});

export default SimpleInput;
