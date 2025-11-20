import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { STRIPE_PUBLISHABLE_KEY } from './src/config/stripe.js';

// Providers
import { AuthProvider } from './src/context/AuthContext.js';
import { ProductsProvider } from './src/context/ProductsContext.js';
import { CategoriesProvider } from './src/context/CategoriesContext.js';
import { CartProvider } from './src/context/CartContext.js';
import { FavoritesProvider } from './src/context/FavoritesContext.js';
import { OrdersProvider } from './src/context/OrdersContext.js';
import { NotificationsProvider } from './src/context/NotificationsContext.js';
import { AddressesProvider } from './src/context/AddressesContext.js';
import { AdminProvider } from './src/context/AdminContext.js';
import { LocationProvider } from './src/context/LocationContext.js';
import { CouponsProvider } from './src/context/CouponsContext.js';
import { LoyaltyProvider } from './src/context/LoyaltyContext.js';

// Navegación
import AppNavigator from './src/navigation/AppNavigator.js';

export default function App() {
        return (
                <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
                        {/* ⚠️ IMPORTANTE: AuthProvider DEBE ser el primero porque los demás dependen de él */}
                        <AuthProvider>
                        {/* Productos y Categorías (no dependen de autenticación) */}
                        <ProductsProvider>
                                <CategoriesProvider>
                                        {/* Contextos que dependen de autenticación */}
                                        <CartProvider>
                                                <FavoritesProvider>
                                                        <OrdersProvider>
                                                                <NotificationsProvider>
                                                                        <AddressesProvider>
                                                                                {/* Otros contextos */}
                                                                                <AdminProvider>
                                                                                        <LocationProvider>
                                                                                                <LoyaltyProvider>
                                                                                                        <CouponsProvider>
                                                                                                                <NavigationContainer>
                                                                                                                        <StatusBar style="auto" />
                                                                                                                        <AppNavigator />
                                                                                                                </NavigationContainer>
                                                                                                        </CouponsProvider>
                                                                                                </LoyaltyProvider>
                                                                                        </LocationProvider>
                                                                                </AdminProvider>
                                                                        </AddressesProvider>
                                                                </NotificationsProvider>
                                                        </OrdersProvider>
                                                </FavoritesProvider>
                                        </CartProvider>
                                </CategoriesProvider>
                        </ProductsProvider>
                        </AuthProvider>
                </StripeProvider>
        );
}
