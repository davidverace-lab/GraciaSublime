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
import { sendPasswordResetEmail } from '../services/emailService.js';
import { validateEmail } from '../utils/validations.js';

const ForgotPasswordScreen = ({ navigation }) => {
        const [email, setEmail] = useState('');
        const [loading, setLoading] = useState(false);

        const handleSendCode = async () => {
                if (!email.trim()) {
                        Alert.alert('Error', 'Por favor ingresa tu email');
                        return;
                }

                // Validar formato de email usando la función de validación
                const emailValidation = validateEmail(email.trim());
                if (!emailValidation.isValid) {
                        Alert.alert('Error', emailValidation.error);
                        return;
                }

                setLoading(true);

                try {
                        // Enviar email de reset con Supabase
                        const result = await sendPasswordResetEmail(email.trim());

                        if (result.success) {
                                Alert.alert(
                                        '✅ Email Enviado',
                                        'Te hemos enviado un email con un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada.',
                                        [
                                                {
                                                        text: 'OK',
                                                        onPress: () => {
                                                                navigation.navigate('Login');
                                                        }
                                                }
                                        ]
                                );
                        } else {
                                Alert.alert('Error', result.error || 'No se pudo enviar el email de recuperación');
                        }
                } catch (error) {
                        console.error('Error enviando email:', error);
                        Alert.alert('Error', 'Ocurrió un error al enviar el email. Verifica tu conexión.');
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
                                                        Ingresa tu email y te enviaremos un enlace seguro para restablecer tu contraseña
                                                </Text>

                                                <CustomInput
                                                        placeholder="Email (Gmail, Outlook, Yahoo o Hotmail)"
                                                        value={email}
                                                        on_change_text={setEmail}
                                                        keyboard_type="email-address"
                                                        icon="mail-outline"
                                                        autoCapitalize="none"
                                                />

                                                <CustomButton
                                                        title={loading ? 'Enviando...' : 'Enviar Email de Recuperación'}
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
});

export default ForgotPasswordScreen;
