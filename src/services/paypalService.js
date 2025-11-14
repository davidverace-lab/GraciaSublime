import axios from 'axios';
import { PAYPAL_CLIENT_ID, PAYPAL_SECRET_KEY, PAYPAL_MODE } from '@env';

/**
 * Servicio de PayPal
 * Maneja la integración con PayPal para procesar pagos
 */

// URLs base según el modo
const BASE_URL = PAYPAL_MODE === 'sandbox'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com';

/**
 * Convertir string a base64 (compatible con React Native)
 */
const toBase64 = (str) => {
  // En React Native no existe Buffer, usamos btoa o una alternativa
  try {
    // Intentar usar btoa si está disponible
    return btoa(str);
  } catch (e) {
    // Si btoa no está disponible, usar alternativa manual
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    let i = 0;

    while (i < str.length) {
      const a = str.charCodeAt(i++);
      const b = i < str.length ? str.charCodeAt(i++) : 0;
      const c = i < str.length ? str.charCodeAt(i++) : 0;

      const bitmap = (a << 16) | (b << 8) | c;

      output += chars.charAt((bitmap >> 18) & 63);
      output += chars.charAt((bitmap >> 12) & 63);
      output += chars.charAt(b ? (bitmap >> 6) & 63 : 64);
      output += chars.charAt(c ? bitmap & 63 : 64);
    }

    return output;
  }
};

/**
 * Obtener token de acceso de PayPal
 */
const getAccessToken = async () => {
  try {
    const auth = toBase64(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET_KEY}`);

    const response = await axios({
      url: `${BASE_URL}/v1/oauth2/token`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`,
      },
      data: 'grant_type=client_credentials',
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Error obteniendo access token de PayPal:', error.response?.data || error.message);
    throw new Error('No se pudo autenticar con PayPal');
  }
};

/**
 * Crear una orden de pago en PayPal
 * @param {number} amount - Monto total a pagar
 * @param {string} currency - Código de moneda (USD, MXN, etc.)
 * @param {object} orderDetails - Detalles del pedido
 */
export const createPayPalOrder = async (amount, currency = 'USD', orderDetails = {}) => {
  try {
    const accessToken = await getAccessToken();

    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: currency,
                value: amount.toFixed(2),
              },
            },
          },
          description: orderDetails.description || 'Compra en Gracia Sublime',
          custom_id: orderDetails.order_id || null,
        },
      ],
      application_context: {
        brand_name: 'Gracia Sublime',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: 'graciasublime://payment-success',
        cancel_url: 'graciasublime://payment-cancel',
      },
    };

    const response = await axios({
      url: `${BASE_URL}/v2/checkout/orders`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      data: orderData,
    });

    return {
      success: true,
      orderId: response.data.id,
      approvalUrl: response.data.links.find(link => link.rel === 'approve')?.href,
      data: response.data,
    };
  } catch (error) {
    console.error('Error creando orden de PayPal:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al crear la orden de PayPal',
    };
  }
};

/**
 * Capturar el pago de una orden aprobada
 * @param {string} orderId - ID de la orden de PayPal
 */
export const capturePayPalPayment = async (orderId) => {
  try {
    const accessToken = await getAccessToken();

    const response = await axios({
      url: `${BASE_URL}/v2/checkout/orders/${orderId}/capture`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const captureData = response.data;

    // Verificar que el pago fue completado
    if (captureData.status === 'COMPLETED') {
      const capture = captureData.purchase_units[0].payments.captures[0];

      return {
        success: true,
        transactionId: capture.id,
        status: capture.status,
        amount: capture.amount.value,
        currency: capture.amount.currency_code,
        payerEmail: captureData.payer?.email_address,
        payerName: `${captureData.payer?.name?.given_name || ''} ${captureData.payer?.name?.surname || ''}`.trim(),
        data: captureData,
      };
    } else {
      return {
        success: false,
        error: `Estado del pago: ${captureData.status}`,
        data: captureData,
      };
    }
  } catch (error) {
    console.error('Error capturando pago de PayPal:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al capturar el pago',
    };
  }
};

/**
 * Verificar el estado de una orden de PayPal
 * @param {string} orderId - ID de la orden de PayPal
 */
export const getPayPalOrderDetails = async (orderId) => {
  try {
    const accessToken = await getAccessToken();

    const response = await axios({
      url: `${BASE_URL}/v2/checkout/orders/${orderId}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Error obteniendo detalles de orden:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al obtener detalles de la orden',
    };
  }
};

/**
 * Reembolsar un pago
 * @param {string} captureId - ID de la captura a reembolsar
 * @param {number} amount - Monto a reembolsar (opcional, si no se especifica se reembolsa todo)
 * @param {string} currency - Código de moneda
 */
export const refundPayPalPayment = async (captureId, amount = null, currency = 'USD') => {
  try {
    const accessToken = await getAccessToken();

    const refundData = amount ? {
      amount: {
        value: amount.toFixed(2),
        currency_code: currency,
      },
    } : {};

    const response = await axios({
      url: `${BASE_URL}/v2/payments/captures/${captureId}/refund`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      data: refundData,
    });

    return {
      success: true,
      refundId: response.data.id,
      status: response.data.status,
      data: response.data,
    };
  } catch (error) {
    console.error('Error procesando reembolso:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Error al procesar el reembolso',
    };
  }
};

/**
 * Validar que las credenciales de PayPal sean correctas
 */
export const validatePayPalCredentials = async () => {
  try {
    const token = await getAccessToken();
    return {
      success: true,
      message: 'Credenciales válidas',
      mode: PAYPAL_MODE,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Credenciales inválidas o error de conexión',
    };
  }
};

export default {
  createPayPalOrder,
  capturePayPalPayment,
  getPayPalOrderDetails,
  refundPayPalPayment,
  validatePayPalCredentials,
};
