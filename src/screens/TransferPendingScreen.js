import React, { useEffect } from 'react';
import {
        View,
        Text,
        StyleSheet,
        SafeAreaView,
        Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors.js';
import CustomButton from '../components/CustomButton.js';

const TransferPendingScreen = ({ navigation, route }) => {
        const { order_id } = route.params || {};
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

        const handle_continue = () => {
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
                                {/* Ícono animado */}
                                <Animated.View
                                        style={[
                                                styles.icon_container,
                                                {
                                                        transform: [{ scale: scaleAnim }],
                                                },
                                        ]}
                                >
                                        <View style={styles.icon_background}>
                                                <Ionicons name="time" size={80} color={COLORS.white} />
                                        </View>
                                </Animated.View>

                                {/* Mensaje */}
                                <Animated.View
                                        style={[
                                                styles.message_container,
                                                {
                                                        opacity: fadeAnim,
                                                },
                                        ]}
                                >
                                        <Text style={styles.title}>Pago en Verificación</Text>
                                        <Text style={styles.subtitle}>
                                                Tu comprobante de pago ha sido recibido correctamente
                                        </Text>

                                        {order_id && (
                                                <View style={styles.order_info}>
                                                        <Text style={styles.order_label}>Número de pedido:</Text>
                                                        <Text style={styles.order_number}>#{order_id}</Text>
                                                </View>
                                        )}

                                        <View style={styles.info_card}>
                                                <View style={styles.info_item}>
                                                        <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                                                        <Text style={styles.info_text}>
                                                                Comprobante recibido
                                                        </Text>
                                                </View>

                                                <View style={styles.info_item}>
                                                        <Ionicons name="time-outline" size={24} color="#FF9800" />
                                                        <Text style={styles.info_text}>
                                                                Verificación en 24-48 horas
                                                        </Text>
                                                </View>

                                                <View style={styles.info_item}>
                                                        <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />
                                                        <Text style={styles.info_text}>
                                                                Te notificaremos por email
                                                        </Text>
                                                </View>
                                        </View>

                                        <Text style={styles.description}>
                                                Nuestro equipo está verificando tu pago. Una vez confirmado, tu pedido será
                                                procesado y recibirás una notificación. Puedes consultar el estado de tu
                                                pedido en cualquier momento desde "Mis Compras".
                                        </Text>
                                </Animated.View>

                                {/* Botones */}
                                <View style={styles.buttons_container}>
                                        <CustomButton
                                                title="Ver Mis Compras"
                                                on_press={handle_view_orders}
                                        />
                                        <CustomButton
                                                title="Volver al Inicio"
                                                on_press={handle_continue}
                                                style={styles.secondary_button}
                                                text_style={styles.secondary_button_text}
                                        />
                                </View>
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
                padding: 30,
                justifyContent: 'center',
                alignItems: 'center',
        },
        icon_container: {
                marginBottom: 30,
        },
        icon_background: {
                width: 160,
                height: 160,
                borderRadius: 80,
                backgroundColor: '#FF9800',
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#FF9800',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 10,
        },
        message_container: {
                alignItems: 'center',
                width: '100%',
        },
        title: {
                fontSize: 28,
                fontWeight: 'bold',
                color: COLORS.textDark,
                marginBottom: 10,
                textAlign: 'center',
        },
        subtitle: {
                fontSize: 16,
                color: '#666',
                textAlign: 'center',
                marginBottom: 20,
                lineHeight: 24,
        },
        order_info: {
                backgroundColor: COLORS.primaryLight,
                padding: 15,
                borderRadius: 12,
                marginBottom: 25,
                alignItems: 'center',
                width: '100%',
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
                letterSpacing: 1,
        },
        info_card: {
                backgroundColor: '#F5F5F5',
                padding: 20,
                borderRadius: 15,
                marginBottom: 20,
                width: '100%',
        },
        info_item: {
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 15,
        },
        info_text: {
                fontSize: 14,
                color: COLORS.textDark,
                marginLeft: 15,
                flex: 1,
        },
        description: {
                fontSize: 14,
                color: '#666',
                textAlign: 'center',
                lineHeight: 22,
                marginBottom: 30,
        },
        buttons_container: {
                width: '100%',
                marginTop: 20,
        },
        secondary_button: {
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderColor: COLORS.primary,
                marginTop: 15,
        },
        secondary_button_text: {
                color: COLORS.primary,
        },
});

export default TransferPendingScreen;
