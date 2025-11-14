/**
 * Utilidades de validación para formularios
 */

/**
 * Valida que un email tenga el formato correcto
 * Requisitos: debe tener @, punto después del @, y terminar en .com
 */
export const validateEmail = (email) => {
        const trimmedEmail = email.trim();

        // Verificar que tenga @
        if (!trimmedEmail.includes('@')) {
                return { isValid: false, error: 'El email debe contener @' };
        }

        // Verificar que tenga algo antes del @
        const [localPart, domainPart] = trimmedEmail.split('@');
        if (!localPart || localPart.length === 0) {
                return { isValid: false, error: 'El email debe tener texto antes del @' };
        }

        // Verificar que tenga dominio después del @
        if (!domainPart || domainPart.length === 0) {
                return { isValid: false, error: 'El email debe tener un dominio después del @' };
        }

        // Verificar que el dominio tenga un punto
        if (!domainPart.includes('.')) {
                return { isValid: false, error: 'El email debe tener un punto en el dominio (ej: @gmail.com)' };
        }

        // Verificar que termine en .com
        if (!trimmedEmail.toLowerCase().endsWith('.com')) {
                return { isValid: false, error: 'El email debe terminar en .com' };
        }

        // Validación adicional: verificar que haya algo después del punto
        const domainParts = domainPart.split('.');
        const lastPart = domainParts[domainParts.length - 1];
        if (lastPart.length < 2) {
                return { isValid: false, error: 'El dominio del email no es válido' };
        }

        return { isValid: true, error: null };
};

/**
 * Valida que un teléfono tenga exactamente 10 dígitos
 */
export const validatePhone = (phone) => {
        const trimmedPhone = phone.trim();

        // Verificar que solo contenga números
        if (!/^\d+$/.test(trimmedPhone)) {
                return { isValid: false, error: 'El teléfono solo debe contener números' };
        }

        // Verificar que tenga exactamente 10 dígitos
        if (trimmedPhone.length !== 10) {
                return { isValid: false, error: 'El teléfono debe tener exactamente 10 dígitos' };
        }

        return { isValid: true, error: null };
};

/**
 * Valida que una contraseña cumpla con los requisitos mínimos
 * - Mínimo 6 caracteres
 * - Acepta todos los símbolos
 */
export const validatePassword = (password) => {
        // Verificar longitud mínima
        if (password.length < 6) {
                return { isValid: false, error: 'La contraseña debe tener al menos 6 caracteres' };
        }

        // Verificar que no esté vacía o solo espacios
        if (password.trim().length === 0) {
                return { isValid: false, error: 'La contraseña no puede estar vacía' };
        }

        return { isValid: true, error: null };
};

/**
 * Valida que un nombre no esté vacío
 */
export const validateName = (name) => {
        const trimmedName = name.trim();

        if (trimmedName.length === 0) {
                return { isValid: false, error: 'El nombre no puede estar vacío' };
        }

        if (trimmedName.length < 2) {
                return { isValid: false, error: 'El nombre debe tener al menos 2 caracteres' };
        }

        return { isValid: true, error: null };
};

/**
 * Valida que dos contraseñas coincidan
 */
export const validatePasswordMatch = (password, confirmPassword) => {
        if (password !== confirmPassword) {
                return { isValid: false, error: 'Las contraseñas no coinciden' };
        }

        return { isValid: true, error: null };
};
