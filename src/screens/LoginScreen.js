import React, { useState } from 'react';
import {
        View,
        Text,
        StyleSheet,
        SafeAreaView,
        KeyboardAvoidingView,
        Platform,
        ScrollView,
        Image,
        TouchableOpacity,
} from 'react-native';
import { COLORS } from '../constants/colors.js';
import CustomButton from '../components/CustomButton.js';
import SimpleInput from '../components/SimpleInput.js';
import { useAuth } from '../context/AuthContext.js';
import { useNotifications } from '../context/NotificationsContext.js';
import { validateEmail } from '../utils/validations.js';

const LoginScreen = ({ navigation }) => {
        const { login, is_admin, view_mode } = useAuth();
        const { add_notification } = useNotifications();
        const [email_or_phone, set_email_or_phone] = useState('');
        const [password, set_password] = useState('');
        const [loading, set_loading] = useState(false);
        const [errors, set_errors] = useState({});

        const validate_form = () => {
                const new_errors = {};

                // Validar email o teléfono
                if (!email_or_phone.trim()) {
                        new_errors.email_or_phone = 'Este campo es obligatorio';
                } else {
                        // Detectar si es email
                        const is_email = email_or_phone.includes('@');
                        if (is_email) {
                                const email_validation = validateEmail(email_or_phone);
                                if (!email_validation.isValid) {
                                        new_errors.email_or_phone = email_validation.error;
                                }
                        }
                        // Si es teléfono, no validamos aquí porque el login acepta ambos
                }

                // Validar contraseña
                if (!password.trim()) {
                        new_errors.password = 'La contraseña es obligatoria';
                } else if (password.length < 6) {
                        new_errors.password = 'La contraseña debe tener al menos 6 caracteres';
                }

                set_errors(new_errors);
                return Object.keys(new_errors).length === 0;
        };

        const handle_login = async () => {
                // Limpiar errores previos
                set_errors({});

                // Validar formulario
                if (!validate_form()) {
                        return;
                }

                set_loading(true);

                try {
                        // Detectar si es email o teléfono
                        const identifier = email_or_phone.trim();
                        const result = await login(identifier, password);

                        if (result.success) {
                                // Esperar un poco para que se cargue el perfil y se detecte si es admin
                                setTimeout(() => {
                                        // Siempre llevar a AdminDrawer si es admin, MainDrawer si no
                                        const targetRoute = is_admin ? 'AdminDrawer' : 'MainDrawer';

                                        console.log('🔄 Redirigiendo a:', targetRoute, '| is_admin:', is_admin, '| view_mode:', view_mode);

                                        navigation.reset({
                                                index: 0,
                                                routes: [{ name: targetRoute }],
                                        });

                                        // Agregar notificación de bienvenida después de navegar (evita race condition)
                                        setTimeout(() => {
                                                add_notification(`¡Bienvenido de nuevo, ${result.userName || 'Usuario'}! 👋 Nos alegra verte de nuevo en Gracia Sublime.`).catch(err => {
                                                        console.log('No se pudo agregar notificación de bienvenida:', err);
                                                });
                                        }, 1000);
                                }, 600);
                        } else {
                                // Mostrar error en el formulario
                                set_errors({
                                        general: result.error || 'Las credenciales ingresadas son incorrectas. Por favor verifica tu email y contraseña.'
                                });
                        }
                } catch (error) {
                        console.error('Error en handle_login:', error);
                        set_errors({
                                general: 'Ocurrió un error al intentar iniciar sesión. Por favor intenta de nuevo.'
                        });
                } finally {
                        set_loading(false);
                }
        };

        return (
                <SafeAreaView style={styles.container}>
                        <KeyboardAvoidingView
                                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                                style={styles.keyboard_view}
                                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
                        >
                                <ScrollView
                                        contentContainerStyle={styles.scroll_content}
                                        keyboardShouldPersistTaps="handled"
                                >
                                        {/* Header con imagen de tazas */}
                                        <View style={styles.header}>
                                                <Image
                                                        source={require('../../img/dobletaza.jpg')}
                                                        style={styles.header_image}
                                                        resizeMode="cover"
                                                />
                                        </View>

                                        {/* Contenido */}
                                        <View style={styles.content}>
                                                <Text style={styles.title}>BIENVENIDO DE NUEVO</Text>

                                                {/* Error general */}
                                                {errors.general && (
                                                        <View style={styles.general_error}>
                                                                <Text style={styles.general_error_text}>{errors.general}</Text>
                                                        </View>
                                                )}

                                                <SimpleInput
                                                        placeholder="Email o Teléfono"
                                                        value={email_or_phone}
                                                        onChangeText={(text) => {
                                                                set_email_or_phone(text);
                                                                if (errors.email_or_phone) {
                                                                        set_errors({ ...errors, email_or_phone: null });
                                                                }
                                                        }}
                                                        keyboardType="default"
                                                        error={errors.email_or_phone}
                                                        icon="mail-outline"
                                                />

                                                <SimpleInput
                                                        placeholder="Contraseña"
                                                        value={password}
                                                        onChangeText={(text) => {
                                                                set_password(text);
                                                                if (errors.password) {
                                                                        set_errors({ ...errors, password: null });
                                                                }
                                                        }}
                                                        secureTextEntry={true}
                                                        error={errors.password}
                                                        icon="lock-closed-outline"
                                                        showPasswordToggle={true}
                                                />

                                                <CustomButton
                                                        title={loading ? "Iniciando sesión..." : "INICIAR SESIÓN"}
                                                        on_press={handle_login}
                                                        disabled={loading}
                                                />

                                                <TouchableOpacity
                                                        style={styles.forgot_password}
                                                        onPress={() => navigation.navigate('ForgotPassword')}
                                                >
                                                        <Text style={styles.forgot_password_text}>
                                                                ¿Olvidaste tu contraseña?
                                                        </Text>
                                                </TouchableOpacity>

                                                <View style={styles.register_container}>
                                                        <Text style={styles.register_text}>¿No tienes cuenta? </Text>
                                                        <Text
                                                                style={styles.register_link}
                                                                onPress={() => navigation.navigate('Register')}
                                                        >
                                                                Regístrate
                                                        </Text>
                                                </View>
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
        keyboard_view: {
                flex: 1,
        },
        scroll_content: {
                flexGrow: 1,
        },
        header: {
                height: 250,
                backgroundColor: COLORS.primaryLight,
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
        },
        header_image: {
                width: '100%',
                height: '100%',
        },
        content: {
                flex: 1,
                paddingHorizontal: 30,
                paddingTop: 40,
        },
        title: {
                fontSize: 28,
                fontWeight: 'bold',
                color: COLORS.textDark,
                marginBottom: 30,
                textAlign: 'center',
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
        register_container: {
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: 20,
        },
        register_text: {
                fontSize: 14,
                color: COLORS.textDark,
        },
        forgot_password: {
                marginTop: 15,
                alignItems: 'center',
        },
        forgot_password_text: {
                fontSize: 14,
                color: COLORS.primary,
                fontWeight: '600',
        },
        register_link: {
                fontSize: 14,
                color: COLORS.primary,
                fontWeight: 'bold',
        },
});

export default LoginScreen;
