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
    console.log('🔐 Obteniendo access token de PayPal...');
    console.log('Client ID presente:', !!PAYPAL_CLIENT_ID);
    console.log('Secret Key presente:', !!PAYPAL_SECRET_KEY);
    console.log('Modo PayPal:', PAYPAL_MODE);
    console.log('Base URL:', BASE_URL);

    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET_KEY) {
      throw new Error('Credenciales de PayPal no configuradas. Verifica el archivo .env');
    }

    const auth = toBase64(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET_KEY}`);
    console.log('Auth string generado (length):', auth.length);

    const response = await axios({
      url: `${BASE_URL}/v1/oauth2/token`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`,
      },
      data: 'grant_type=client_credentials',
      timeout: 10000, // 10 segundos de timeout
    });

    console.log('✅ Access token obtenido exitosamente');
    return response.data.access_token;
  } catch (error) {
    console.error('❌ Error obteniendo access token de PayPal:');
    console.error('Error message:', error.message);
    console.error('Response status:', error.response?.status);
    console.error('Response data:', JSON.stringify(error.response?.data, null, 2));

    if (error.response?.status === 401) {
      throw new Error('Credenciales de PayPal inválidas. Verifica tu CLIENT_ID y SECRET_KEY.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Tiempo de espera agotado al conectar con PayPal. Verifica tu conexión a internet.');
    } else if (!error.response) {
      throw new Error('No se pudo conectar con PayPal. Verifica tu conexión a internet.');
    }

    throw new Error('No se pudo autenticar con PayPal: ' + (error.response?.data?.error_description || error.message));
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
    console.log('🔵 Iniciando creación de orden en PayPal...');
    console.log('Monto:', amount);
    console.log('Moneda:', currency);
    console.log('Detalles:', orderDetails);

    const accessToken = await getAccessToken();
    console.log('✅ Access token obtenido');

    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: orderDetails.order_id || `REF_${Date.now()}`,
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
          description: orderDetails.description || 'Compra en Gracia Sublime',
          custom_id: orderDetails.order_id || null,
        },
      ],
      application_context: {
        brand_name: 'Gracia Sublime',
        locale: 'es-MX',
        landing_page: 'LOGIN',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'CONTINUE',
        // IMPORTANTE: No especificar return_url ni cancel_url
        // Esto hará que PayPal muestre su página de confirmación estándar
        // El usuario deberá cerrar el navegador y nuestra app detectará el retorno
      },
    };

    console.log('📋 Order Data:', JSON.stringify(orderData, null, 2));

    console.log('📤 Enviando orden a PayPal...');
    console.log('URL:', `${BASE_URL}/v2/checkout/orders`);

    const response = await axios({
      url: `${BASE_URL}/v2/checkout/orders`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      data: orderData,
    });

    console.log('✅ Respuesta de PayPal recibida');
    console.log('Order ID:', response.data.id);
    console.log('Order Status:', response.data.status);
    console.log('Order Response completo:', JSON.stringify(response.data, null, 2));

    // Buscar el link de aprobación
    const approvalLink = response.data.links.find(link => link.rel === 'approve');
    console.log('Approval link encontrado:', approvalLink);

    // Verificar si la orden fue creada correctamente
    if (response.data.status !== 'CREATED') {
      console.warn('⚠️ La orden no tiene status CREATED:', response.data.status);
    }

    if (!approvalLink || !approvalLink.href) {
      console.error('❌ No se encontró approval URL en la respuesta de PayPal');
      console.error('Links recibidos:', JSON.stringify(response.data.links, null, 2));
      return {
        success: false,
        error: 'PayPal no devolvió una URL de aprobación válida',
      };
    }

    console.log('✅ Approval URL:', approvalLink.href);

    return {
      success: true,
      orderId: response.data.id,
      approvalUrl: approvalLink.href,
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
