import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking, // Solo para abrir URLs, no para deep links
  AppState,
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
  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [showVerifyButton, setShowVerifyButton] = useState(false);
  const appState = useRef(AppState.currentState);
  const timeoutRef = useRef(null);
  const verificationAttempts = useRef(0);

  // Limpiar timeouts
  const cleanupListeners = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      console.log('✅ Timeout limpiado');
    }
  };

  // Función manual para verificar el pago
  const handleManualVerification = async () => {
    if (!pendingOrderId) {
      Alert.alert('Error', 'No hay un pago pendiente para verificar');
      return;
    }

    console.log('🔍 Verificación manual iniciada para orden:', pendingOrderId);
    setLoading(true);
    verificationAttempts.current += 1;

    try {
      const captureResult = await capturePayPalPayment(pendingOrderId);
      console.log('📦 Resultado de verificación manual:', JSON.stringify(captureResult, null, 2));

      if (captureResult.success) {
        console.log('✅ Pago capturado exitosamente en verificación manual');

        cleanupListeners();
        setLoading(false);
        setPendingOrderId(null);
        setShowVerifyButton(false);
        verificationAttempts.current = 0;

        Alert.alert(
          '¡Pago Confirmado!',
          `Tu pago de $${amount.toFixed(2)} ${currency} fue procesado exitosamente.`,
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
                    orderId: pendingOrderId,
                  });
                }
              },
            },
          ]
        );
      } else {
        console.log('⚠️ Pago aún no aprobado:', captureResult.error);
        setLoading(false);

        if (verificationAttempts.current >= 3) {
          Alert.alert(
            'Pago Pendiente',
            'El pago aún no está confirmado. Por favor contacta a soporte con tu número de orden: ' + pendingOrderId,
            [
              {
                text: 'OK',
                onPress: () => {
                  setShowVerifyButton(false);
                  setPendingOrderId(null);
                  if (onError) onError(new Error('Pago no confirmado después de 3 intentos'));
                }
              }
            ]
          );
        } else {
          Alert.alert(
            'Pago Aún No Confirmado',
            'El pago está siendo procesado. Espera unos segundos más e intenta de nuevo.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('❌ Error en verificación manual:', error);
      setLoading(false);
      Alert.alert('Error', 'No se pudo verificar el pago. Intenta de nuevo.');
    }
  };

  // Efecto para detectar cuando la app vuelve al primer plano
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        loading &&
        pendingOrderId
      ) {
        // La app volvió al primer plano mientras esperaba un pago
        console.log('🔄 App volvió al primer plano, verificando estado del pago...');

        // Dar un pequeño delay para asegurar que todo esté estable
        setTimeout(async () => {
          if (loading && pendingOrderId) {
            console.log('🔍 App regresó al primer plano, verificando pago automáticamente...');
            console.log('Order ID pendiente:', pendingOrderId);

            try {
              // Intentar capturar el pago
              console.log('📞 Llamando a capturePayPalPayment...');
              const captureResult = await capturePayPalPayment(pendingOrderId);
              console.log('📦 Resultado de captura:', JSON.stringify(captureResult, null, 2));

              if (captureResult.success) {
                console.log('✅ Pago capturado exitosamente después de regresar a la app');

                cleanupListeners();
                setLoading(false);
                setPendingOrderId(null);
                setShowVerifyButton(false);

                Alert.alert(
                  '¡Pago Exitoso!',
                  `Tu pago de $${amount.toFixed(2)} ${currency} fue procesado correctamente.`,
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
                            orderId: pendingOrderId,
                          });
                        }
                      },
                    },
                  ]
                );
              } else {
                console.log('⚠️ El pago no está aprobado aún');
                console.log('Error de captura:', captureResult.error);

                // Mostrar botón de verificación manual
                setLoading(false);
                setShowVerifyButton(true);

                Alert.alert(
                  'Verificando Pago',
                  '¿Completaste tu pago en PayPal? Si sí, presiona el botón "Verificar Pago" que aparecerá abajo.',
                  [{ text: 'Entendido' }]
                );
              }
            } catch (error) {
              console.error('❌ Error al verificar el pago:', error);
              console.error('Error details:', JSON.stringify(error, null, 2));

              setLoading(false);
              setShowVerifyButton(true);

              Alert.alert(
                'Error de Verificación',
                'No se pudo verificar automáticamente. Usa el botón "Verificar Pago" abajo para intentar de nuevo.',
                [{ text: 'OK' }]
              );
            }
          }
        }, 3000); // 3 segundos de delay para dar tiempo a PayPal
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
      cleanupListeners();
    };
  }, [loading, pendingOrderId]);

  const handlePayPalPayment = async (existingOrderId = null) => {
    console.log('🔵 handlePayPalPayment iniciado');
    console.log('Existing Order ID:', existingOrderId);
    console.log('Amount:', amount);
    console.log('Currency:', currency);

    setLoading(true);
    cleanupListeners();

    try {
      let orderId = existingOrderId;
      let approvalUrl = null;

      // Paso 1: Crear orden en PayPal o usar orden existente
      if (!orderId) {
        console.log('📋 Creando nueva orden de PayPal...');
        console.log('Order details:', JSON.stringify(orderDetails, null, 2));

        const orderResult = await createPayPalOrder(amount, currency, orderDetails);
        console.log('📦 Resultado de createPayPalOrder:', JSON.stringify(orderResult, null, 2));

        if (!orderResult.success) {
          console.error('❌ Fallo al crear orden:', orderResult.error);
          throw new Error(orderResult.error || 'Error al crear la orden');
        }

        orderId = orderResult.orderId;
        approvalUrl = orderResult.approvalUrl;
        console.log('✅ Orden creada exitosamente');
        console.log('Order ID:', orderId);
        console.log('Approval URL:', approvalUrl);

        // Guardar la orden pendiente
        setPendingOrderId(orderId);
        console.log('💾 Orden guardada como pendiente');
      } else {
        console.log('🔄 Reintentando - creando nueva orden...');
        // Crear una nueva orden en lugar de reusar la anterior
        const orderResult = await createPayPalOrder(amount, currency, orderDetails);
        console.log('📦 Resultado de createPayPalOrder (reintento):', JSON.stringify(orderResult, null, 2));

        if (!orderResult.success) {
          console.error('❌ Fallo al crear orden en reintento:', orderResult.error);
          throw new Error(orderResult.error || 'Error al crear la orden');
        }

        orderId = orderResult.orderId;
        approvalUrl = orderResult.approvalUrl;
        console.log('✅ Nueva orden creada:', orderId);
        console.log('Approval URL:', approvalUrl);

        // Actualizar la orden pendiente
        setPendingOrderId(orderId);
        console.log('💾 Orden actualizada como pendiente');
      }

      // Paso 2: Validar que tenemos la URL de aprobación
      if (!approvalUrl) {
        console.error('No se encontró approvalUrl en la respuesta de PayPal');
        throw new Error('No se pudo obtener la URL de aprobación de PayPal');
      }

      console.log('💡 El pago se procesará automáticamente cuando regreses a la app');

      // Configurar timeout de 10 minutos para limpiar el estado (más tiempo para completar pago)
      timeoutRef.current = setTimeout(() => {
        console.log('⏱️ Timeout: El usuario no completó el pago');
        cleanupListeners();
        setLoading(false);

        Alert.alert(
          'Tiempo Agotado',
          'El tiempo para completar el pago ha expirado. ¿Deseas intentar nuevamente?',
          [
            {
              text: 'Cancelar',
              style: 'cancel',
              onPress: () => {
                setPendingOrderId(null);
                if (onCancel) onCancel();
              },
            },
            {
              text: 'Reintentar',
              onPress: () => handlePayPalPayment(),
            },
          ]
        );
      }, 10 * 60 * 1000); // 10 minutos

      // Paso 3: Abrir PayPal directamente
      console.log('🚀 Abriendo PayPal...');
      await openPayPalBrowser(approvalUrl);
      console.log('✅ Navegador abierto, esperando que usuario complete pago y regrese');

    } catch (error) {
      console.error('❌ Error en proceso de pago:', error);
      console.error('Tipo de error:', error.name);
      console.error('Mensaje de error:', error.message);
      console.error('Stack trace:', error.stack);

      cleanupListeners();
      setLoading(false);
      setPendingOrderId(null);

      // Mensaje de error más descriptivo
      let errorMessage = 'Ocurrió un error al procesar el pago. Intenta de nuevo.';

      if (error.message?.includes('URL') || error.message?.includes('navegador')) {
        errorMessage = 'No se pudo abrir el navegador para procesar el pago. Verifica que tu dispositivo tenga un navegador instalado.';
      } else if (error.message?.includes('crear la orden') || error.message?.includes('PayPal')) {
        errorMessage = 'No se pudo conectar con PayPal. Verifica tu conexión a internet e intenta de nuevo.';
      } else if (error.message?.includes('token') || error.message?.includes('credentials')) {
        errorMessage = 'Error de configuración de PayPal. Por favor contacta a soporte.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      console.log('📢 Mostrando alerta de error al usuario:', errorMessage);
      Alert.alert('Error de Pago', errorMessage);

      if (onError) {
        onError(error);
      }
    }
  };

  // Función auxiliar para abrir el navegador con PayPal
  const openPayPalBrowser = async (approvalUrl) => {
    console.log('🌐 openPayPalBrowser iniciado');
    console.log('URL a abrir:', approvalUrl);

    if (!approvalUrl) {
      throw new Error('URL de aprobación no válida');
    }

    try {
      // Intentar verificar si la URL puede abrirse
      console.log('🔍 Verificando si la URL puede abrirse...');
      const supported = await Linking.canOpenURL(approvalUrl);
      console.log('¿URL soportada?:', supported);

      // Intentar abrir de todas formas (canOpenURL puede dar falso negativo en Android)
      console.log('📤 Abriendo navegador con PayPal...');
      await Linking.openURL(approvalUrl);
      console.log('✅ Navegador abierto exitosamente');
    } catch (linkError) {
      console.error('❌ Error al abrir URL (primer intento):', linkError);

      // Intentar abrir de todas formas como fallback
      try {
        console.log('🔄 Reintentando abrir URL sin verificación previa...');
        await Linking.openURL(approvalUrl);
        console.log('✅ Navegador abierto en segundo intento');
      } catch (retryError) {
        console.error('❌ No se pudo abrir el navegador después de reintentar:', retryError);
        console.error('Error details:', JSON.stringify(retryError, null, 2));
        throw new Error('No se pudo abrir el navegador. Verifica que tu dispositivo puede abrir enlaces externos.');
      }
    }
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.paypal_button, (loading && !showVerifyButton) && styles.paypal_button_disabled]}
        onPress={handlePayPalPayment}
        disabled={loading && !showVerifyButton}
        activeOpacity={0.8}
      >
        {(loading && !showVerifyButton) ? (
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

      {showVerifyButton && pendingOrderId && (
        <TouchableOpacity
          style={styles.verify_button}
          onPress={handleManualVerification}
          disabled={loading}
          activeOpacity={0.8}
        >
          <View style={styles.button_content}>
            {loading ? (
              <>
                <ActivityIndicator size="small" color={COLORS.white} />
                <Text style={styles.verify_button_text}>Verificando...</Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color={COLORS.white} />
                <Text style={styles.verify_button_text}>Verificar Pago</Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      )}

      {showVerifyButton && (
        <Text style={styles.help_text}>
          ⓘ Si completaste el pago en PayPal, presiona "Verificar Pago"
        </Text>
      )}
    </View>
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
  verify_button: {
    backgroundColor: '#28a745',
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
  verify_button_text: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  help_text: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
    fontStyle: 'italic',
  },
});

export default PayPalButton;
