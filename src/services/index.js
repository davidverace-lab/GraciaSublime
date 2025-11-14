/**
 * Índice de servicios de Supabase
 * Exporta todos los servicios para facilitar la importación
 */

// Exportar configuración de Supabase
export { supabase } from '../config/supabase';

// Exportar servicios de autenticación
export * from './authService';

// Exportar servicios de productos
export * from './productsService';

// Exportar servicios de categorías
export * from './categoriesService';

// Exportar servicios de carrito
export * from './cartService';

// Exportar servicios de favoritos
export * from './favoritesService';

// Exportar servicios de pedidos
export * from './ordersService';

// Exportar servicios de direcciones
export * from './addressesService';

// Exportar servicios de notificaciones
export * from './notificationsService';

// Exportar servicios de pagos
export * from './paymentsService';
