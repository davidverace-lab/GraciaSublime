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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors.js';
import CustomButton from '../components/CustomButton.js';
import SimpleInput from '../components/SimpleInput.js';
import { useAuth } from '../context/AuthContext.js';
import { useNotifications } from '../context/NotificationsContext.js';
import { validateEmail, validatePhone, validatePassword, validateName, validatePasswordMatch } from '../utils/validations.js';

const RegisterScreen = ({ navigation }) => {
        const { register, is_admin } = useAuth();
        const { add_notification } = useNotifications();
        const [full_name, set_full_name] = useState('');
        const [email, set_email] = useState('');
        const [phone, set_phone] = useState('');
        const [password, set_password] = useState('');
        const [confirm_password, set_confirm_password] = useState('');
        const [errors, set_errors] = useState({});
        const [loading, set_loading] = useState(false);

        const validate_form = () => {
                const new_errors = {};

                // Validar nombre
                const name_validation = validateName(full_name);
                if (!name_validation.isValid) {
                        new_errors.full_name = name_validation.error;
                }

                // Validar email
                const email_validation = validateEmail(email);
                if (!email_validation.isValid) {
                        new_errors.email = email_validation.error;
                }

                // Validar teléfono
                const phone_validation = validatePhone(phone);
                if (!phone_validation.isValid) {
                        new_errors.phone = phone_validation.error;
                }

                // Validar contraseña
                const password_validation = validatePassword(password);
                if (!password_validation.isValid) {
                        new_errors.password = password_validation.error;
                }

                // Validar que las contraseñas coincidan
                const password_match_validation = validatePasswordMatch(password, confirm_password);
                if (!password_match_validation.isValid) {
                        new_errors.confirm_password = password_match_validation.error;
                }

                set_errors(new_errors);
                return Object.keys(new_errors).length === 0;
        };

        const handle_register = async () => {
                // Limpiar errores previos
                set_errors({});

                // Validar formulario
                if (!validate_form()) {
                        return;
                }

                set_loading(true);

                try {
                        const result = await register(full_name, email, phone, password);
                        if (result.success) {
                                // Esperar un poco para que se cargue el perfil
                                setTimeout(() => {
                                        // Siempre llevar a AdminDrawer si es admin, MainDrawer si no
                                        const targetRoute = is_admin ? 'AdminDrawer' : 'MainDrawer';
                                        console.log('🔄 Registro exitoso, redirigiendo a:', targetRoute, '| is_admin:', is_admin);

                                        navigation.reset({
                                                index: 0,
                                                routes: [{ name: targetRoute }],
                                        });

                                        // Agregar notificación de bienvenida después de navegar
                                        setTimeout(() => {
                                                add_notification(`¡Bienvenido a Gracia Sublime, ${full_name}! 🎉 Tu cuenta ha sido creada exitosamente.\n\n📧 Hemos enviado un correo de verificación a ${email}. Por favor revisa tu bandeja de entrada para confirmar tu cuenta.`).catch(err => {
                                                        console.log('No se pudo agregar notificación de bienvenida:', err);
                                                });
                                        }, 1000);
                                }, 600);
                        } else {
                                // Mostrar error en el formulario
                                set_errors({
                                        general: result.error || 'Ocurrió un error al crear la cuenta. Por favor intenta de nuevo.'
                                });
                        }
                } catch (error) {
                        console.error('Error en handle_register:', error);
                        set_errors({
                                general: 'Ocurrió un error inesperado. Por favor intenta de nuevo.'
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
                                                <Text style={styles.title}>CREAR CUENTA</Text>

                                                {/* Error general */}
                                                {errors.general && (
                                                        <View style={styles.general_error}>
                                                                <Text style={styles.general_error_text}>{errors.general}</Text>
                                                        </View>
                                                )}

                                                <SimpleInput
                                                        placeholder="Nombre Completo"
                                                        value={full_name}
                                                        onChangeText={(text) => {
                                                                set_full_name(text);
                                                                if (errors.full_name) {
                                                                        set_errors({ ...errors, full_name: null });
                                                                }
                                                        }}
                                                        error={errors.full_name}
                                                        icon="person-outline"
                                                />

                                                <SimpleInput
                                                        placeholder="Email (personal o institucional)"
                                                        value={email}
                                                        onChangeText={(text) => {
                                                                set_email(text);
                                                                if (errors.email) {
                                                                        set_errors({ ...errors, email: null });
                                                                }
                                                        }}
                                                        keyboardType="email-address"
                                                        error={errors.email}
                                                        icon="mail-outline"
                                                />

                                                <SimpleInput
                                                        placeholder="Teléfono (10 dígitos)"
                                                        value={phone}
                                                        onChangeText={(text) => {
                                                                const cleaned = text.replace(/[^0-9]/g, '');
                                                                set_phone(cleaned);
                                                                if (errors.phone) {
                                                                        set_errors({ ...errors, phone: null });
                                                                }
                                                        }}
                                                        keyboardType="phone-pad"
                                                        error={errors.phone}
                                                        icon="call-outline"
                                                />

                                                <SimpleInput
                                                        placeholder="Contraseña (mín. 6 caracteres)"
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
                                                />

                                                <SimpleInput
                                                        placeholder="Confirmar Contraseña"
                                                        value={confirm_password}
                                                        onChangeText={(text) => {
                                                                set_confirm_password(text);
                                                                if (errors.confirm_password) {
                                                                        set_errors({ ...errors, confirm_password: null });
                                                                }
                                                        }}
                                                        secureTextEntry={true}
                                                        error={errors.confirm_password}
                                                        icon="lock-closed-outline"
                                                />

                                                {/* Nota informativa */}
                                                <View style={styles.info_container}>
                                                        <Ionicons name="information-circle-outline" size={18} color={COLORS.primary} />
                                                        <Text style={styles.info_text}>
                                                                La contraseña acepta todos los símbolos y caracteres especiales
                                                        </Text>
                                                </View>

                                                <CustomButton
                                                        title={loading ? "Creando cuenta..." : "REGISTRARSE"}
                                                        on_press={handle_register}
                                                        disabled={loading}
                                                />

                                                <View style={styles.login_container}>
                                                        <Text style={styles.login_text}>¿Ya tienes cuenta? </Text>
                                                        <Text
                                                                style={styles.login_link}
                                                                onPress={() => navigation.navigate('Login')}
                                                        >
                                                                Inicia sesión
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
                paddingTop: 30,
                paddingBottom: 20,
        },
        title: {
                fontSize: 24,
                fontWeight: 'bold',
                color: COLORS.textDark,
                marginBottom: 25,
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
        info_container: {
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.primaryLight,
                padding: 12,
                borderRadius: 8,
                marginBottom: 20,
                borderLeftWidth: 3,
                borderLeftColor: COLORS.primary,
        },
        info_text: {
                fontSize: 12,
                color: COLORS.textDark,
                marginLeft: 8,
                flex: 1,
                lineHeight: 18,
        },
        login_container: {
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: 15,
        },
        login_text: {
                fontSize: 14,
                color: COLORS.textDark,
        },
        login_link: {
                fontSize: 14,
                color: COLORS.primary,
                fontWeight: 'bold',
        },
});

export default RegisterScreen;
