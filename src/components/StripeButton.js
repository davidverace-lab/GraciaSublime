import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { createPaymentIntent } from '../services/stripeService';

/**
 * Componente StripeButton
 * Botón y formulario para procesar pagos con Stripe
 *
 * IMPORTANTE: Para usar este componente, debes:
 * 1. Tener el StripeProvider configurado en App.js
 * 2. Tener un servidor backend que cree Payment Intents
 * 3. Configurar las claves de Stripe en el archivo de configuración
 */
const StripeButton = ({
  amount,
  currency = 'usd',
  orderDetails,
  onSuccess,
  onError,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const { confirmPayment } = useStripe();

  /**
   * Manejar el pago con Stripe
   */
  const handleStripePayment = async () => {
    console.log('🔵 Iniciando pago con Stripe...');
    console.log('Amount:', amount);
    console.log('Currency:', currency);
    console.log('Order details:', orderDetails);

    if (!cardComplete) {
      Alert.alert(
        'Datos Incompletos',
        'Por favor completa todos los datos de tu tarjeta antes de continuar.'
      );
      return;
    }

    setLoading(true);

    try {
      // Paso 1: Crear Payment Intent en el servidor
      console.log('📋 Creando Payment Intent...');
      const paymentIntentResult = await createPaymentIntent(amount, currency, orderDetails);

      if (!paymentIntentResult.success) {
        throw new Error(paymentIntentResult.error || 'Error al crear el Payment Intent');
      }

      console.log('✅ Payment Intent creado:', paymentIntentResult.paymentIntentId);

      const { clientSecret } = paymentIntentResult;

      if (!clientSecret) {
        throw new Error('No se recibió el client secret del servidor');
      }

      // Paso 2: Confirmar el pago con los datos de la tarjeta
      console.log('💳 Confirmando pago con tarjeta...');
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        console.error('❌ Error al confirmar pago:', error);
        throw new Error(error.message || 'Error al procesar el pago');
      }

      if (paymentIntent) {
        console.log('✅ Pago confirmado exitosamente');
        console.log('Payment Intent ID:', paymentIntent.id);
        console.log('Status:', paymentIntent.status);

        setLoading(false);

        // Verificar el estado del pago
        if (paymentIntent.status === 'Succeeded') {
          Alert.alert(
            '¡Pago Exitoso!',
            `Tu pago de $${amount.toFixed(2)} ${currency.toUpperCase()} fue procesado correctamente.`,
            [
              {
                text: 'OK',
                onPress: () => {
                  if (onSuccess) {
                    onSuccess({
                      transactionId: paymentIntent.id,
                      amount: paymentIntent.amount / 100, // Convertir de centavos a dólares
                      currency: paymentIntent.currency,
                      paymentMethod: 'stripe',
                      status: paymentIntent.status,
                    });
                  }
                },
              },
            ]
          );
        } else {
          console.warn('⚠️ Pago con estado inesperado:', paymentIntent.status);
          throw new Error(`El pago tiene estado: ${paymentIntent.status}`);
        }
      }
    } catch (error) {
      console.error('❌ Error en proceso de pago con Stripe:', error);
      setLoading(false);

      // Mensaje de error más descriptivo
      let errorMessage = 'Ocurrió un error al procesar el pago. Por favor intenta de nuevo.';

      if (error.message?.includes('servidor') || error.message?.includes('backend')) {
        errorMessage = 'No se pudo conectar con el servidor de pagos. Verifica tu conexión a internet e intenta de nuevo.';
      } else if (error.message?.includes('tarjeta') || error.message?.includes('card')) {
        errorMessage = 'Error con los datos de la tarjeta. Por favor verifica que los datos sean correctos.';
      } else if (error.message?.includes('declined') || error.message?.includes('rechazada')) {
        errorMessage = 'Tu tarjeta fue rechazada. Por favor intenta con otra tarjeta o método de pago.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Error de Pago', errorMessage);

      if (onError) {
        onError(error);
      }
    }
  };

  /**
   * Manejar cambios en el formulario de tarjeta
   */
  const handleCardChange = (cardDetails) => {
    setCardComplete(cardDetails.complete);
    console.log('Card complete:', cardDetails.complete);
  };

  return (
    <View style={styles.container}>
      {/* Formulario de Tarjeta */}
      <View style={styles.card_form_container}>
        <Text style={styles.form_title}>Datos de Tarjeta</Text>
        <CardField
          postalCodeEnabled={true}
          placeholders={{
            number: '4242 4242 4242 4242',
            expiration: 'MM/AA',
            cvc: 'CVC',
            postalCode: 'Código Postal',
          }}
          cardStyle={{
            backgroundColor: COLORS.white,
            textColor: COLORS.textDark,
            borderColor: '#ddd',
            borderWidth: 1,
            borderRadius: 8,
            fontSize: 14,
            placeholderColor: '#999',
          }}
          style={styles.card_field}
          onCardChange={handleCardChange}
        />
        <Text style={styles.security_text}>
          <Ionicons name="lock-closed" size={12} color="#4CAF50" />
          {' '}Tu información está protegida y encriptada
        </Text>
      </View>

      {/* Botón de Pago */}
      <TouchableOpacity
        style={[
          styles.stripe_button,
          (!cardComplete || loading) && styles.stripe_button_disabled
        ]}
        onPress={handleStripePayment}
        disabled={!cardComplete || loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <View style={styles.button_content}>
            <ActivityIndicator size="small" color={COLORS.white} />
            <Text style={styles.stripe_button_text}>Procesando...</Text>
          </View>
        ) : (
          <View style={styles.button_content}>
            <Ionicons name="card" size={24} color={COLORS.white} />
            <Text style={styles.stripe_button_text}>Pagar con Tarjeta</Text>
            <Text style={styles.stripe_amount_text}>
              ${amount.toFixed(2)} {currency.toUpperCase()}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Mensaje de información */}
      <View style={styles.info_container}>
        <Ionicons name="information-circle" size={16} color="#666" />
        <Text style={styles.info_text}>
          Aceptamos Visa, Mastercard, American Express y más
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  card_form_container: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  form_title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  card_field: {
    width: '100%',
    height: 50,
    marginVertical: 10,
  },
  security_text: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 8,
    textAlign: 'center',
  },
  stripe_button: {
    backgroundColor: '#635BFF', // Color oficial de Stripe
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  stripe_button_disabled: {
    backgroundColor: '#8A9AA8',
    opacity: 0.7,
  },
  button_content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stripe_button_text: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  stripe_amount_text: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 'auto',
  },
  info_container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
    gap: 5,
  },
  info_text: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default StripeButton;
