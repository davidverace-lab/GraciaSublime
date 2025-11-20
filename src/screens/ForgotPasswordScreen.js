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
        TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors.js';
import CustomButton from '../components/CustomButton.js';
import CustomInput from '../components/CustomInput.js';
import { sendRecoveryCode } from '../services/passwordResetService.js';
import { validateEmail } from '../utils/validations.js';

const ForgotPasswordScreen = ({ navigation }) => {
        const [email, setEmail] = useState('');
        const [loading, setLoading] = useState(false);
        const [errors, setErrors] = useState({});

        const handleSendCode = async () => {
                // Limpiar errores previos
                setErrors({});

                if (!email.trim()) {
                        setErrors({ email: 'Por favor ingresa tu email' });
                        return;
                }

                // Validar formato de email usando la función de validación
                const emailValidation = validateEmail(email.trim());
                if (!emailValidation.isValid) {
                        setErrors({ email: emailValidation.error });
                        return;
                }

                setLoading(true);

                try {
                        // Enviar código de 6 dígitos
                        const result = await sendRecoveryCode(email.trim());

                        if (result.success) {
                                // Mostrar código para facilitar pruebas y presentaciones
                                const codeMessage = result.devCode
                                        ? `\n\n🔐 Tu código de verificación:\n\n${result.devCode}\n\n(También se envió a tu email)`
                                        : '';

                                Alert.alert(
                                        '✅ Código Enviado',
                                        `Te hemos enviado un código de 6 dígitos a tu email. Por favor revisa tu bandeja de entrada.${codeMessage}`,
                                        [
                                                {
                                                        text: 'Continuar',
                                                        onPress: () => {
                                                                // Navegar a pantalla de verificación de código
                                                                navigation.navigate('VerifyCode', {
                                                                        email: email.trim(),
                                                                        devCode: result.devCode
                                                                });
                                                        }
                                                }
                                        ]
                                );
                        } else {
                                setErrors({ general: result.error || 'No se pudo enviar el código de recuperación' });
                        }
                } catch (error) {
                        console.error('Error enviando código:', error);
                        setErrors({ general: 'Ocurrió un error al enviar el código. Verifica tu conexión.' });
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
                                                <TouchableOpacity
                                                        style={styles.backButton}
                                                        onPress={() => navigation.goBack()}
                                                >
                                                        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
                                                </TouchableOpacity>
                                                <View style={styles.iconContainer}>
                                                        <Ionicons name="lock-closed" size={60} color={COLORS.primary} />
                                                </View>
                                        </View>

                                        {/* Content */}
                                        <View style={styles.content}>
                                                <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
                                                <Text style={styles.subtitle}>
                                                        Ingresa tu email y te enviaremos un código de 6 dígitos para restablecer tu contraseña
                                                </Text>

                                                {/* Error general */}
                                                {errors.general && (
                                                        <View style={styles.general_error}>
                                                                <Text style={styles.general_error_text}>{errors.general}</Text>
                                                        </View>
                                                )}

                                                <CustomInput
                                                        placeholder="Email (personal o institucional)"
                                                        value={email}
                                                        on_change_text={(text) => {
                                                                setEmail(text);
                                                                if (errors.email) {
                                                                        setErrors({ ...errors, email: null });
                                                                }
                                                        }}
                                                        keyboard_type="email-address"
                                                        icon="mail-outline"
                                                        autoCapitalize="none"
                                                        editable={true}
                                                        error={errors.email}
                                                />

                                                <CustomButton
                                                        title={loading ? 'Enviando...' : 'Enviar Código de Recuperación'}
                                                        on_press={handleSendCode}
                                                        disabled={loading}
                                                />

                                                <TouchableOpacity
                                                        style={styles.backToLogin}
                                                        onPress={() => navigation.navigate('Login')}
                                                >
                                                        <Ionicons name="arrow-back" size={16} color={COLORS.primary} />
                                                        <Text style={styles.backToLoginText}>Volver al inicio de sesión</Text>
                                                </TouchableOpacity>
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
                paddingTop: 20,
                paddingHorizontal: 20,
                paddingBottom: 40,
                alignItems: 'center',
        },
        backButton: {
                alignSelf: 'flex-start',
                padding: 10,
                marginBottom: 20,
        },
        iconContainer: {
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: COLORS.primaryLight,
                justifyContent: 'center',
                alignItems: 'center',
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
                paddingHorizontal: 10,
        },
        backToLogin: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 20,
                gap: 8,
        },
        backToLoginText: {
                fontSize: 14,
                color: COLORS.primary,
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

export default ForgotPasswordScreen;
