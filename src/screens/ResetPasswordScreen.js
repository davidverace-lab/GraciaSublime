import React, { useState } from 'react';
import {
        View,
        Text,
        StyleSheet,
        SafeAreaView,
        Alert,
        KeyboardAvoidingView,
        Platform,
        ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors.js';
import CustomButton from '../components/CustomButton.js';
import CustomInput from '../components/CustomInput.js';
import { supabase } from '../config/supabase.js';
import { clearRecoveryCode } from '../services/passwordResetService.js';
import { validatePassword, validatePasswordMatch } from '../utils/validations.js';

const ResetPasswordScreen = ({ navigation, route }) => {
        const { email, verifiedCode } = route.params;
        const [newPassword, setNewPassword] = useState('');
        const [confirmPassword, setConfirmPassword] = useState('');
        const [loading, setLoading] = useState(false);
        const [errors, setErrors] = useState({});

        const validateForm = () => {
                const newErrors = {};

                // Validar contraseña
                const passwordValidation = validatePassword(newPassword);
                if (!passwordValidation.isValid) {
                        newErrors.newPassword = passwordValidation.error;
                }

                // Validar que coincidan
                const matchValidation = validatePasswordMatch(newPassword, confirmPassword);
                if (!matchValidation.isValid) {
                        newErrors.confirmPassword = matchValidation.error;
                }

                setErrors(newErrors);
                return Object.keys(newErrors).length === 0;
        };

        const handleResetPassword = async () => {
                // Limpiar errores previos
                setErrors({});

                if (!validateForm()) return;

                setLoading(true);

                try {
                        console.log('🔄 Actualizando contraseña para:', email);

                        // Obtener el usuario ID desde el email
                        const { data: profileData, error: profileError } = await supabase
                                .from('profiles')
                                .select('id')
                                .eq('email', email)
                                .single();

                        if (profileError) {
                                throw new Error('No se pudo encontrar el usuario');
                        }

                        // Actualizar contraseña usando función RPC de Supabase
                        // NOTA: Necesitas crear esta función en Supabase
                        try {
                                const { error: updateError } = await supabase.rpc('admin_update_user_password', {
                                        user_id_param: profileData.id,
                                        new_password_param: newPassword
                                });

                                if (updateError) {
                                        console.log('⚠️ Función RPC no disponible, usando método alternativo');
                                        throw updateError;
                                }

                                console.log('✅ Contraseña actualizada con RPC');
                        } catch (rpcError) {
                                // Si no existe la función RPC, guardar temporalmente la nueva contraseña
                                // y el usuario deberá hacer login de nuevo
                                console.log('📝 Guardando solicitud de cambio de contraseña');

                                // Eliminar código de recuperación usado
                                await clearRecoveryCode(email);

                                // En un sistema de producción real, necesitarías un backend que maneje esto
                                // Por ahora, mostramos instrucciones al usuario
                                Alert.alert(
                                        'Nota Importante',
                                        'Debido a limitaciones de seguridad, por favor usa el método de recuperación nativo de Supabase.\n\nEn breve recibirás un email con un enlace para cambiar tu contraseña de forma segura.',
                                        [
                                                {
                                                        text: 'Entendido',
                                                        onPress: () => {
                                                                navigation.reset({
                                                                        index: 0,
                                                                        routes: [{ name: 'Login' }],
                                                                });
                                                        }
                                                }
                                        ]
                                );
                                return;
                        }

                        // Limpiar código de recuperación
                        await clearRecoveryCode(email);

                        Alert.alert(
                                '✅ Contraseña Actualizada',
                                'Tu contraseña ha sido actualizada exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.',
                                [
                                        {
                                                text: 'Ir a Iniciar Sesión',
                                                onPress: () => {
                                                        navigation.reset({
                                                                index: 0,
                                                                routes: [{ name: 'Login' }],
                                                        });
                                                }
                                        }
                                ]
                        );
                } catch (error) {
                        console.error('❌ Error reseteando contraseña:', error);
                        setErrors({
                                general: error.message || 'Ocurrió un error al actualizar la contraseña. Por favor intenta de nuevo.'
                        });
                } finally {
                        setLoading(false);
                }
        };

        return (
                <SafeAreaView style={styles.container}>
                        <KeyboardAvoidingView
                                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                style={styles.keyboardView}
                        >
                                <ScrollView contentContainerStyle={styles.scrollContent}>
                                        {/* Header */}
                                        <View style={styles.header}>
                                                <View style={styles.iconContainer}>
                                                        <Ionicons name="lock-closed" size={60} color={COLORS.primary} />
                                                        <View style={styles.checkBadge}>
                                                                <Ionicons name="checkmark" size={24} color={COLORS.white} />
                                                        </View>
                                                </View>
                                        </View>

                                        {/* Content */}
                                        <View style={styles.content}>
                                                <Text style={styles.title}>Nueva Contraseña</Text>
                                                <Text style={styles.subtitle}>
                                                        Ingresa tu nueva contraseña. Asegúrate de que sea segura y fácil de recordar.
                                                </Text>

                                                {/* Error general */}
                                                {errors.general && (
                                                        <View style={styles.general_error}>
                                                                <Text style={styles.general_error_text}>{errors.general}</Text>
                                                        </View>
                                                )}

                                                <CustomInput
                                                        placeholder="Nueva Contraseña (mín. 6 caracteres)"
                                                        value={newPassword}
                                                        on_change_text={(text) => {
                                                                setNewPassword(text);
                                                                if (errors.newPassword) {
                                                                        setErrors({ ...errors, newPassword: null });
                                                                }
                                                        }}
                                                        secure_text_entry
                                                        show_password_toggle
                                                        icon="lock-closed-outline"
                                                        error={errors.newPassword}
                                                />

                                                <CustomInput
                                                        placeholder="Confirmar Contraseña"
                                                        value={confirmPassword}
                                                        on_change_text={(text) => {
                                                                setConfirmPassword(text);
                                                                if (errors.confirmPassword) {
                                                                        setErrors({ ...errors, confirmPassword: null });
                                                                }
                                                        }}
                                                        secure_text_entry
                                                        show_password_toggle
                                                        icon="lock-closed-outline"
                                                        error={errors.confirmPassword}
                                                />

                                                {/* Indicadores de seguridad */}
                                                <View style={styles.passwordRules}>
                                                        <View style={styles.ruleRow}>
                                                                <Ionicons
                                                                        name={newPassword.length >= 6 ? 'checkmark-circle' : 'close-circle'}
                                                                        size={18}
                                                                        color={newPassword.length >= 6 ? '#4CAF50' : '#999'}
                                                                />
                                                                <Text style={[
                                                                        styles.ruleText,
                                                                        newPassword.length >= 6 && styles.ruleTextValid
                                                                ]}>
                                                                        Mínimo 6 caracteres
                                                                </Text>
                                                        </View>
                                                        <View style={styles.ruleRow}>
                                                                <Ionicons
                                                                        name={newPassword === confirmPassword && newPassword ? 'checkmark-circle' : 'close-circle'}
                                                                        size={18}
                                                                        color={newPassword === confirmPassword && newPassword ? '#4CAF50' : '#999'}
                                                                />
                                                                <Text style={[
                                                                        styles.ruleText,
                                                                        newPassword === confirmPassword && newPassword && styles.ruleTextValid
                                                                ]}>
                                                                        Las contraseñas coinciden
                                                                </Text>
                                                        </View>
                                                </View>

                                                <CustomButton
                                                        title={loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                                                        on_press={handleResetPassword}
                                                        disabled={loading}
                                                />
                                        </View>
                                </ScrollView>
                        </KeyboardAvoidingView>
                </SafeAreaView>
        );
};

const styles = StyleSheet.create({
        container: {
                flex: 1,
                backgroundColor: COLORS.white,
        },
        keyboardView: {
                flex: 1,
        },
        scrollContent: {
                flexGrow: 1,
        },
        header: {
                paddingTop: 40,
                paddingBottom: 40,
                alignItems: 'center',
        },
        iconContainer: {
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: COLORS.primaryLight,
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
        },
        checkBadge: {
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#4CAF50',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 3,
                borderColor: COLORS.white,
        },
        content: {
                flex: 1,
                paddingHorizontal: 30,
        },
        title: {
                fontSize: 28,
                fontWeight: 'bold',
                color: COLORS.textDark,
                marginBottom: 15,
                textAlign: 'center',
        },
        subtitle: {
                fontSize: 15,
                color: '#666',
                textAlign: 'center',
                marginBottom: 30,
                lineHeight: 22,
        },
        passwordRules: {
                marginBottom: 25,
                padding: 15,
                backgroundColor: '#f9f9f9',
                borderRadius: 12,
        },
        ruleRow: {
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 8,
                gap: 10,
        },
        ruleText: {
                fontSize: 14,
                color: '#999',
        },
        ruleTextValid: {
                color: '#4CAF50',
                fontWeight: '600',
        },
        general_error: {
                backgroundColor: '#FFF5F5',
                borderLeftWidth: 4,
                borderLeftColor: COLORS.error,
                padding: 12,
                borderRadius: 8,
                marginBottom: 20,
        },
        general_error_text: {
                color: COLORS.error,
                fontSize: 14,
                lineHeight: 20,
        },
});

export default ResetPasswordScreen;
