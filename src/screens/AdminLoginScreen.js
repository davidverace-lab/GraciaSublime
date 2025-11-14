import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useAdmin } from '../context/AdminContext';
import CustomButton from '../components/CustomButton';

const AdminLoginScreen = ({ navigation }) => {
    const { admin_login } = useAdmin();
    const [email, set_email] = useState('');
    const [password, set_password] = useState('');
    const [show_password, set_show_password] = useState(false);
    const [loading, set_loading] = useState(false);

    const handle_login = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }

        set_loading(true);
        const result = await admin_login(email, password);
        set_loading(false);

        if (result.success) {
            navigation.replace('AdminTabs');
        } else {
            Alert.alert('Error', result.message || 'Credenciales incorrectas');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.gradient}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.content}
                >
                    {/* Header */}
                    <TouchableOpacity
                        style={styles.back_button}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                    </TouchableOpacity>

                    {/* Logo y título */}
                    <View style={styles.header_container}>
                        <View style={styles.icon_container}>
                            <Ionicons name="shield-checkmark" size={80} color={COLORS.white} />
                        </View>
                        <Text style={styles.title}>Panel de Administración</Text>
                        <Text style={styles.subtitle}>Gracia Sublime</Text>
                    </View>

                    {/* Formulario */}
                    <View style={styles.form_container}>
                        <View style={styles.input_container}>
                            <Ionicons
                                name="mail-outline"
                                size={20}
                                color={COLORS.white}
                                style={styles.input_icon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Correo electrónico"
                                placeholderTextColor="rgba(255,255,255,0.6)"
                                value={email}
                                onChangeText={set_email}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        <View style={styles.input_container}>
                            <Ionicons
                                name="lock-closed-outline"
                                size={20}
                                color={COLORS.white}
                                style={styles.input_icon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Contraseña"
                                placeholderTextColor="rgba(255,255,255,0.6)"
                                value={password}
                                onChangeText={set_password}
                                secureTextEntry={!show_password}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                onPress={() => set_show_password(!show_password)}
                                style={styles.eye_icon}
                            >
                                <Ionicons
                                    name={show_password ? 'eye-outline' : 'eye-off-outline'}
                                    size={20}
                                    color={COLORS.white}
                                />
                            </TouchableOpacity>
                        </View>

                        <CustomButton
                            title={loading ? 'Iniciando sesión...' : 'INICIAR SESIÓN'}
                            onPress={handle_login}
                            disabled={loading}
                            variant="secondary"
                            style={styles.login_button}
                        />

                        {/* Credenciales de prueba */}
                        <View style={styles.demo_credentials}>
                            <Text style={styles.demo_title}>Credenciales de prueba:</Text>
                            <Text style={styles.demo_text}>
                                📧 admin@graciasublime.com
                            </Text>
                            <Text style={styles.demo_text}>🔒 admin123</Text>
                        </View>
                    </View>

                    {/* Advertencia de seguridad */}
                    <View style={styles.warning_container}>
                        <Ionicons name="warning-outline" size={16} color={COLORS.white} />
                        <Text style={styles.warning_text}>
                            Acceso restringido solo para administradores
                        </Text>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        backgroundColor: COLORS.primary,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    back_button: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    header_container: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 40,
    },
    icon_container: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.white,
        opacity: 0.8,
    },
    form_container: {
        flex: 1,
    },
    input_container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        marginBottom: 15,
        paddingHorizontal: 15,
        height: 55,
    },
    input_icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: COLORS.white,
        fontSize: 16,
    },
    eye_icon: {
        padding: 5,
    },
    login_button: {
        marginTop: 10,
    },
    demo_credentials: {
        marginTop: 30,
        padding: 15,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    demo_title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 8,
    },
    demo_text: {
        fontSize: 13,
        color: COLORS.white,
        opacity: 0.9,
        marginBottom: 3,
    },
    warning_container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        marginTop: 20,
    },
    warning_text: {
        fontSize: 12,
        color: COLORS.white,
        marginLeft: 5,
        opacity: 0.8,
    },
});

export default AdminLoginScreen;
