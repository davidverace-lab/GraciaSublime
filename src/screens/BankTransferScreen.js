import React, { useState } from 'react';
import {
        View,
        Text,
        StyleSheet,
        SafeAreaView,
        ScrollView,
        TouchableOpacity,
        Image,
        Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../constants/colors.js';
import CustomButton from '../components/CustomButton.js';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { createOrder } from '../services/ordersService.js';

const BankTransferScreen = ({ navigation, route }) => {
        const { selected_address, total } = route.params;
        const { cart_items, clear_cart } = useCart();
        const { user } = useAuth();
        const [payment_proof, set_payment_proof] = useState(null);
        const [uploading, set_uploading] = useState(false);

        const bank_info = {
                bank_name: 'BBVA Bancomer',
                account_number: '0123456789',
                clabe: '012345678901234567',
                beneficiary: 'Gracia Sublime S.A. de C.V.',
                reference: `GS${Date.now().toString().slice(-8)}`,
        };

        const handle_pick_image = async () => {
                try {
                        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

                        if (status !== 'granted') {
                                Alert.alert(
                                        'Permiso requerido',
                                        'Necesitamos acceso a tu galería para seleccionar el comprobante de pago.'
                                );
                                return;
                        }

                        const result = await ImagePicker.launchImageLibraryAsync({
                                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                allowsEditing: true,
                                quality: 0.8,
                        });

                        if (!result.canceled && result.assets[0]) {
                                set_payment_proof(result.assets[0].uri);
                        }
                } catch (error) {
                        console.error('Error seleccionando imagen:', error);
                        Alert.alert('Error', 'No se pudo seleccionar la imagen');
                }
        };

        const handle_submit = async () => {
                if (!payment_proof) {
                        Alert.alert(
                                'Comprobante requerido',
                                'Por favor adjunta el comprobante de tu transferencia antes de continuar.'
                        );
                        return;
                }

                set_uploading(true);

                try {
                        // Crear el pedido con estado "pago_pendiente" y método "transferencia"
                        const result = await createOrder(
                                user.id,
                                selected_address?.address_id,
                                cart_items,
                                total,
                                'transferencia',
                                'pago_pendiente',
                                payment_proof
                        );

                        if (result.error) {
                                throw new Error(result.error.message);
                        }

                        console.log('✅ Pedido creado con pago por transferencia:', result.data);

                        // Limpiar carrito localmente
                        clear_cart();

                        // Navegar a pantalla de confirmación
                        navigation.reset({
                                index: 0,
                                routes: [{
                                        name: 'TransferPendingScreen',
                                        params: { order_id: result.data.order_id }
                                }],
                        });
                } catch (error) {
                        console.error('Error procesando pedido:', error);
                        Alert.alert('Error', 'Hubo un problema al procesar tu pedido. Por favor intenta de nuevo.');
                } finally {
                        set_uploading(false);
                }
        };

        return (
                <SafeAreaView style={styles.container}>
                        {/* Header */}
                        <View style={styles.header}>
                                <TouchableOpacity
                                        onPress={() => navigation.goBack()}
                                        style={styles.back_button}
                                >
                                        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                                </TouchableOpacity>
                                <Text style={styles.header_title}>Transferencia Bancaria</Text>
                                <View style={styles.placeholder} />
                        </View>

                        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                                {/* Total a pagar */}
                                <View style={styles.total_card}>
                                        <Text style={styles.total_label}>Total a pagar:</Text>
                                        <Text style={styles.total_amount}>${total}</Text>
                                </View>

                                {/* Información bancaria */}
                                <View style={styles.bank_info_card}>
                                        <View style={styles.card_header}>
                                                <Ionicons name="business" size={24} color={COLORS.primary} />
                                                <Text style={styles.card_title}>Datos Bancarios</Text>
                                        </View>

                                        <View style={styles.info_row}>
                                                <Text style={styles.info_label}>Banco:</Text>
                                                <Text style={styles.info_value}>{bank_info.bank_name}</Text>
                                        </View>

                                        <View style={styles.info_row}>
                                                <Text style={styles.info_label}>Beneficiario:</Text>
                                                <Text style={styles.info_value}>{bank_info.beneficiary}</Text>
                                        </View>

                                        <View style={styles.info_row}>
                                                <Text style={styles.info_label}>Cuenta:</Text>
                                                <Text style={styles.info_value}>{bank_info.account_number}</Text>
                                        </View>

                                        <View style={styles.info_row}>
                                                <Text style={styles.info_label}>CLABE:</Text>
                                                <Text style={styles.info_value}>{bank_info.clabe}</Text>
                                        </View>

                                        <View style={[styles.info_row, styles.reference_row]}>
                                                <Text style={styles.info_label}>Referencia:</Text>
                                                <Text style={styles.reference_value}>{bank_info.reference}</Text>
                                        </View>
                                </View>

                                {/* Instrucciones */}
                                <View style={styles.instructions_card}>
                                        <View style={styles.card_header}>
                                                <Ionicons name="information-circle" size={24} color={COLORS.primary} />
                                                <Text style={styles.card_title}>Instrucciones</Text>
                                        </View>
                                        <Text style={styles.instruction_text}>
                                                1. Realiza la transferencia por el monto exacto{'\n'}
                                                2. Incluye la referencia en tu transferencia{'\n'}
                                                3. Adjunta el comprobante de pago{'\n'}
                                                4. Verificaremos tu pago en 24-48 horas{'\n'}
                                                5. Recibirás una notificación cuando sea confirmado
                                        </Text>
                                </View>

                                {/* Subir comprobante */}
                                <View style={styles.upload_card}>
                                        <View style={styles.card_header}>
                                                <Ionicons name="cloud-upload" size={24} color={COLORS.primary} />
                                                <Text style={styles.card_title}>Comprobante de Pago</Text>
                                        </View>

                                        {payment_proof ? (
                                                <View style={styles.preview_container}>
                                                        <Image
                                                                source={{ uri: payment_proof }}
                                                                style={styles.proof_image}
                                                                resizeMode="contain"
                                                        />
                                                        <TouchableOpacity
                                                                style={styles.change_image_button}
                                                                onPress={handle_pick_image}
                                                        >
                                                                <Ionicons name="refresh" size={20} color={COLORS.primary} />
                                                                <Text style={styles.change_image_text}>Cambiar imagen</Text>
                                                        </TouchableOpacity>
                                                </View>
                                        ) : (
                                                <TouchableOpacity
                                                        style={styles.upload_button}
                                                        onPress={handle_pick_image}
                                                        activeOpacity={0.7}
                                                >
                                                        <Ionicons name="image" size={40} color={COLORS.primary} />
                                                        <Text style={styles.upload_button_text}>
                                                                Adjuntar comprobante
                                                        </Text>
                                                        <Text style={styles.upload_button_subtext}>
                                                                Toca para seleccionar desde tu galería
                                                        </Text>
                                                </TouchableOpacity>
                                        )}
                                </View>

                                <View style={{ height: 20 }} />
                        </ScrollView>

                        {/* Footer con botón */}
                        <View style={styles.footer}>
                                <CustomButton
                                        title={uploading ? "Procesando..." : "Confirmar y Enviar"}
                                        on_press={handle_submit}
                                        disabled={uploading}
                                />
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
                backgroundColor: COLORS.primary,
                paddingHorizontal: 20,
                paddingVertical: 15,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
        },
        back_button: {
                padding: 5,
        },
        header_title: {
                fontSize: 18,
                fontWeight: 'bold',
                color: COLORS.white,
                flex: 1,
                textAlign: 'center',
        },
        placeholder: {
                width: 34,
        },
        content: {
                flex: 1,
                padding: 20,
        },
        total_card: {
                backgroundColor: COLORS.primaryLight,
                padding: 20,
                borderRadius: 15,
                alignItems: 'center',
                marginBottom: 20,
        },
        total_label: {
                fontSize: 16,
                color: COLORS.textDark,
                marginBottom: 5,
        },
        total_amount: {
                fontSize: 36,
                fontWeight: 'bold',
                color: COLORS.primary,
        },
        bank_info_card: {
                backgroundColor: COLORS.white,
                padding: 20,
                borderRadius: 15,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: '#E0E0E0',
        },
        instructions_card: {
                backgroundColor: '#FFF9E6',
                padding: 20,
                borderRadius: 15,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: '#FFE082',
        },
        upload_card: {
                backgroundColor: COLORS.white,
                padding: 20,
                borderRadius: 15,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: '#E0E0E0',
        },
        card_header: {
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 15,
        },
        card_title: {
                fontSize: 18,
                fontWeight: 'bold',
                color: COLORS.textDark,
                marginLeft: 10,
        },
        info_row: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: '#F0F0F0',
        },
        info_label: {
                fontSize: 14,
                color: '#666',
        },
        info_value: {
                fontSize: 14,
                fontWeight: '600',
                color: COLORS.textDark,
        },
        reference_row: {
                backgroundColor: COLORS.primaryLight,
                paddingHorizontal: 15,
                borderRadius: 8,
                marginTop: 10,
                borderBottomWidth: 0,
        },
        reference_value: {
                fontSize: 16,
                fontWeight: 'bold',
                color: COLORS.primary,
                letterSpacing: 1,
        },
        instruction_text: {
                fontSize: 14,
                color: '#666',
                lineHeight: 24,
        },
        upload_button: {
                backgroundColor: COLORS.primaryLight,
                padding: 40,
                borderRadius: 15,
                alignItems: 'center',
                borderWidth: 2,
                borderColor: COLORS.primary,
                borderStyle: 'dashed',
        },
        upload_button_text: {
                fontSize: 16,
                fontWeight: '600',
                color: COLORS.primary,
                marginTop: 10,
        },
        upload_button_subtext: {
                fontSize: 12,
                color: '#666',
                marginTop: 5,
        },
        preview_container: {
                alignItems: 'center',
        },
        proof_image: {
                width: '100%',
                height: 300,
                borderRadius: 15,
                backgroundColor: '#F5F5F5',
        },
        change_image_button: {
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 15,
                padding: 10,
        },
        change_image_text: {
                fontSize: 14,
                color: COLORS.primary,
                fontWeight: '600',
                marginLeft: 5,
        },
        footer: {
                padding: 20,
                backgroundColor: COLORS.white,
                borderTopWidth: 1,
                borderTopColor: '#F0F0F0',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -3 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 10,
        },
});

export default BankTransferScreen;
