import React, { useState } from 'react';
import {
        View,
        Text,
        StyleSheet,
        SafeAreaView,
        ScrollView,
        TouchableOpacity,
        TextInput,
        Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors.js';
import CustomButton from '../components/CustomButton.js';
import PayPalButton from '../components/PayPalButton.js';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { createOrder } from '../services/ordersService.js';

const CheckoutPaymentScreen = ({ navigation, route }) => {
        const { get_total, cart_items, clear_cart } = useCart();
        const { user } = useAuth();
        const [payment_method, set_payment_method] = useState('paypal');
        const [card_number, set_card_number] = useState('');
        const [card_name, set_card_name] = useState('');
        const [expiry_date, set_expiry_date] = useState('');
        const [cvv, set_cvv] = useState('');
        const [processing_payment, set_processing_payment] = useState(false);

        // Obtener datos de dirección del paso anterior
        const selected_address = route?.params?.selected_address;

        const payment_methods = [
                { id: 'paypal', name: 'PayPal', icon: 'logo-paypal', description: 'Paga con tu cuenta PayPal de forma segura' },
                { id: 'transfer', name: 'Transferencia Bancaria', icon: 'swap-horizontal', description: 'Recibirás los datos bancarios' },
        ];

        const handle_continue = () => {
                // Si es PayPal, el botón de PayPal maneja el pago
                if (payment_method === 'paypal') {
                        return;
                }

                // Para transferencia, navegar a pantalla de datos bancarios
                if (payment_method === 'transfer') {
                        navigation.navigate('BankTransferScreen', {
                                selected_address,
                                total: get_total(),
                        });
                        return;
                }

                // Navegar a confirmación para otros métodos
                navigation.navigate('CheckoutConfirmation', {
                        payment_method,
                        selected_address,
                });
        };

        // Manejar pago exitoso de PayPal
        const handle_paypal_success = async (payment_data) => {
                console.log('✅ Pago de PayPal exitoso:', payment_data);

                try {
                        // Crear el pedido en la base de datos con todos los parámetros
                        const result = await createOrder(
                                user.id,
                                selected_address?.address_id,
                                cart_items,
                                get_total(),
                                'paypal',
                                'pendiente',
                                null // PayPal no tiene comprobante de imagen
                        );

                        if (result.error) {
                                throw new Error(result.error.message || 'Error al crear el pedido');
                        }

                        console.log('✅ Pedido creado exitosamente en Supabase:', result.data);

                        // Limpiar carrito localmente
                        clear_cart();

                        // Navegar a pantalla de agradecimiento con reset para evitar volver atrás
                        navigation.reset({
                                index: 0,
                                routes: [{
                                        name: 'OrderSuccess',
                                        params: {
                                                order_id: result.data.order_id,
                                                payment_method: 'paypal',
                                                transaction_id: payment_data.transactionId,
                                        },
                                }],
                        });
                } catch (error) {
                        console.error('❌ Error procesando pedido después de pago exitoso:', error);
                        Alert.alert(
                                'Error',
                                'Tu pago fue exitoso pero hubo un problema al crear el pedido. Por favor contacta a soporte con tu ID de transacción: ' + payment_data.transactionId
                        );
                }
        };

        // Manejar error de PayPal
        const handle_paypal_error = (error) => {
                console.error('Error en pago de PayPal:', error);
                Alert.alert(
                        'Error de Pago',
                        'Ocurrió un error al procesar tu pago con PayPal. Por favor intenta de nuevo.'
                );
        };

        // Manejar cancelación de PayPal
        const handle_paypal_cancel = () => {
                console.log('Pago de PayPal cancelado');
                Alert.alert(
                        'Pago Cancelado',
                        'Has cancelado el pago. Puedes intentar de nuevo cuando estés listo.'
                );
        };

        const format_card_number = (text) => {
                const cleaned = text.replace(/\s/g, '');
                const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
                return formatted;
        };

        const handle_card_number_change = (text) => {
                const cleaned = text.replace(/\s/g, '');
                if (cleaned.length <= 16 && /^\d*$/.test(cleaned)) {
                        set_card_number(cleaned);
                }
        };

        const format_expiry = (text) => {
                const cleaned = text.replace(/\//g, '');
                if (cleaned.length >= 2) {
                        return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
                }
                return cleaned;
        };

        const handle_expiry_change = (text) => {
                const cleaned = text.replace(/\//g, '');
                if (cleaned.length <= 4 && /^\d*$/.test(cleaned)) {
                        set_expiry_date(cleaned);
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
                                <Text style={styles.header_title}>Método de Pago</Text>
                                <View style={styles.placeholder} />
                        </View>

                        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                                {/* Progreso */}
                                <View style={styles.progress_container}>
                                        <View style={styles.progress_step}>
                                                <View style={styles.step_circle_completed}>
                                                        <Ionicons name="checkmark" size={20} color={COLORS.white} />
                                                </View>
                                                <Text style={styles.step_label}>Dirección</Text>
                                        </View>
                                        <View style={styles.progress_line_active} />
                                        <View style={styles.progress_step_active}>
                                                <View style={styles.step_circle_active}>
                                                        <Text style={styles.step_number}>2</Text>
                                                </View>
                                                <Text style={styles.step_label}>Pago</Text>
                                        </View>
                                        <View style={styles.progress_line} />
                                        <View style={styles.progress_step}>
                                                <View style={styles.step_circle}>
                                                        <Text style={styles.step_number_inactive}>3</Text>
                                                </View>
                                                <Text style={styles.step_label_inactive}>Confirmar</Text>
                                        </View>
                                </View>

                                {/* Métodos de Pago */}
                                <View style={styles.form_container}>
                                        <Text style={styles.section_title}>Selecciona Método de Pago</Text>

                                        {payment_methods.map((method) => (
                                                <TouchableOpacity
                                                        key={method.id}
                                                        style={[
                                                                styles.payment_method_card,
                                                                payment_method === method.id && styles.payment_method_selected,
                                                        ]}
                                                        onPress={() => set_payment_method(method.id)}
                                                        activeOpacity={0.7}
                                                >
                                                        <View style={[
                                                                styles.payment_method_icon,
                                                                payment_method === method.id && styles.payment_method_icon_selected
                                                        ]}>
                                                                <Ionicons
                                                                        name={method.icon}
                                                                        size={28}
                                                                        color={payment_method === method.id ? COLORS.primary : '#666'}
                                                                />
                                                        </View>
                                                        <View style={styles.payment_method_content}>
                                                                <Text style={[
                                                                        styles.payment_method_name,
                                                                        payment_method === method.id && styles.payment_method_name_selected
                                                                ]}>
                                                                        {method.name}
                                                                </Text>
                                                                <Text style={styles.payment_method_description}>
                                                                        {method.description}
                                                                </Text>
                                                        </View>
                                                        <View style={styles.radio_container}>
                                                                <View style={[
                                                                        styles.radio_outer,
                                                                        payment_method === method.id && styles.radio_outer_selected
                                                                ]}>
                                                                        {payment_method === method.id && (
                                                                                <View style={styles.radio_inner} />
                                                                        )}
                                                                </View>
                                                        </View>
                                                </TouchableOpacity>
                                        ))}

                                        {/* Formulario de Tarjeta */}
                                        {payment_method === 'card' && (
                                                <View style={styles.card_form}>
                                                        <Text style={styles.form_subtitle}>Datos de la Tarjeta</Text>

                                                        <View style={styles.input_group}>
                                                                <Text style={styles.label}>Número de Tarjeta *</Text>
                                                                <TextInput
                                                                        style={styles.input}
                                                                        value={format_card_number(card_number)}
                                                                        onChangeText={handle_card_number_change}
                                                                        placeholder="1234 5678 9012 3456"
                                                                        keyboardType="numeric"
                                                                        placeholderTextColor="#999"
                                                                />
                                                        </View>

                                                        <View style={styles.input_group}>
                                                                <Text style={styles.label}>Nombre del Titular *</Text>
                                                                <TextInput
                                                                        style={styles.input}
                                                                        value={card_name}
                                                                        onChangeText={set_card_name}
                                                                        placeholder="Como aparece en la tarjeta"
                                                                        autoCapitalize="characters"
                                                                        placeholderTextColor="#999"
                                                                />
                                                        </View>

                                                        <View style={styles.row}>
                                                                <View style={[styles.input_group, { flex: 1, marginRight: 10 }]}>
                                                                        <Text style={styles.label}>Vencimiento *</Text>
                                                                        <TextInput
                                                                                style={styles.input}
                                                                                value={format_expiry(expiry_date)}
                                                                                onChangeText={handle_expiry_change}
                                                                                placeholder="MM/AA"
                                                                                keyboardType="numeric"
                                                                                placeholderTextColor="#999"
                                                                        />
                                                                </View>

                                                                <View style={[styles.input_group, { flex: 1 }]}>
                                                                        <Text style={styles.label}>CVV *</Text>
                                                                        <TextInput
                                                                                style={styles.input}
                                                                                value={cvv}
                                                                                onChangeText={(text) => {
                                                                                        if (text.length <= 3 && /^\d*$/.test(text)) {
                                                                                                set_cvv(text);
                                                                                        }
                                                                                }}
                                                                                placeholder="123"
                                                                                keyboardType="numeric"
                                                                                secureTextEntry
                                                                                placeholderTextColor="#999"
                                                                        />
                                                                </View>
                                                        </View>
                                                </View>
                                        )}

                                        {/* Botón de PayPal */}
                                        {payment_method === 'paypal' && (
                                                <>
                                                        <View style={styles.info_box}>
                                                                <Ionicons name="information-circle" size={24} color={COLORS.primary} />
                                                                <View style={styles.info_text_container}>
                                                                        <Text style={styles.info_title}>Pago con PayPal</Text>
                                                                        <Text style={styles.info_description}>
                                                                                Serás redirigido a PayPal para completar tu pago de forma segura. Puedes usar tu saldo de PayPal, tarjeta de débito o crédito.
                                                                        </Text>
                                                                </View>
                                                        </View>

                                                        <PayPalButton
                                                                amount={get_total()}
                                                                currency="USD"
                                                                orderDetails={{
                                                                        description: `Compra en Gracia Sublime - ${cart_items.length} productos`,
                                                                        order_id: `ORDER_${Date.now()}`,
                                                                }}
                                                                onSuccess={handle_paypal_success}
                                                                onError={handle_paypal_error}
                                                                onCancel={handle_paypal_cancel}
                                                        />
                                                </>
                                        )}

                                        {payment_method === 'transfer' && (
                                                <View style={styles.info_box}>
                                                        <Ionicons name="information-circle" size={24} color={COLORS.primary} />
                                                        <View style={styles.info_text_container}>
                                                                <Text style={styles.info_title}>Transferencia Bancaria</Text>
                                                                <Text style={styles.info_description}>
                                                                        Recibirás los datos bancarios para realizar la transferencia. El pedido se procesará una vez confirmado el pago.
                                                                </Text>
                                                        </View>
                                                </View>
                                        )}
                                </View>
                        </ScrollView>

                        {/* Footer */}
                        {payment_method !== 'paypal' && (
                                <View style={styles.footer}>
                                        <View style={styles.total_row}>
                                                <Text style={styles.total_label}>Total a Pagar:</Text>
                                                <Text style={styles.total_amount}>${get_total()}</Text>
                                        </View>
                                        <CustomButton title="Continuar" on_press={handle_continue} />
                                </View>
                        )}
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
        },
        progress_container: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 25,
                paddingHorizontal: 20,
        },
        progress_step: {
                alignItems: 'center',
        },
        progress_step_active: {
                alignItems: 'center',
        },
        step_circle: {
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#f0f0f0',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 5,
        },
        step_circle_active: {
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: COLORS.primary,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 5,
        },
        step_circle_completed: {
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#4CAF50',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 5,
        },
        step_number: {
                fontSize: 16,
                fontWeight: 'bold',
                color: COLORS.white,
        },
        step_number_inactive: {
                fontSize: 16,
                fontWeight: 'bold',
                color: '#999',
        },
        step_label: {
                fontSize: 12,
                color: COLORS.primary,
                fontWeight: '600',
        },
        step_label_inactive: {
                fontSize: 12,
                color: '#999',
        },
        progress_line: {
                width: 40,
                height: 2,
                backgroundColor: '#f0f0f0',
                marginHorizontal: 5,
        },
        progress_line_active: {
                width: 40,
                height: 2,
                backgroundColor: '#4CAF50',
                marginHorizontal: 5,
        },
        form_container: {
                paddingHorizontal: 20,
                paddingBottom: 20,
        },
        section_title: {
                fontSize: 20,
                fontWeight: 'bold',
                color: COLORS.textDark,
                marginBottom: 20,
        },
        payment_method_card: {
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.white,
                borderRadius: 15,
                padding: 18,
                marginBottom: 15,
                borderWidth: 2,
                borderColor: '#f0f0f0',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
        },
        payment_method_selected: {
                borderColor: COLORS.primary,
                backgroundColor: COLORS.primaryLight,
                shadowOpacity: 0.1,
                elevation: 4,
        },
        payment_method_icon: {
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: '#F5F5F5',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 15,
        },
        payment_method_icon_selected: {
                backgroundColor: COLORS.white,
        },
        payment_method_content: {
                flex: 1,
        },
        payment_method_name: {
                fontSize: 16,
                fontWeight: '700',
                color: COLORS.textDark,
                marginBottom: 4,
        },
        payment_method_name_selected: {
                color: COLORS.primary,
        },
        payment_method_description: {
                fontSize: 12,
                color: '#666',
                lineHeight: 16,
        },
        radio_container: {
                padding: 5,
        },
        radio_outer: {
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: '#ddd',
                justifyContent: 'center',
                alignItems: 'center',
        },
        radio_outer_selected: {
                borderColor: COLORS.primary,
        },
        radio_inner: {
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: COLORS.primary,
        },
        card_form: {
                marginTop: 20,
                padding: 15,
                backgroundColor: COLORS.primaryLight,
                borderRadius: 12,
        },
        form_subtitle: {
                fontSize: 16,
                fontWeight: 'bold',
                color: COLORS.textDark,
                marginBottom: 15,
        },
        input_group: {
                marginBottom: 15,
        },
        label: {
                fontSize: 14,
                fontWeight: '600',
                color: COLORS.textDark,
                marginBottom: 8,
        },
        input: {
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 12,
                padding: 15,
                fontSize: 15,
                backgroundColor: COLORS.white,
                color: COLORS.textDark,
        },
        row: {
                flexDirection: 'row',
        },
        info_box: {
                flexDirection: 'row',
                backgroundColor: COLORS.primaryLight,
                padding: 15,
                borderRadius: 12,
                marginTop: 15,
                alignItems: 'center',
        },
        info_text_container: {
                flex: 1,
                marginLeft: 12,
        },
        info_title: {
                fontSize: 14,
                fontWeight: '600',
                color: COLORS.textDark,
                marginBottom: 3,
        },
        info_description: {
                fontSize: 13,
                color: '#666',
        },
        footer: {
                padding: 20,
                backgroundColor: COLORS.white,
                borderTopWidth: 1,
                borderTopColor: '#f0f0f0',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -3 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 10,
        },
        total_row: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 15,
        },
        total_label: {
                fontSize: 18,
                fontWeight: '600',
                color: COLORS.textDark,
        },
        total_amount: {
                fontSize: 24,
                fontWeight: 'bold',
                color: COLORS.primary,
        },
});

export default CheckoutPaymentScreen;
