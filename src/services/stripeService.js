import axios from 'axios';
import { STRIPE_BACKEND_URL } from '../config/stripe';

/**
 * Servicio de Stripe
 * Maneja la integración con Stripe para procesar pagos
 *
 * IMPORTANTE: Para que Stripe funcione correctamente necesitas:
 * 1. Un servidor backend que cree Payment Intents (por seguridad)
 * 2. Configurar las claves de Stripe en el archivo de configuración
 * 3. Inicializar el StripeProvider en tu App.js
 */

/**
 * Crear un Payment Intent en el servidor backend
 * @param {number} amount - Monto en centavos (ej: 1000 = $10.00)
 * @param {string} currency - Código de moneda (usd, mxn, etc.)
 * @param {object} orderDetails - Detalles del pedido
 * @returns {Promise<object>} - Payment Intent con client_secret
 */
export const createPaymentIntent = async (amount, currency = 'usd', orderDetails = {}) => {
  try {
    console.log('🔵 Iniciando creación de Payment Intent en Stripe...');
    console.log('Monto (en centavos):', amount);
    console.log('Moneda:', currency);
    console.log('Detalles:', orderDetails);

    // Convertir el monto a centavos si no lo está
    const amountInCents = Math.round(amount * 100);

    const response = await axios({
      url: `${STRIPE_BACKEND_URL}/create-payment-intent`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        amount: amount, // Enviar en dólares, la Edge Function convierte a centavos
        currency: currency.toLowerCase(),
        metadata: {
          order_id: orderDetails.order_id || `ORDER_${Date.now()}`,
          description: orderDetails.description || 'Compra en Gracia Sublime',
          customer_email: orderDetails.customer_email,
          customer_name: orderDetails.customer_name,
        },
      },
      timeout: 10000, // 10 segundos de timeout
    });

    console.log('✅ Payment Intent creado exitosamente');
    console.log('Payment Intent ID:', response.data.paymentIntentId);

    return {
      success: true,
      paymentIntentId: response.data.paymentIntentId,
      clientSecret: response.data.clientSecret,
      amount: response.data.amount,
      currency: response.data.currency,
    };
  } catch (error) {
    console.error('❌ Error creando Payment Intent de Stripe:');
    console.error('Error message:', error.message);
    console.error('Response status:', error.response?.status);
    console.error('Response data:', JSON.stringify(error.response?.data, null, 2));

    if (error.code === 'ECONNREFUSED') {
      throw new Error('No se pudo conectar con el servidor. Asegúrate de que tu backend esté ejecutándose.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Tiempo de espera agotado al conectar con el servidor. Verifica tu conexión a internet.');
    } else if (!error.response) {
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet y que el backend esté activo.');
    }

    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Error al crear Payment Intent',
    };
  }
};

/**
 * Confirmar un pago con tarjeta
 * Esta función se usa después de que el usuario ingresa sus datos de tarjeta
 * @param {string} paymentIntentId - ID del Payment Intent
 * @returns {Promise<object>} - Resultado de la confirmación
 */
export const confirmPayment = async (paymentIntentId) => {
  try {
    console.log('🔵 Confirmando Payment Intent:', paymentIntentId);

    const response = await axios({
      url: `${STRIPE_BACKEND_URL}/confirm-payment`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        paymentIntentId,
      },
    });

    console.log('✅ Pago confirmado exitosamente');

    return {
      success: true,
      status: response.data.status,
      transactionId: response.data.paymentIntentId,
      data: response.data,
    };
  } catch (error) {
    console.error('❌ Error confirmando pago:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || 'Error al confirmar el pago',
    };
  }
};

/**
 * Obtener detalles de un Payment Intent
 * @param {string} paymentIntentId - ID del Payment Intent
 * @returns {Promise<object>} - Detalles del Payment Intent
 */
export const getPaymentIntentDetails = async (paymentIntentId) => {
  try {
    console.log('🔍 Obteniendo detalles del Payment Intent:', paymentIntentId);

    const response = await axios({
      url: `${STRIPE_BACKEND_URL}/payment-intent/${paymentIntentId}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Detalles obtenidos:', response.data.status);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('❌ Error obteniendo detalles del pago:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || 'Error al obtener detalles del pago',
    };
  }
};

/**
 * Crear un reembolso para un pago
 * @param {string} paymentIntentId - ID del Payment Intent a reembolsar
 * @param {number} amount - Monto a reembolsar en centavos (opcional, si no se especifica se reembolsa todo)
 * @returns {Promise<object>} - Resultado del reembolso
 */
export const refundPayment = async (paymentIntentId, amount = null) => {
  try {
    console.log('🔄 Procesando reembolso para:', paymentIntentId);

    const response = await axios({
      url: `${STRIPE_BACKEND_URL}/refund-payment`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        paymentIntentId,
        amount: amount ? Math.round(amount * 100) : null,
      },
    });

    console.log('✅ Reembolso procesado exitosamente');

    return {
      success: true,
      refundId: response.data.refundId,
      status: response.data.status,
      amount: response.data.amount,
      data: response.data,
    };
  } catch (error) {
    console.error('❌ Error procesando reembolso:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || 'Error al procesar el reembolso',
    };
  }
};

/**
 * Validar que el servidor backend de Stripe esté activo y configurado
 * @returns {Promise<object>} - Resultado de la validación
 */
export const validateStripeConnection = async () => {
  try {
    console.log('🔐 Validando conexión con servidor de Stripe...');

    const response = await axios({
      url: `${STRIPE_BACKEND_URL}/health`,
      method: 'GET',
      timeout: 5000,
    });

    console.log('✅ Servidor de Stripe conectado correctamente');

    return {
      success: true,
      message: 'Conexión exitosa con el servidor de Stripe',
      data: response.data,
    };
  } catch (error) {
    console.error('❌ Error conectando con servidor de Stripe:', error.message);
    return {
      success: false,
      error: 'No se pudo conectar con el servidor de Stripe. Verifica que esté ejecutándose.',
    };
  }
};

/**
 * Convertir monto de dólares a centavos
 * @param {number} dollars - Monto en dólares
 * @returns {number} - Monto en centavos
 */
export const dollarsToCents = (dollars) => {
  return Math.round(dollars * 100);
};

/**
 * Convertir monto de centavos a dólares
 * @param {number} cents - Monto en centavos
 * @returns {number} - Monto en dólares
 */
export const centsToDollars = (cents) => {
  return (cents / 100).toFixed(2);
};

export default {
  createPaymentIntent,
  confirmPayment,
  getPaymentIntentDetails,
  refundPayment,
  validateStripeConnection,
  dollarsToCents,
  centsToDollars,
};
