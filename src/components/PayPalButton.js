import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { createPayPalOrder, capturePayPalPayment } from '../services/paypalService';

/**
 * Componente PayPalButton
 * Botón para procesar pagos con PayPal
 */
const PayPalButton = ({ amount, currency = 'USD', orderDetails, onSuccess, onError, onCancel }) => {
  const [loading, setLoading] = useState(false);

  const handlePayPalPayment = async () => {
    setLoading(true);

    try {
      // Paso 1: Crear orden en PayPal
      console.log('Creando orden de PayPal...');
      const orderResult = await createPayPalOrder(amount, currency, orderDetails);

      if (!orderResult.success) {
        throw new Error(orderResult.error || 'Error al crear la orden');
      }

      console.log('Orden creada:', orderResult.orderId);

      // Paso 2: Abrir URL de aprobación en el navegador
      const approvalUrl = orderResult.approvalUrl;

      if (!approvalUrl) {
        throw new Error('No se pudo obtener la URL de aprobación');
      }

      // Listener para capturar cuando el usuario regresa de PayPal
      const handleDeepLink = async (event) => {
        const url = event.url;
        console.log('Deep link recibido:', url);

        // Remover el listener
        Linking.removeEventListener('url', handleDeepLink);

        if (url.includes('payment-success')) {
          // Usuario aprobó el pago
          try {
            console.log('Capturando pago...');
            const captureResult = await capturePayPalPayment(orderResult.orderId);

            if (captureResult.success) {
              console.log('Pago capturado exitosamente');
              setLoading(false);

              Alert.alert(
                'Pago Exitoso',
                `Tu pago de ${currency} ${amount.toFixed(2)} fue procesado correctamente.`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      if (onSuccess) {
                        onSuccess({
                          transactionId: captureResult.transactionId,
                          amount: captureResult.amount,
                          currency: captureResult.currency,
                          payerEmail: captureResult.payerEmail,
                          payerName: captureResult.payerName,
                          orderId: orderResult.orderId,
                        });
                      }
                    },
                  },
                ]
              );
            } else {
              throw new Error(captureResult.error || 'Error al capturar el pago');
            }
          } catch (error) {
            console.error('Error capturando pago:', error);
            setLoading(false);
            Alert.alert('Error', error.message || 'No se pudo completar el pago');
            if (onError) onError(error);
          }
        } else if (url.includes('payment-cancel')) {
          // Usuario canceló el pago
          console.log('Pago cancelado por el usuario');
          setLoading(false);
          Alert.alert('Pago Cancelado', 'Has cancelado el pago.');
          if (onCancel) onCancel();
        }
      };

      // Agregar listener para deep links
      Linking.addEventListener('url', handleDeepLink);

      // Abrir la URL de PayPal en el navegador
      const supported = await Linking.canOpenURL(approvalUrl);

      if (supported) {
        await Linking.openURL(approvalUrl);
      } else {
        throw new Error('No se pudo abrir el navegador');
      }
    } catch (error) {
      console.error('Error en proceso de pago:', error);
      setLoading(false);

      Alert.alert(
        'Error',
        error.message || 'Ocurrió un error al procesar el pago. Intenta de nuevo.'
      );

      if (onError) {
        onError(error);
      }
    }
  };

  return (
    <TouchableOpacity
      style={[styles.paypal_button, loading && styles.paypal_button_disabled]}
      onPress={handlePayPalPayment}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <View style={styles.button_content}>
          <ActivityIndicator size="small" color={COLORS.white} />
          <Text style={styles.paypal_button_text}>Procesando...</Text>
        </View>
      ) : (
        <View style={styles.button_content}>
          <Ionicons name="logo-paypal" size={24} color={COLORS.white} />
          <Text style={styles.paypal_button_text}>Pagar con PayPal</Text>
          <Text style={styles.paypal_amount_text}>
            {currency} ${amount.toFixed(2)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  paypal_button: {
    backgroundColor: '#0070BA',
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
  paypal_button_disabled: {
    backgroundColor: '#8A9AA8',
    opacity: 0.7,
  },
  button_content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  paypal_button_text: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  paypal_amount_text: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 'auto',
  },
});

export default PayPalButton;
