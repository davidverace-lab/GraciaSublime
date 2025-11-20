// Configuración de Stripe
// IMPORTANTE: Reemplaza estas claves con tus propias claves de Stripe
// Obtén tus claves en: https://dashboard.stripe.com/apikeys

// Clave publicable de Stripe (Publishable Key)
// Esta clave es segura usar en el cliente
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_TU_CLAVE_PUBLICABLE_AQUI';

// URL de tu Edge Function de Supabase para crear Payment Intents
// Reemplaza [TU-PROJECT-REF] con tu referencia de proyecto de Supabase
// Ejemplo: 'https://abcdefghijklmnop.supabase.co/functions/v1'
// Para desarrollo local: 'http://localhost:54321/functions/v1'
export const STRIPE_BACKEND_URL = 'https://toyyebhfidzhnjtvhhvq.supabase.co/functions/v1';

// Configuración de Stripe
export const STRIPE_CONFIG = {
  merchantName: 'Gracia Sublime',
  merchantIdentifier: 'merchant.com.graciasubli me',
  urlScheme: 'graciasubli me', // Para deep linking
  // Configuración de Apple Pay (opcional)
  applePay: {
    merchantCountryCode: 'US',
    currencyCode: 'USD',
  },
  // Configuración de Google Pay (opcional)
  googlePay: {
    merchantCountryCode: 'US',
    currencyCode: 'USD',
    testEnv: true, // Cambiar a false en producción
  },
};
