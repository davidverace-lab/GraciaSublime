import React from 'react';
import {
        View,
        Text,
        StyleSheet,
        FlatList,
        Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors.js';
import CustomButton from '../components/CustomButton.js';
import CartItem from '../components/CartItem.js';
import { useCart } from '../context/CartContext.js';
import { useOrders } from '../context/OrdersContext.js';

const CartScreen = ({ navigation }) => {
        const { cart_items, update_quantity, remove_from_cart, get_total } = useCart();

        const handle_checkout = () => {
                if (cart_items.length === 0) {
                        Alert.alert('Carrito Vacío', 'Agrega productos antes de pagar');
                        return;
                }

                // Navegar a la pantalla de checkout
                navigation.navigate('CheckoutAddress');
        };

        return (
                <SafeAreaView style={styles.container}>
                        {/* Header */}
                        <View style={styles.header}>
                                <Text style={styles.header_title}>MI CARRITO</Text>
                        </View>

                        {/* Lista de productos */}
                        {cart_items.length === 0 ? (
                                <View style={styles.empty_container}>
                                        <Text style={styles.empty_text}>Tu carrito está vacío</Text>
                                        <Text style={styles.empty_subtext}>Agrega productos para comenzar</Text>
                                </View>
                        ) : (
                                <>
                                        {/* Contador de items */}
                                        <View style={styles.items_counter}>
                                                <Text style={styles.items_counter_text}>
                                                        {cart_items.length} {cart_items.length === 1 ? 'producto' : 'productos'}
                                                </Text>
                                        </View>

                                        <FlatList
                                                data={cart_items}
                                                renderItem={({ item }) => (
                                                        <CartItem
                                                                item={item}
                                                                on_update_quantity={(quantity) => update_quantity(item.cart_item_id, quantity)}
                                                                on_remove={() => remove_from_cart(item.cart_item_id)}
                                                        />
                                                )}
                                                keyExtractor={(item) => item.cart_item_id?.toString() || Math.random().toString()}
                                                contentContainerStyle={styles.list_content}
                                                showsVerticalScrollIndicator={false}
                                        />

                                        {/* Footer con total y botón de pago */}
                                        <View style={styles.footer}>
                                                {/* Resumen de costos */}
                                                <View style={styles.summary_container}>
                                                        <View style={styles.summary_row}>
                                                                <Text style={styles.summary_label}>Subtotal</Text>
                                                                <Text style={styles.summary_value}>${get_total()}</Text>
                                                        </View>
                                                        <View style={styles.summary_row}>
                                                                <Text style={styles.summary_label}>Envío</Text>
                                                                <Text style={styles.summary_value}>$50</Text>
                                                        </View>
                                                        <View style={styles.divider} />
                                                        <View style={styles.total_container}>
                                                                <Text style={styles.total_label}>Total</Text>
                                                                <Text style={styles.total_amount}>${get_total() + 50}</Text>
                                                        </View>
                                                </View>

                                                <CustomButton title="Proceder al Pago" on_press={handle_checkout} />
                                        </View>
                                </>
                        )}
                </SafeAreaView>
        );
};

const styles = StyleSheet.create({
        container: {
                flex: 1,
                backgroundColor: '#f9f9f9',
        },
        header: {
                backgroundColor: COLORS.primary,
                paddingHorizontal: 20,
                paddingVertical: 20,
                alignItems: 'center',
                borderBottomLeftRadius: 25,
                borderBottomRightRadius: 25,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 8,
        },
        header_title: {
                fontSize: 24,
                fontWeight: 'bold',
                color: COLORS.white,
        },
        items_counter: {
                paddingHorizontal: 20,
                paddingVertical: 12,
                backgroundColor: COLORS.white,
                marginHorizontal: 20,
                marginTop: 15,
                marginBottom: 5,
                borderRadius: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
        },
        items_counter_text: {
                fontSize: 14,
                fontWeight: '600',
                color: COLORS.textDark,
        },
        list_content: {
                padding: 20,
                paddingTop: 10,
        },
        empty_container: {
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 40,
        },
        empty_text: {
                fontSize: 24,
                fontWeight: 'bold',
                color: COLORS.textDark,
                marginBottom: 10,
        },
        empty_subtext: {
                fontSize: 16,
                color: '#666',
                textAlign: 'center',
        },
        footer: {
                padding: 20,
                backgroundColor: COLORS.white,
                borderTopWidth: 1,
                borderTopColor: '#e0e0e0',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -3 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 10,
        },
        summary_container: {
                marginBottom: 15,
        },
        summary_row: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
        },
        summary_label: {
                fontSize: 15,
                color: '#666',
        },
        summary_value: {
                fontSize: 15,
                fontWeight: '600',
                color: COLORS.textDark,
        },
        divider: {
                height: 1,
                backgroundColor: '#e0e0e0',
                marginVertical: 10,
        },
        total_container: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 5,
        },
        total_label: {
                fontSize: 20,
                fontWeight: 'bold',
                color: COLORS.textDark,
        },
        total_amount: {
                fontSize: 28,
                fontWeight: 'bold',
                color: COLORS.primary,
        },
});

export default CartScreen;
