import React, { useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	ScrollView,
	TouchableOpacity,
	Alert,
	ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStripe } from '@stripe/stripe-react-native';
import { COLORS } from '../constants/colors.js';
import CustomButton from '../components/CustomButton.js';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { createOrder } from '../services/ordersService.js';
import { createPaymentIntent } from '../services/stripeService.js';

const CheckoutPaymentScreen = ({ navigation, route }) => {
	const { get_total, cart_items, clear_cart } = useCart();
	const { user } = useAuth();
	const [loading, setLoading] = useState(false);
	const { initPaymentSheet, presentPaymentSheet } = useStripe();

	// Obtener datos de dirección del paso anterior
	const selected_address = route?.params?.selected_address;

	/**
	 * Inicializar y presentar el Payment Sheet de Stripe
	 */
	const handlePayment = async () => {
		if (!selected_address) {
			Alert.alert('Error', 'Por favor selecciona una dirección de entrega');
			navigation.goBack();
			return;
		}

		if (cart_items.length === 0) {
			Alert.alert('Carrito Vacío', 'No tienes productos en tu carrito');
			navigation.navigate('Cart');
			return;
		}

		setLoading(true);

		try {
			// Paso 1: Crear Payment Intent en el servidor
			console.log('🔵 Creando Payment Intent...');
			const paymentIntentResult = await createPaymentIntent(
				get_total(),
				'usd',
				{
					order_id: `ORDER_${user.id}_${Date.now()}`,
					description: `Compra de ${cart_items.length} productos en Gracia Sublime`,
					customer_email: user.email,
					customer_name: user.user_metadata?.name || 'Cliente',
				}
			);

			if (!paymentIntentResult.success) {
				throw new Error(paymentIntentResult.error || 'Error al crear el Payment Intent');
			}

			const { clientSecret, paymentIntentId } = paymentIntentResult;

			console.log('✅ Payment Intent creado:', paymentIntentId);

			// Paso 2: Inicializar Payment Sheet
			console.log('📋 Inicializando Payment Sheet...');
			const { error: initError } = await initPaymentSheet({
				paymentIntentClientSecret: clientSecret,
				merchantDisplayName: 'Gracia Sublime',
				returnURL: 'graciasublime://payment-success',
				defaultBillingDetails: {
					name: user.user_metadata?.name || '',
					email: user.email || '',
				},
			});

			if (initError) {
				console.error('❌ Error inicializando Payment Sheet:', initError);
				throw new Error(initError.message || 'Error al inicializar el formulario de pago');
			}

			console.log('✅ Payment Sheet inicializado');
			setLoading(false);

			// Paso 3: Presentar Payment Sheet
			console.log('💳 Presentando Payment Sheet...');
			const { error: presentError } = await presentPaymentSheet();

			if (presentError) {
				// El usuario canceló o hubo un error
				if (presentError.code === 'Canceled') {
					console.log('ℹ️ Pago cancelado por el usuario');
					Alert.alert(
						'Pago Cancelado',
						'Has cancelado el pago. Puedes intentar de nuevo cuando estés listo.'
					);
				} else {
					console.error('❌ Error presentando Payment Sheet:', presentError);
					throw new Error(presentError.message || 'Error al procesar el pago');
				}
				return;
			}

			// Paso 4: Pago exitoso - Crear pedido en la base de datos
			console.log('✅ Pago completado exitosamente');
			setLoading(true);

			const orderResult = await createOrder(
				user.id,
				selected_address.address_id,
				cart_items,
				get_total(),
				'stripe',
				'paid', // Estado inicial: pagado
				paymentIntentId // Guardar el ID del Payment Intent
			);

			if (orderResult.error) {
				console.error('❌ Error creando pedido:', orderResult.error);
				// El pago fue exitoso pero hubo error al crear el pedido
				Alert.alert(
					'Atención',
					`Tu pago fue procesado exitosamente (ID: ${paymentIntentId}), pero hubo un problema al registrar tu pedido. Por favor contacta a soporte con este ID de transacción.`,
					[
						{
							text: 'OK',
							onPress: () => {
								clear_cart();
								navigation.reset({
									index: 0,
									routes: [{ name: 'Home' }],
								});
							},
						},
					]
				);
				return;
			}

			console.log('✅ Pedido creado exitosamente:', orderResult.data.order_id);

			// Limpiar carrito
			clear_cart();

			// Navegar a pantalla de éxito
			navigation.reset({
				index: 0,
				routes: [
					{
						name: 'OrderSuccess',
						params: {
							order_id: orderResult.data.order_id,
							payment_method: 'stripe',
							transaction_id: paymentIntentId,
							total: get_total(),
						},
					},
				],
			});
		} catch (error) {
			console.error('❌ Error en proceso de pago:', error);
			setLoading(false);

			// Mensajes de error específicos
			let errorMessage = 'Ocurrió un error al procesar el pago. Por favor intenta de nuevo.';

			if (error.message?.includes('servidor') || error.message?.includes('backend')) {
				errorMessage =
					'No se pudo conectar con el servidor de pagos. Verifica tu conexión a internet e intenta de nuevo.';
			} else if (error.message?.includes('declined') || error.message?.includes('rechazada')) {
				errorMessage =
					'Tu tarjeta fue rechazada. Por favor verifica los datos o intenta con otra tarjeta.';
			} else if (error.message?.includes('Payment Intent')) {
				errorMessage =
					'No se pudo inicializar el pago. Por favor verifica tu conexión a internet.';
			} else if (error.message) {
				errorMessage = error.message;
			}

			Alert.alert('Error de Pago', errorMessage);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => navigation.goBack()}
					style={styles.back_button}
					disabled={loading}
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

				{/* Información del Pedido */}
				<View style={styles.form_container}>
					<Text style={styles.section_title}>Resumen del Pedido</Text>

					{/* Dirección de entrega */}
					<View style={styles.info_card}>
						<View style={styles.info_row}>
							<Ionicons name="location" size={20} color={COLORS.primary} />
							<Text style={styles.info_label}>Dirección de Entrega</Text>
						</View>
						<Text style={styles.info_text}>
							{selected_address?.street_address || 'No especificada'}
						</Text>
						<Text style={styles.info_text_secondary}>
							{selected_address?.city}, {selected_address?.state}{' '}
							{selected_address?.zip_code}
						</Text>
					</View>

					{/* Items del carrito */}
					<View style={styles.info_card}>
						<View style={styles.info_row}>
							<Ionicons name="cart" size={20} color={COLORS.primary} />
							<Text style={styles.info_label}>Productos</Text>
						</View>
						{cart_items.map((item, index) => (
							<View key={index} style={styles.cart_item}>
								<Text style={styles.cart_item_name}>
									{item.name} x {item.quantity}
								</Text>
								<Text style={styles.cart_item_price}>
									${(item.price * item.quantity).toFixed(2)}
								</Text>
							</View>
						))}
					</View>

					{/* Método de Pago */}
					<View style={styles.payment_method_card}>
						<View style={styles.payment_method_icon_container}>
							<Ionicons name="card" size={32} color={COLORS.primary} />
						</View>
						<View style={styles.payment_method_content}>
							<Text style={styles.payment_method_name}>Tarjeta de Crédito/Débito</Text>
							<Text style={styles.payment_method_description}>
								Pago seguro procesado por Stripe
							</Text>
							<View style={styles.card_brands}>
								<Ionicons name="card-outline" size={16} color="#666" />
								<Text style={styles.card_brands_text}>
									Visa, Mastercard, American Express
								</Text>
							</View>
						</View>
					</View>

					{/* Información de seguridad */}
					<View style={styles.security_box}>
						<Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
						<View style={styles.security_text_container}>
							<Text style={styles.security_title}>Pago 100% Seguro</Text>
							<Text style={styles.security_description}>
								Tus datos están protegidos con encriptación de nivel bancario. No
								almacenamos información de tu tarjeta.
							</Text>
						</View>
					</View>
				</View>
			</ScrollView>

			{/* Footer con Total y Botón de Pago */}
			<View style={styles.footer}>
				<View style={styles.total_row}>
					<Text style={styles.total_label}>Total a Pagar:</Text>
					<Text style={styles.total_amount}>${get_total().toFixed(2)}</Text>
				</View>

				{loading ? (
					<View style={styles.loading_container}>
						<ActivityIndicator size="large" color={COLORS.primary} />
						<Text style={styles.loading_text}>Procesando pago seguro...</Text>
					</View>
				) : (
					<CustomButton
						title="Proceder al Pago"
						on_press={handlePayment}
						icon="lock-closed"
					/>
				)}

				<Text style={styles.footer_note}>
					Al continuar, aceptas nuestros términos y condiciones
				</Text>
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
	info_card: {
		backgroundColor: COLORS.primaryLight,
		borderRadius: 12,
		padding: 15,
		marginBottom: 15,
	},
	info_row: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10,
	},
	info_label: {
		fontSize: 16,
		fontWeight: '600',
		color: COLORS.textDark,
		marginLeft: 8,
	},
	info_text: {
		fontSize: 14,
		color: COLORS.textDark,
		marginBottom: 3,
	},
	info_text_secondary: {
		fontSize: 13,
		color: '#666',
	},
	cart_item: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 5,
	},
	cart_item_name: {
		fontSize: 14,
		color: COLORS.textDark,
		flex: 1,
	},
	cart_item_price: {
		fontSize: 14,
		fontWeight: '600',
		color: COLORS.primary,
	},
	payment_method_card: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: COLORS.white,
		borderRadius: 15,
		padding: 18,
		marginBottom: 15,
		borderWidth: 2,
		borderColor: COLORS.primary,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 4,
	},
	payment_method_icon_container: {
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: COLORS.primaryLight,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 15,
	},
	payment_method_content: {
		flex: 1,
	},
	payment_method_name: {
		fontSize: 16,
		fontWeight: '700',
		color: COLORS.primary,
		marginBottom: 4,
	},
	payment_method_description: {
		fontSize: 12,
		color: '#666',
		marginBottom: 6,
	},
	card_brands: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 5,
	},
	card_brands_text: {
		fontSize: 11,
		color: '#666',
	},
	security_box: {
		flexDirection: 'row',
		backgroundColor: '#E8F5E9',
		padding: 15,
		borderRadius: 12,
		marginTop: 5,
		alignItems: 'flex-start',
	},
	security_text_container: {
		flex: 1,
		marginLeft: 12,
	},
	security_title: {
		fontSize: 14,
		fontWeight: '600',
		color: '#2E7D32',
		marginBottom: 3,
	},
	security_description: {
		fontSize: 12,
		color: '#4CAF50',
		lineHeight: 16,
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
	loading_container: {
		alignItems: 'center',
		paddingVertical: 20,
	},
	loading_text: {
		marginTop: 10,
		fontSize: 14,
		color: '#666',
	},
	footer_note: {
		fontSize: 11,
		color: '#999',
		textAlign: 'center',
		marginTop: 10,
	},
});

export default CheckoutPaymentScreen;
