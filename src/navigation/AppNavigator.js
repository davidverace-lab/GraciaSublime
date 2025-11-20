import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors.js';

// Screens
import SplashScreen from '../screens/SplashScreen.js';
import LoginScreen from '../screens/LoginScreen.js';
import RegisterScreen from '../screens/RegisterScreen.js';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen.js';
import VerifyCodeScreen from '../screens/VerifyCodeScreen.js';
import ResetPasswordScreen from '../screens/ResetPasswordScreen.js';
import HomeScreen from '../screens/HomeScreen.js';
import CategoriesScreen from '../screens/CategoriesScreen.js';
import ProductDetailScreen from '../screens/ProductDetailScreen.js';
import CartScreen from '../screens/CartScreen.js';
import FavoritesScreen from '../screens/FavoritesScreen.js';
import ProfileScreen from '../screens/ProfileScreen.js';
import ContactScreen from '../screens/ContactScreen.js';
import NotificationsScreen from '../screens/NotificationsScreen.js';
import HelpScreen from '../screens/HelpScreen.js';
import OrderHistoryScreen from '../screens/OrderHistoryScreen.js';
import TermsScreen from '../screens/TermsScreen.js';
import AboutScreen from '../screens/AboutScreen.js';
import PrivacyScreen from '../screens/PrivacyScreen.js';
import CheckoutAddressScreen from '../screens/CheckoutAddressScreen.js';
import CheckoutPaymentScreen from '../screens/CheckoutPaymentScreen.js';
import CheckoutConfirmationScreen from '../screens/CheckoutConfirmationScreen.js';
import OrderSuccessScreen from '../screens/OrderSuccessScreen.js';
import BankTransferScreen from '../screens/BankTransferScreen.js';
import TransferPendingScreen from '../screens/TransferPendingScreen.js';
import PredesignedTemplatesScreen from '../screens/PredesignedTemplatesScreen.js';
import WriteReviewScreen from '../screens/WriteReviewScreen.js';

// Admin Screens
import AdminLoginScreen from '../screens/AdminLoginScreen.js';
import AdminDashboardScreen from '../screens/AdminDashboardScreen.js';
import AdminProductsScreen from '../screens/AdminProductsScreen.js';
import AdminProductFormScreen from '../screens/AdminProductFormScreen.js';
import AdminOrdersScreen from '../screens/AdminOrdersScreen.js';
import AdminCategoriesScreen from '../screens/AdminCategoriesScreen.js';
import AdminUsersScreen from '../screens/AdminUsersScreen.js';
import AdminTemplatesScreen from '../screens/AdminTemplatesScreen.js';

// Custom Components
import CustomDrawerContent from '../components/CustomDrawerContent.js';
import CustomAdminDrawerContent from '../components/CustomAdminDrawerContent.js';
import CustomTabBar from '../components/CustomTabBar.js';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Navegación de tabs (4 tabs: Inicio, Categorías, Favoritos, Carrito)
const MainTabs = () => {
    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Inicio',
                }}
            />
            <Tab.Screen
                name="Categories"
                component={CategoriesScreen}
                options={{
                    tabBarLabel: 'Categorías',
                }}
            />
            <Tab.Screen
                name="Favorites"
                component={FavoritesScreen}
                options={{ tabBarLabel: 'Favoritos' }}
            />
            <Tab.Screen
                name="Templates"
                component={PredesignedTemplatesScreen}
                options={{ tabBarLabel: 'Diseños' }}
            />
            <Tab.Screen
                name="Cart"
                component={CartScreen}
                options={{ tabBarLabel: 'Carrito' }}
            />
        </Tab.Navigator>
    );
};

// Navegación de tabs para Admin
const AdminTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: '#999',
                tabBarStyle: {
                    backgroundColor: COLORS.white,
                    borderTopWidth: 1,
                    borderTopColor: '#e0e0e0',
                    height: 65,
                    paddingBottom: 5,
                    paddingTop: 5,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'AdminDashboard') {
                        iconName = focused ? 'stats-chart' : 'stats-chart-outline';
                    } else if (route.name === 'AdminProducts') {
                        iconName = focused ? 'cube' : 'cube-outline';
                    } else if (route.name === 'AdminOrders') {
                        iconName = focused ? 'receipt' : 'receipt-outline';
                    } else if (route.name === 'AdminCategories') {
                        iconName = focused ? 'grid' : 'grid-outline';
                    } else if (route.name === 'AdminTemplates') {
                        iconName = focused ? 'brush' : 'brush-outline';
                    } else if (route.name === 'AdminUsers') {
                        iconName = focused ? 'people' : 'people-outline';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen
                name="AdminDashboard"
                component={AdminDashboardScreen}
                options={{ tabBarLabel: 'Dashboard' }}
            />
            <Tab.Screen
                name="AdminProducts"
                component={AdminProductsScreen}
                options={{ tabBarLabel: 'Productos' }}
            />
            <Tab.Screen
                name="AdminOrders"
                component={AdminOrdersScreen}
                options={{ tabBarLabel: 'Pedidos' }}
            />
            <Tab.Screen
                name="AdminCategories"
                component={AdminCategoriesScreen}
                options={{ tabBarLabel: 'Categorías' }}
            />
            <Tab.Screen
                name="AdminTemplates"
                component={AdminTemplatesScreen}
                options={{ tabBarLabel: 'Diseños' }}
            />
            <Tab.Screen
                name="AdminUsers"
                component={AdminUsersScreen}
                options={{ tabBarLabel: 'Usuarios' }}
            />
        </Tab.Navigator>
    );
};

// Drawer para Admin
const AdminDrawer = () => {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomAdminDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                drawerStyle: {
                    width: 290,
                },
            }}
        >
            <Drawer.Screen name="AdminTabs" component={AdminTabs} options={{ drawerLabel: () => null }} />
        </Drawer.Navigator>
    );
};

// Navegación del Drawer
const MainDrawer = () => {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                drawerStyle: {
                    width: 290,
                },
            }}
        >
            <Drawer.Screen name="MainTabs" component={MainTabs} options={{ drawerLabel: () => null }} />
            <Drawer.Screen name="Profile" component={ProfileScreen} options={{ drawerLabel: () => null }} />
            <Drawer.Screen name="Contact" component={ContactScreen} options={{ drawerLabel: () => null }} />
            <Drawer.Screen name="Help" component={HelpScreen} options={{ drawerLabel: () => null }} />
            <Drawer.Screen name="OrderHistory" component={OrderHistoryScreen} options={{ drawerLabel: () => null }} />
            <Drawer.Screen name="Terms" component={TermsScreen} options={{ drawerLabel: () => null }} />
            <Drawer.Screen name="About" component={AboutScreen} options={{ drawerLabel: () => null }} />
            <Drawer.Screen name="Privacy" component={PrivacyScreen} options={{ drawerLabel: () => null }} />
        </Drawer.Navigator>
    );
};

// Navegación principal
const AppNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
                headerShown: false,
                animation: 'default',
                customAnimationOnGesture: true,
                gestureEnabled: true,
                gestureDirection: 'horizontal',
            }}
        >
            <Stack.Screen
                name="Splash"
                component={SplashScreen}
                options={{
                    animation: 'fade',
                }}
            />
            <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{
                    animation: 'slide_from_bottom',
                }}
            />
            <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options={{
                    animation: 'slide_from_bottom',
                }}
            />
            <Stack.Screen
                name="ForgotPassword"
                component={ForgotPasswordScreen}
                options={{
                    animation: 'slide_from_right',
                }}
            />
            <Stack.Screen
                name="VerifyCode"
                component={VerifyCodeScreen}
                options={{
                    animation: 'slide_from_right',
                }}
            />
            <Stack.Screen
                name="ResetPassword"
                component={ResetPasswordScreen}
                options={{
                    animation: 'slide_from_right',
                }}
            />
            <Stack.Screen
                name="MainDrawer"
                component={MainDrawer}
                options={{
                    animation: 'fade',
                    gestureEnabled: false,
                }}
            />
            <Stack.Screen
                name="ProductDetail"
                component={ProductDetailScreen}
                options={{
                    presentation: 'card',
                    animation: 'slide_from_right',
                    animationDuration: 300,
                }}
            />
            <Stack.Screen
                name="Notifications"
                component={NotificationsScreen}
                options={{
                    presentation: 'card',
                    animation: 'slide_from_right',
                    animationDuration: 300,
                }}
            />
            <Stack.Screen
                name="CheckoutAddress"
                component={CheckoutAddressScreen}
                options={{
                    presentation: 'card',
                    animation: 'slide_from_right',
                    animationDuration: 350,
                }}
            />
            <Stack.Screen
                name="CheckoutPayment"
                component={CheckoutPaymentScreen}
                options={{
                    presentation: 'card',
                    animation: 'slide_from_right',
                    animationDuration: 350,
                }}
            />
            <Stack.Screen
                name="CheckoutConfirmation"
                component={CheckoutConfirmationScreen}
                options={{
                    presentation: 'card',
                    animation: 'slide_from_right',
                    animationDuration: 350,
                }}
            />
            <Stack.Screen
                name="BankTransferScreen"
                component={BankTransferScreen}
                options={{
                    presentation: 'card',
                    animation: 'slide_from_right',
                    animationDuration: 350,
                }}
            />
            <Stack.Screen
                name="TransferPendingScreen"
                component={TransferPendingScreen}
                options={{
                    presentation: 'transparentModal',
                    animation: 'fade_from_bottom',
                    animationDuration: 400,
                }}
            />
            <Stack.Screen
                name="OrderSuccess"
                component={OrderSuccessScreen}
                options={{
                    presentation: 'transparentModal',
                    animation: 'fade_from_bottom',
                    animationDuration: 400,
                }}
            />
            <Stack.Screen
                name="PredesignedTemplates"
                component={PredesignedTemplatesScreen}
                options={{
                    presentation: 'card',
                    animation: 'slide_from_right',
                    animationDuration: 300,
                }}
            />
            <Stack.Screen
                name="WriteReview"
                component={WriteReviewScreen}
                options={{
                    presentation: 'card',
                    animation: 'slide_from_right',
                    animationDuration: 300,
                }}
            />
            {/* Admin Screens */}
            <Stack.Screen
                name="AdminLogin"
                component={AdminLoginScreen}
                options={{
                    animation: 'slide_from_bottom',
                }}
            />
            <Stack.Screen
                name="AdminDrawer"
                component={AdminDrawer}
                options={{
                    animation: 'fade',
                    gestureEnabled: false,
                }}
            />
            <Stack.Screen
                name="AdminProductForm"
                component={AdminProductFormScreen}
                options={{
                    presentation: 'card',
                    animation: 'slide_from_right',
                }}
            />
        </Stack.Navigator>
    );
};

export default AppNavigator;
