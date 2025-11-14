import React, { useEffect } from 'react';
import {
        View,
        Text,
        StyleSheet,
        SafeAreaView,
        TouchableOpacity,
        Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors.js';
import CustomButton from '../components/CustomButton.js';

const OrderSuccessScreen = ({ navigation }) => {
        const scaleAnim = new Animated.Value(0);
        const fadeAnim = new Animated.Value(0);

        useEffect(() => {
                Animated.sequence([
                        Animated.spring(scaleAnim, {
                                toValue: 1,
                                tension: 50,
                                friction: 7,
                                useNativeDriver: true,
                        }),
                        Animated.timing(fadeAnim, {
                                toValue: 1,
                                duration: 300,
                                useNativeDriver: true,
                        }),
                ]).start();
        }, []);

        const handle_continue_shopping = () => {
                navigation.reset({
                        index: 0,
                        routes: [{ name: 'MainDrawer' }],
                });
        };

        const handle_view_orders = () => {
                navigation.reset({
                        index: 0,
                        routes: [
                                {
                                        name: 'MainDrawer',
                                        params: {
                                                screen: 'OrderHistory',
                                        },
                                },
                        ],
                });
        };

        return (
                <SafeAreaView style={styles.container}>
                        <View style={styles.content}>
                                {/* Icono de éxito animado */}
                                <Animated.View
                                        style={[
                                                styles.icon_container,
                                                {
                                                        transform: [{ scale: scaleAnim }],
                                                },
                                        ]}
                                >
                                        <View style={styles.icon_circle}>
                                                <Ionicons name="checkmark" size={80} color={COLORS.white} />
                                        </View>
                                </Animated.View>

                                {/* Mensaje de éxito */}
                                <Animated.View
                                        style={[
                                                styles.message_container,
                                                {
                                                        opacity: fadeAnim,
                                                },
                                        ]}
                                >
                                        <Text style={styles.success_title}>¡Compra Exitosa!</Text>
                                        <Text style={styles.success_subtitle}>
                                                Tu pedido ha sido confirmado
                                        </Text>

                                        <View style={styles.info_box}>
                                                <Ionicons name="mail" size={24} color={COLORS.primary} />
                                                <Text style={styles.info_text}>
                                                        Recibirás un correo electrónico con los detalles de tu pedido
                                                </Text>
                                        </View>

                                        <View style={styles.info_box}>
                                                <Ionicons name="time" size={24} color={COLORS.primary} />
                                                <Text style={styles.info_text}>
                                                        Tiempo estimado de entrega: 3-5 días hábiles
                                                </Text>
                                        </View>

                                        <View style={styles.divider} />

                                        <View style={styles.order_number_container}>
                                                <Text style={styles.order_label}>Número de Orden</Text>
                                                <Text style={styles.order_number}>
                                                        #{Date.now().toString().slice(-8)}
                                                </Text>
                                        </View>
                                </Animated.View>
                        </View>

                        {/* Botones de acción */}
                        <View style={styles.buttons_container}>
                                <CustomButton
                                        title="Ver Mis Pedidos"
                                        on_press={handle_view_orders}
                                />
                                <TouchableOpacity
                                        style={styles.secondary_button}
                                        onPress={handle_continue_shopping}
                                >
                                        <Text style={styles.secondary_button_text}>Seguir Comprando</Text>
                                </TouchableOpacity>
                        </View>
                </SafeAreaView>
        );
};

const styles = StyleSheet.create({
        container: {
                flex: 1,
                backgroundColor: COLORS.white,
        },
        content: {
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 30,
        },
        icon_container: {
                marginBottom: 30,
        },
        icon_circle: {
                width: 150,
                height: 150,
                borderRadius: 75,
                backgroundColor: '#4CAF50',
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#4CAF50',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
                elevation: 15,
        },
        message_container: {
                alignItems: 'center',
                width: '100%',
        },
        success_title: {
                fontSize: 32,
                fontWeight: 'bold',
                color: COLORS.textDark,
                marginBottom: 10,
                textAlign: 'center',
        },
        success_subtitle: {
                fontSize: 18,
                color: '#666',
                marginBottom: 30,
                textAlign: 'center',
        },
        info_box: {
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.primaryLight,
                padding: 15,
                borderRadius: 12,
                marginBottom: 15,
                width: '100%',
        },
        info_text: {
                flex: 1,
                fontSize: 14,
                color: COLORS.textDark,
                marginLeft: 12,
                lineHeight: 20,
        },
        divider: {
                width: '100%',
                height: 1,
                backgroundColor: '#e0e0e0',
                marginVertical: 20,
        },
        order_number_container: {
                alignItems: 'center',
                backgroundColor: COLORS.primaryLight,
                padding: 20,
                borderRadius: 15,
                width: '100%',
                borderWidth: 2,
                borderColor: COLORS.primary,
                borderStyle: 'dashed',
        },
        order_label: {
                fontSize: 14,
                color: '#666',
                marginBottom: 5,
        },
        order_number: {
                fontSize: 24,
                fontWeight: 'bold',
                color: COLORS.primary,
        },
        buttons_container: {
                padding: 20,
                paddingBottom: 30,
        },
        secondary_button: {
                backgroundColor: COLORS.white,
                paddingVertical: 15,
                borderRadius: 15,
                alignItems: 'center',
                marginTop: 12,
                borderWidth: 2,
                borderColor: COLORS.primary,
        },
        secondary_button_text: {
                color: COLORS.primary,
                fontSize: 16,
                fontWeight: 'bold',
        },
});

export default OrderSuccessScreen;
