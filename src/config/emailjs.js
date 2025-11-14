/**
 * Configuración de EmailJS
 *
 * Para obtener estas credenciales:
 * 1. Ve a https://www.emailjs.com/
 * 2. Crea una cuenta gratis
 * 3. Conecta tu Gmail en "Email Services"
 * 4. Crea una plantilla en "Email Templates"
 * 5. Obtén tu Public Key en "Account" > "General"
 *
 * IMPORTANTE: Reemplaza los valores xxx con tus credenciales reales
 */

export const EMAILJS_CONFIG = {
  // Service ID de EmailJS
  serviceId: 'service_1cqkwt9',

  // Template ID de EmailJS
  templateId: 'template_w64swso',

  // Public Key de EmailJS
  publicKey: '0GEWU_olXFLxsXNG5',

  // Private Key de EmailJS (requerido para modo estricto)
  // Obténla en: https://dashboard.emailjs.com/ > Account > Security
  privateKey: '36Mxyc8Foc6eaMIKdmhCP', // ⚠️ REEMPLAZA ESTO

  // Configuración adicional
  enabled: true, // Cambiar a false para desactivar emails temporalmente
};

// Validar configuración
export const isEmailConfigured = () => {
  const { serviceId, templateId, publicKey, privateKey } = EMAILJS_CONFIG;

  if (serviceId === 'service_xxxxxxx' ||
      templateId === 'template_xxxxxxx' ||
      publicKey === 'xxxxxxxxxxxxxxx' ||
      !privateKey ||
      privateKey === 'TU_PRIVATE_KEY_AQUI') {
    console.warn('⚠️ EmailJS no está configurado completamente. Por favor actualiza src/config/emailjs.js');
    return false;
  }

  return true;
};
