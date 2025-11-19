/**
 * Utilidades de validación para formularios
 */

/**
 * Valida que un email tenga el formato correcto
 * Acepta cualquier email válido incluyendo:
 * - Correos personales (Gmail, Outlook, Yahoo, Hotmail, etc.)
 * - Correos institucionales (universidad.edu, empresa.com, etc.)
 * - Correos gubernamentales (.gob, .gov, etc.)
 */
export const validateEmail = (email) => {
        const trimmedEmail = email.trim();

        // Verificar que no esté vacío
        if (!trimmedEmail) {
                return { isValid: false, error: 'El email no puede estar vacío' };
        }

        // Verificar que tenga @
        if (!trimmedEmail.includes('@')) {
                return { isValid: false, error: 'El email debe contener @' };
        }

        // Separar en parte local y dominio
        const parts = trimmedEmail.split('@');

        // Verificar que solo haya un @
        if (parts.length !== 2) {
                return { isValid: false, error: 'El email debe tener exactamente un @' };
        }

        const [localPart, domainPart] = parts;

        // Verificar que tenga algo antes del @
        if (!localPart || localPart.length === 0) {
                return { isValid: false, error: 'El email debe tener texto antes del @' };
        }

        // Verificar longitud mínima de parte local
        if (localPart.length < 1) {
                return { isValid: false, error: 'El email debe tener al menos un caracter antes del @' };
        }

        // Verificar que tenga dominio después del @
        if (!domainPart || domainPart.length === 0) {
                return { isValid: false, error: 'El email debe tener un dominio después del @' };
        }

        // Verificar que el dominio tenga al menos un punto
        if (!domainPart.includes('.')) {
                return { isValid: false, error: 'El dominio debe contener al menos un punto (ej: @gmail.com, @universidad.edu)' };
        }

        // Verificar estructura del dominio
        const domainParts = domainPart.split('.');

        // Debe tener al menos 2 partes (ejemplo.com)
        if (domainParts.length < 2) {
                return { isValid: false, error: 'El dominio no es válido' };
        }

        // Verificar que cada parte del dominio no esté vacía
        for (const part of domainParts) {
                if (!part || part.length === 0) {
                        return { isValid: false, error: 'El dominio no es válido' };
                }
        }

        // La última parte (TLD) debe tener al menos 2 caracteres
        const tld = domainParts[domainParts.length - 1];
        if (tld.length < 2) {
                return { isValid: false, error: 'La extensión del dominio debe tener al menos 2 caracteres' };
        }

        // Validar caracteres permitidos en la parte local (antes del @)
        // Permite letras, números, puntos, guiones, guiones bajos
        const localPartRegex = /^[a-zA-Z0-9._-]+$/;
        if (!localPartRegex.test(localPart)) {
                return { isValid: false, error: 'El email contiene caracteres no permitidos' };
        }

        // Validar caracteres en el dominio
        // Permite letras, números, puntos y guiones
        const domainRegex = /^[a-zA-Z0-9.-]+$/;
        if (!domainRegex.test(domainPart)) {
                return { isValid: false, error: 'El dominio contiene caracteres no permitidos' };
        }

        // Regex completo para email válido (RFC 5322 simplificado)
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(trimmedEmail)) {
                return { isValid: false, error: 'El formato del email no es válido' };
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
