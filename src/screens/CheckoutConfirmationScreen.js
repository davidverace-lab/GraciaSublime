import React from 'react';
import {
        View,
        Text,
        StyleSheet,
        SafeAreaView,
        ScrollView,
        TouchableOpacity,
        Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors.js';
import CustomButton from '../components/CustomButton.js';
import { useCart } from '../context/CartContext.js';
import { useLocation } from '../context/LocationContext.js';
import { useOrders } from '../context/OrdersContext.js';

const CheckoutConfirmationScreen = ({ navigation, route }) => {
        const { payment_method } = route.params;
        const { cart_items, get_total, clear_cart } = useCart();
        const { address } = useLocation();
        const { add_order } = useOrders();

        const payment_method_names = {
                card: 'Tarjeta de Crédito/Débito',
                oxxo: 'OXXO Pay',
                transfer: 'Transferencia Bancaria',
        };

        const shipping_cost = 50;
        const subtotal = get_total();
        const total = subtotal + shipping_cost;

        const handle_confirm = () => {
                // Guardar orden
                add_order(cart_items, total);

                // Limpiar carrito
                clear_cart();

                // Navegar a pantalla de éxito
                navigation.navigate('OrderSuccess');
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
                                <Text style={styles.header_title}>Confirmar Pedido</Text>
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
                                        <View style={styles.progress_step}>
                                                <View style={styles.step_circle_completed}>
                                                        <Ionicons name="checkmark" size={20} color={COLORS.white} />
                                                </View>
                                                <Text style={styles.step_label}>Pago</Text>
                                        </View>
                                        <View style={styles.progress_line_active} />
                                        <View style={styles.progress_step_active}>
                                                <View style={styles.step_circle_active}>
                                                        <Text style={styles.step_number}>3</Text>
                                                </View>
                                                <Text style={styles.step_label}>Confirmar</Text>
                                        </View>
                                </View>

                                <View style={styles.sections_container}>
                                        {/* Resumen de Dirección */}
                                        <View style={styles.section}>
                                                <View style={styles.section_header}>
                                                        <Ionicons name="location" size={24} color={COLORS.primary} />
                                                        <Text style={styles.section_title}>Dirección de Entrega</Text>
                                                </View>
                                                <View style={styles.info_card}>
                                                        <Text style={styles.info_text}>{address.street}</Text>
                                                        <Text style={styles.info_text}>
                                                                {address.city}, {address.state} {address.zip_code}
                                                        </Text>
                                                </View>
                                        </View>

                                        {/* Método de Pago */}
                                        <View style={styles.section}>
                                                <View style={styles.section_header}>
                                                        <Ionicons name="card" size={24} color={COLORS.primary} />
                                                        <Text style={styles.section_title}>Método de Pago</Text>
                                                </View>
                                                <View style={styles.info_card}>
                                                        <Text style={styles.info_text}>
                                                                {payment_method_names[payment_method]}
                                                        </Text>
                                                </View>
                                        </View>

                                        {/* Resumen de Productos */}
                                        <View style={styles.section}>
                                                <View style={styles.section_header}>
                                                        <Ionicons name="cart" size={24} color={COLORS.primary} />
                                                        <Text style={styles.section_title}>Resumen del Pedido</Text>
                                                </View>

                                                {cart_items.map((item) => (
                                                        <View key={item.product.uniqueId || item.product.id} style={styles.product_item}>
                                                                {/* Imagen del producto */}
                                                                <View style={styles.product_image_container}>
                                                                        {item.product.customImage ? (
                                                                                <Image
                                                                                        source={{ uri: item.product.customImage }}
                                                                                        style={styles.product_image}
                                                                                        resizeMode="cover"
                                                                                />
                                                                        ) : item.product.customDesign ? (
                                                                                <View style={[styles.product_design_icon, { backgroundColor: item.product.customDesign.color }]}>
                                                                                        <Ionicons
                                                                                                name={item.product.customDesign.icon}
                                                                                                size={20}
                                                                                                color={COLORS.white}
                                                                                        />
                                                                                </View>
                                                                        ) : item.product.image ? (
                                                                                <Image
                                                                                        source={item.product.image}
                                                                                        style={styles.product_image}
                                                                                        resizeMode="cover"
                                                                                />
                                                                        ) : (
                                                                                <View style={styles.product_placeholder}>
                                                                                        <Ionicons name="cafe" size={20} color={COLORS.primary} />
                                                                                </View>
                                                                        )}
                                                                </View>

                                                                <View style={styles.product_info}>
                                                                        <Text style={styles.product_name} numberOfLines={2}>{item.product.name}</Text>
                                                                        <Text style={styles.product_quantity}>
                                                                                Cantidad: {item.quantity}
                                                                        </Text>
                                                                </View>
                                                                <Text style={styles.product_price}>
                                                                        ${item.product.price * item.quantity}
                                                                </Text>
                                                        </View>
                                                ))}

                                                {/* Totales */}
                                                <View style={styles.totals_container}>
                                                        <View style={styles.total_row}>
                                                                <Text style={styles.total_label}>Subtotal:</Text>
                                                                <Text style={styles.total_value}>${subtotal}</Text>
                                                        </View>
                                                        <View style={styles.total_row}>
                                                                <Text style={styles.total_label}>Envío:</Text>
                                                                <Text style={styles.total_value}>${shipping_cost}</Text>
                                                        </View>
                                                        <View style={[styles.total_row, styles.grand_total_row]}>
                                                                <Text style={styles.grand_total_label}>Total:</Text>
                                                                <Text style={styles.grand_total_value}>${total}</Text>
                                                        </View>
                                                </View>
                                        </View>

                                        {/* Nota de entrega */}
                                        <View style={styles.delivery_note}>
                                                <Ionicons name="time" size={20} color={COLORS.primary} />
                                                <Text style={styles.delivery_text}>
                                                        Entrega estimada: 3-5 días hábiles
                                                </Text>
                                        </View>
                                </View>
                        </ScrollView>

                        {/* Footer */}
                        <View style={styles.footer}>
                                <View style={styles.total_footer_row}>
                                        <Text style={styles.total_footer_label}>Total a Pagar:</Text>
                                        <Text style={styles.total_footer_amount}>${total}</Text>
                                </View>
                                <CustomButton title="Confirmar Compra" on_press={handle_confirm} />
                        </View>
                </SafeAreaView>
        );
};

const styles = StyleSheet.create({
        container: {
                flex: 1,
                backgroundColor: '#f5f5f5',
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
                backgroundColor: COLORS.white,
        },
        progress_step: {
                alignItems: 'center',
        },
        progress_step_active: {
                alignItems: 'center',
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
        step_label: {
                fontSize: 12,
                color: COLORS.primary,
                fontWeight: '600',
        },
        progress_line_active: {
                width: 40,
                height: 2,
                backgroundColor: '#4CAF50',
                marginHorizontal: 5,
        },
        sections_container: {
                padding: 15,
        },
        section: {
                backgroundColor: COLORS.white,
                borderRadius: 15,
                padding: 15,
                marginBottom: 15,
        },
        section_header: {
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 15,
        },
        section_title: {
                fontSize: 18,
                fontWeight: 'bold',
                color: COLORS.textDark,
                marginLeft: 10,
        },
        info_card: {
                backgroundColor: COLORS.primaryLight,
                padding: 12,
                borderRadius: 10,
        },
        info_text: {
                fontSize: 14,
                color: COLORS.textDark,
                marginBottom: 3,
        },
        product_item: {
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#f0f0f0',
        },
        product_image_container: {
                width: 50,
                height: 50,
                borderRadius: 10,
                overflow: 'hidden',
                marginRight: 12,
                backgroundColor: COLORS.primaryLight,
        },
        product_image: {
                width: '100%',
                height: '100%',
        },
        product_design_icon: {
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
        },
        product_placeholder: {
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: COLORS.primaryLight,
        },
        product_info: {
                flex: 1,
                paddingRight: 10,
        },
        product_name: {
                fontSize: 14,
                fontWeight: '600',
                color: COLORS.textDark,
                marginBottom: 4,
        },
        product_quantity: {
                fontSize: 12,
                color: '#666',
        },
        product_price: {
                fontSize: 15,
                fontWeight: 'bold',
                color: COLORS.primary,
        },
        totals_container: {
                marginTop: 15,
                paddingTop: 15,
                borderTopWidth: 2,
                borderTopColor: '#f0f0f0',
        },
        total_row: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 10,
        },
        total_label: {
                fontSize: 14,
                color: '#666',
        },
        total_value: {
                fontSize: 14,
                fontWeight: '600',
                color: COLORS.textDark,
        },
        grand_total_row: {
                marginTop: 5,
                paddingTop: 10,
                borderTopWidth: 1,
                borderTopColor: '#f0f0f0',
        },
        grand_total_label: {
                fontSize: 18,
                fontWeight: 'bold',
                color: COLORS.textDark,
        },
        grand_total_value: {
                fontSize: 20,
                fontWeight: 'bold',
                color: COLORS.primary,
        },
        delivery_note: {
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.white,
                padding: 15,
                borderRadius: 15,
                marginBottom: 15,
        },
        delivery_text: {
                fontSize: 14,
                color: COLORS.textDark,
                marginLeft: 10,
                fontWeight: '600',
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
        total_footer_row: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 15,
        },
        total_footer_label: {
                fontSize: 18,
                fontWeight: '600',
                color: COLORS.textDark,
        },
        total_footer_amount: {
                fontSize: 24,
                fontWeight: 'bold',
                color: COLORS.primary,
        },
});

export default CheckoutConfirmationScreen;
