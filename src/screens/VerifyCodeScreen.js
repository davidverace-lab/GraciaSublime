import React, { useState, useRef, useEffect } from 'react';
import {
        View,
        Text,
        StyleSheet,
        SafeAreaView,
        Alert,
        TouchableOpacity,
        TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors.js';
import CustomButton from '../components/CustomButton.js';
import { verifyCode, sendVerificationCode } from '../services/smsService.js';

const VerifyCodeScreen = ({ navigation, route }) => {
        const { identifier, isPhone, devCode } = route.params;
        const [code, setCode] = useState(['', '', '', '', '', '']);
        const [loading, setLoading] = useState(false);
        const [resendTimer, setResendTimer] = useState(60);
        const inputRefs = useRef([]);

        // Timer para reenviar código
        useEffect(() => {
                if (resendTimer > 0) {
                        const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
                        return () => clearTimeout(timer);
                }
        }, [resendTimer]);

        // Mostrar código en desarrollo
        useEffect(() => {
                if (devCode && __DEV__) {
                        console.log('=================================');
                        console.log('CÓDIGO DE VERIFICACIÓN (DEV):', devCode);
                        console.log('=================================');
                }
        }, [devCode]);

        const handleCodeChange = (value, index) => {
                // Solo permitir números
                if (value && !/^\d+$/.test(value)) return;

                const newCode = [...code];
                newCode[index] = value;
                setCode(newCode);

                // Auto-focus al siguiente input
                if (value && index < 5) {
                        inputRefs.current[index + 1]?.focus();
                }

                // Verificar automáticamente cuando se complete el código
                if (index === 5 && value) {
                        const fullCode = newCode.join('');
                        if (fullCode.length === 6) {
                                handleVerifyCode(fullCode);
                        }
                }
        };

        const handleKeyPress = (e, index) => {
                if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
                        inputRefs.current[index - 1]?.focus();
                }
        };

        const handleVerifyCode = async (codeToVerify) => {
                const fullCode = codeToVerify || code.join('');

                if (fullCode.length !== 6) {
                        Alert.alert('Error', 'Por favor ingresa el código completo de 6 dígitos');
                        return;
                }

                setLoading(true);

                try {
                        const result = await verifyCode(identifier, fullCode);

                        if (result.success) {
                                // Código verificado, ir a pantalla de nueva contraseña
                                navigation.navigate('ResetPassword', {
                                        identifier,
                                        verifiedCode: fullCode,
                                        userId: result.userId,
                                });
                        } else {
                                Alert.alert('Código Inválido', result.error || 'El código ingresado es incorrecto o ha expirado');
                                // Limpiar código
                                setCode(['', '', '', '', '', '']);
                                inputRefs.current[0]?.focus();
                        }
                } catch (error) {
                        console.error('Error verificando código:', error);
                        Alert.alert('Error', 'Ocurrió un error al verificar el código');
                } finally {
                        setLoading(false);
                }
        };

        const handleResendCode = async () => {
                if (resendTimer > 0) return;

                setLoading(true);

                try {
                        const result = await sendVerificationCode(
                                isPhone ? identifier : null,
                                isPhone ? null : identifier
                        );

                        if (result.success) {
                                Alert.alert('Código Reenviado', `Se ha enviado un nuevo código ${isPhone ? 'por SMS' : 'a tu email'}`);
                                setResendTimer(60);
                                setCode(['', '', '', '', '', '']);
                                inputRefs.current[0]?.focus();

                                // En desarrollo, mostrar el código
                                if (result.code && __DEV__) {
                                        console.log('=================================');
                                        console.log('NUEVO CÓDIGO (DEV):', result.code);
                                        console.log('=================================');
                                }
                        } else {
                                Alert.alert('Error', result.error || 'No se pudo reenviar el código');
                        }
                } catch (error) {
                        console.error('Error reenviando código:', error);
                        Alert.alert('Error', 'Ocurrió un error al reenviar el código');
                } finally {
                        setLoading(false);
                }
        };

        return (
                <SafeAreaView style={styles.container}>
                        {/* Header */}
                        <View style={styles.header}>
                                <TouchableOpacity
                                        style={styles.backButton}
                                        onPress={() => navigation.goBack()}
                                >
                                        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
                                </TouchableOpacity>
                                <View style={styles.iconContainer}>
                                        <Ionicons name="mail-open" size={60} color={COLORS.primary} />
                                </View>
                        </View>

                        {/* Content */}
                        <View style={styles.content}>
                                <Text style={styles.title}>Verificación de Código</Text>
                                <Text style={styles.subtitle}>
                                        Ingresa el código de 6 dígitos que enviamos a{'\n'}
                                        <Text style={styles.identifier}>{identifier}</Text>
                                </Text>

                                {/* Inputs de código */}
                                <View style={styles.codeContainer}>
                                        {code.map((digit, index) => (
                                                <TextInput
                                                        key={index}
                                                        ref={(ref) => (inputRefs.current[index] = ref)}
                                                        style={[
                                                                styles.codeInput,
                                                                digit && styles.codeInputFilled
                                                        ]}
                                                        value={digit}
                                                        onChangeText={(value) => handleCodeChange(value, index)}
                                                        onKeyPress={(e) => handleKeyPress(e, index)}
                                                        keyboardType="number-pad"
                                                        maxLength={1}
                                                        selectTextOnFocus
                                                />
                                        ))}
                                </View>

                                {/* Botón de verificar */}
                                <CustomButton
                                        title={loading ? 'Verificando...' : 'Verificar Código'}
                                        on_press={() => handleVerifyCode()}
                                        disabled={loading || code.join('').length !== 6}
                                />

                                {/* Reenviar código */}
                                <View style={styles.resendContainer}>
                                        <Text style={styles.resendText}>¿No recibiste el código?</Text>
                                        <TouchableOpacity
                                                onPress={handleResendCode}
                                                disabled={resendTimer > 0 || loading}
                                        >
                                                <Text style={[
                                                        styles.resendButton,
                                                        (resendTimer > 0 || loading) && styles.resendButtonDisabled
                                                ]}>
                                                        {resendTimer > 0 ? `Reenviar en ${resendTimer}s` : 'Reenviar Código'}
                                                </Text>
                                        </TouchableOpacity>
                                </View>

                                {/* Info en desarrollo */}
                                {__DEV__ && devCode && (
                                        <View style={styles.devInfo}>
                                                <Text style={styles.devInfoText}>🔧 DEV: Código = {devCode}</Text>
                                        </View>
                                )}
                        </View>
                </SafeAreaView>
        );
};

const styles = StyleSheet.create({
        container: {
                flex: 1,
                backgroundColor: COLORS.white,
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
                marginBottom: 40,
                lineHeight: 22,
        },
        identifier: {
                fontWeight: '700',
                color: COLORS.primary,
        },
        codeContainer: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 30,
                paddingHorizontal: 10,
        },
        codeInput: {
                width: 45,
                height: 55,
                borderWidth: 2,
                borderColor: '#E0E0E0',
                borderRadius: 12,
                fontSize: 24,
                fontWeight: 'bold',
                textAlign: 'center',
                color: COLORS.textDark,
                backgroundColor: COLORS.white,
        },
        codeInputFilled: {
                borderColor: COLORS.primary,
                backgroundColor: COLORS.primaryLight,
        },
        resendContainer: {
                marginTop: 20,
                alignItems: 'center',
        },
        resendText: {
                fontSize: 14,
                color: '#666',
                marginBottom: 8,
        },
        resendButton: {
                fontSize: 15,
                color: COLORS.primary,
                fontWeight: '600',
        },
        resendButtonDisabled: {
                color: '#999',
        },
        devInfo: {
                marginTop: 30,
                padding: 15,
                backgroundColor: '#FFF3CD',
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#FFE69C',
        },
        devInfoText: {
                fontSize: 14,
                color: '#856404',
                textAlign: 'center',
                fontWeight: '600',
        },
});

export default VerifyCodeScreen;
