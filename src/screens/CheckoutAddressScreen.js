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
import { useLocation } from '../context/LocationContext.js';
import { useCart } from '../context/CartContext.js';
import { useAddresses } from '../context/AddressesContext.js';

const CheckoutAddressScreen = ({ navigation }) => {
        const { address, update_address } = useLocation();
        const { get_total } = useCart();
        const { add_address, default_address, update_address: update_db_address } = useAddresses();
        const [street, set_street] = useState(address.street || default_address?.street || '');
        const [city, set_city] = useState(address.city || default_address?.city || '');
        const [state, set_state] = useState(address.state || default_address?.state || '');
        const [zip_code, set_zip_code] = useState(address.zip_code || default_address?.postal_code || '');
        const [number, set_number] = useState(default_address?.number?.toString() || '');

        const handle_continue = async () => {
                if (!street || !city || !state || !zip_code) {
                        Alert.alert('Error', 'Por favor completa todos los campos de dirección');
                        return;
                }

                // Guardar dirección en contexto local
                update_address({ street, city, state, zip_code });

                // Guardar dirección en base de datos
                const addressData = {
                        street,
                        number: parseInt(number) || 0,
                        city,
                        state,
                        postal_code: zip_code,
                };

                if (default_address) {
                        // Actualizar dirección existente
                        await update_db_address(default_address.address_id, addressData);
                } else {
                        // Crear nueva dirección
                        await add_address(addressData);
                }

                // Navegar a método de pago
                navigation.navigate('CheckoutPayment');
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
                                <Text style={styles.header_title}>Dirección de Entrega</Text>
                                <View style={styles.placeholder} />
                        </View>

                        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                                {/* Progreso */}
                                <View style={styles.progress_container}>
                                        <View style={styles.progress_step_active}>
                                                <View style={styles.step_circle_active}>
                                                        <Text style={styles.step_number}>1</Text>
                                                </View>
                                                <Text style={styles.step_label}>Dirección</Text>
                                        </View>
                                        <View style={styles.progress_line} />
                                        <View style={styles.progress_step}>
                                                <View style={styles.step_circle}>
                                                        <Text style={styles.step_number_inactive}>2</Text>
                                                </View>
                                                <Text style={styles.step_label_inactive}>Pago</Text>
                                        </View>
                                        <View style={styles.progress_line} />
                                        <View style={styles.progress_step}>
                                                <View style={styles.step_circle}>
                                                        <Text style={styles.step_number_inactive}>3</Text>
                                                </View>
                                                <Text style={styles.step_label_inactive}>Confirmar</Text>
                                        </View>
                                </View>

                                {/* Formulario */}
                                <View style={styles.form_container}>
                                        <Text style={styles.section_title}>Información de Entrega</Text>

                                        <View style={styles.input_group}>
                                                <Text style={styles.label}>Calle y Número *</Text>
                                                <TextInput
                                                        style={styles.input}
                                                        value={street}
                                                        onChangeText={set_street}
                                                        placeholder="Ej: Av. Reforma 123, Col. Centro"
                                                        placeholderTextColor="#999"
                                                />
                                        </View>

                                        <View style={styles.input_group}>
                                                <Text style={styles.label}>Ciudad *</Text>
                                                <TextInput
                                                        style={styles.input}
                                                        value={city}
                                                        onChangeText={set_city}
                                                        placeholder="Ej: Ciudad de México"
                                                        placeholderTextColor="#999"
                                                />
                                        </View>

                                        <View style={styles.row}>
                                                <View style={[styles.input_group, { flex: 1, marginRight: 10 }]}>
                                                        <Text style={styles.label}>Estado *</Text>
                                                        <TextInput
                                                                style={styles.input}
                                                                value={state}
                                                                onChangeText={set_state}
                                                                placeholder="Ej: CDMX"
                                                                placeholderTextColor="#999"
                                                        />
                                                </View>

                                                <View style={[styles.input_group, { flex: 1 }]}>
                                                        <Text style={styles.label}>Código Postal *</Text>
                                                        <TextInput
                                                                style={styles.input}
                                                                value={zip_code}
                                                                onChangeText={set_zip_code}
                                                                placeholder="01000"
                                                                keyboardType="numeric"
                                                                maxLength={5}
                                                                placeholderTextColor="#999"
                                                        />
                                                </View>
                                        </View>

                                        {/* Información de envío */}
                                        <View style={styles.info_box}>
                                                <Ionicons name="information-circle" size={24} color={COLORS.primary} />
                                                <View style={styles.info_text_container}>
                                                        <Text style={styles.info_title}>Información de Envío</Text>
                                                        <Text style={styles.info_description}>
                                                                • Costo de envío: $50{'\n'}
                                                                • Tiempo de entrega: 3-5 días hábiles
                                                        </Text>
                                                </View>
                                        </View>
                                </View>
                        </ScrollView>

                        {/* Footer */}
                        <View style={styles.footer}>
                                <View style={styles.total_row}>
                                        <Text style={styles.total_label}>Total:</Text>
                                        <Text style={styles.total_amount}>${get_total()}</Text>
                                </View>
                                <CustomButton title="Continuar al Pago" on_press={handle_continue} />
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
                marginTop: 10,
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

export default CheckoutAddressScreen;
