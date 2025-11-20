import React from 'react';
import {
        View,
        Text,
        StyleSheet,
        TouchableOpacity,
        Alert,
        Platform,
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors.js';
import { useAuth } from '../context/AuthContext.js';

const CustomDrawerContent = (props) => {
        const { user, profile, logout, is_admin, view_mode, toggle_view_mode } = useAuth();

        const handle_logout = async () => {
                // En web, usar confirm nativo del navegador
                // En móvil, usar Alert.alert de React Native
                if (Platform.OS === 'web') {
                        const confirmed = window.confirm('¿Estás seguro de que deseas cerrar sesión?');
                        if (confirmed) {
                                await logout();
                                // Navegar directamente a Login y limpiar stack
                                props.navigation.reset({
                                        index: 0,
                                        routes: [{ name: 'Login' }],
                                });
                        }
                } else {
                        Alert.alert(
                                'Cerrar Sesión',
                                '¿Estás seguro de que deseas cerrar sesión?',
                                [
                                        { text: 'Cancelar', style: 'cancel' },
                                        {
                                                text: 'Cerrar Sesión',
                                                style: 'destructive',
                                                onPress: async () => {
                                                        await logout();
                                                        // Navegar directamente a Login y limpiar stack
                                                        props.navigation.reset({
                                                                index: 0,
                                                                routes: [{ name: 'Login' }],
                                                        });
                                                },
                                        },
                                ]
                        );
                }
        };

        const handle_switch_view = () => {
                toggle_view_mode();
                props.navigation.closeDrawer();

                // Navegar a la vista correspondiente
                if (view_mode === 'client') {
                        // Cambiar a vista admin
                        props.navigation.reset({
                                index: 0,
                                routes: [{ name: 'AdminDrawer' }],
                        });
                } else {
                        // Cambiar a vista cliente
                        props.navigation.reset({
                                index: 0,
                                routes: [{ name: 'MainDrawer' }],
                        });
                }
        };

        const menu_items = [
                { icon: 'home-outline', label: 'Inicio', route: 'MainTabs', screen: 'Home' },
                { icon: 'help-circle-outline', label: 'Ayuda', route: 'Help' },
                { icon: 'time-outline', label: 'Historial de Compras', route: 'OrderHistory' },
                { icon: 'person-outline', label: 'Mi Cuenta', route: 'Profile' },
        ];

        const info_items = [
                { icon: 'document-text-outline', label: 'Términos y Condiciones', route: 'Terms' },
                { icon: 'information-circle-outline', label: 'Acerca de', route: 'About' },
                { icon: 'mail-outline', label: 'Contáctanos', route: 'Contact' },
                { icon: 'shield-checkmark-outline', label: 'Privacidad', route: 'Privacy' },
        ];

        return (
                <DrawerContentScrollView {...props} style={styles.container}>
                        {/* Header del drawer con información del usuario */}
                        <View style={styles.header}>
                                <View style={styles.avatar_container}>
                                        <View style={styles.avatar}>
                                                <Ionicons name="person" size={40} color={COLORS.primary} />
                                        </View>
                                        {is_admin && (
                                                <View style={styles.admin_badge}>
                                                        <Ionicons name="shield-checkmark" size={16} color={COLORS.white} />
                                                </View>
                                        )}
                                </View>
                                <Text style={styles.user_name}>{profile?.name || user?.email}</Text>
                                <Text style={styles.user_email}>{user?.email}</Text>
                                {is_admin && (
                                        <View style={styles.admin_tag}>
                                                <Ionicons name="star" size={12} color={COLORS.primary} />
                                                <Text style={styles.admin_tag_text}>Administrador</Text>
                                        </View>
                                )}
                        </View>

                        {/* Botón de cambio de vista (solo para admins) */}
                        {is_admin && (
                                <View style={styles.switch_view_container}>
                                        <TouchableOpacity
                                                style={styles.switch_view_button}
                                                onPress={handle_switch_view}
                                        >
                                                <View style={styles.switch_view_icon_container}>
                                                        <Ionicons
                                                                name={view_mode === 'admin' ? 'person' : 'briefcase'}
                                                                size={22}
                                                                color={COLORS.white}
                                                        />
                                                </View>
                                                <View style={styles.switch_view_content}>
                                                        <Text style={styles.switch_view_title}>
                                                                {view_mode === 'admin' ? 'Ir a Vista Cliente' : 'Ir a Vista Admin'}
                                                        </Text>
                                                        <Text style={styles.switch_view_subtitle}>
                                                                {view_mode === 'admin'
                                                                        ? 'Ver la tienda como cliente'
                                                                        : 'Administrar productos y pedidos'}
                                                        </Text>
                                                </View>
                                                <Ionicons name="swap-horizontal" size={24} color={COLORS.white} />
                                        </TouchableOpacity>
                                </View>
                        )}

                        {/* Menú principal */}
                        <View style={styles.menu_container}>
                                <Text style={styles.section_title}>MENÚ</Text>
                                {menu_items.map((item, index) => (
                                        <TouchableOpacity
                                                key={index}
                                                style={styles.menu_item}
                                                onPress={() => {
                                                        if (item.screen) {
                                                                props.navigation.navigate(item.route, { screen: item.screen });
                                                        } else {
                                                                props.navigation.navigate(item.route);
                                                        }
                                                        props.navigation.closeDrawer();
                                                }}
                                        >
                                                <View style={styles.menu_icon_container}>
                                                        <Ionicons name={item.icon} size={22} color={COLORS.primary} />
                                                </View>
                                                <Text style={styles.menu_text}>{item.label}</Text>
                                                <Ionicons name="chevron-forward" size={18} color="#ccc" />
                                        </TouchableOpacity>
                                ))}

                                <TouchableOpacity style={styles.menu_item} onPress={handle_logout}>
                                        <View style={[styles.menu_icon_container, styles.logout_icon]}>
                                                <Ionicons name="log-out-outline" size={22} color="#E03C3C" />
                                        </View>
                                        <Text style={[styles.menu_text, styles.logout_text]}>Cerrar Sesión</Text>
                                        <Ionicons name="chevron-forward" size={18} color="#ccc" />
                                </TouchableOpacity>
                        </View>

                        {/* Divider */}
                        <View style={styles.big_divider} />

                        {/* Información */}
                        <View style={styles.info_container}>
                                <Text style={styles.section_title}>INFORMACIÓN</Text>
                                {info_items.map((item, index) => (
                                        <TouchableOpacity
                                                key={index}
                                                style={styles.info_item}
                                                onPress={() => {
                                                        props.navigation.navigate(item.route);
                                                        props.navigation.closeDrawer();
                                                }}
                                        >
                                                <Ionicons name={item.icon} size={20} color="#666" style={styles.info_icon} />
                                                <Text style={styles.info_text}>{item.label}</Text>
                                        </TouchableOpacity>
                                ))}
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                                <Text style={styles.footer_text}>Gracia Sublime</Text>
                                <Text style={styles.footer_version}>Versión 1.0.0</Text>
                        </View>
                </DrawerContentScrollView>
        );
};

const styles = StyleSheet.create({
        container: {
                flex: 1,
                backgroundColor: COLORS.white,
        },
        header: {
                backgroundColor: COLORS.primaryLight,
                padding: 25,
                paddingTop: 50,
                alignItems: 'center',
                borderBottomWidth: 1,
                borderBottomColor: COLORS.inputGray,
        },
        avatar_container: {
                marginBottom: 15,
        },
        avatar: {
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: COLORS.white,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 3,
                borderColor: COLORS.primary,
                ...(Platform.OS === 'web'
                        ? { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' }
                        : {
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: 4,
                        }
                ),
        },
        user_name: {
                fontSize: 20,
                fontWeight: 'bold',
                color: COLORS.textDark,
                marginBottom: 5,
        },
        user_email: {
                fontSize: 14,
                color: '#666',
        },
        menu_container: {
                paddingVertical: 15,
        },
        section_title: {
                fontSize: 12,
                fontWeight: '700',
                color: '#999',
                paddingHorizontal: 20,
                marginBottom: 10,
                marginTop: 5,
        },
        menu_item: {
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 14,
                paddingHorizontal: 20,
                backgroundColor: COLORS.white,
        },
        menu_icon_container: {
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: COLORS.primaryLight,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
        },
        logout_icon: {
                backgroundColor: '#FFE5E5',
        },
        menu_text: {
                flex: 1,
                fontSize: 15,
                fontWeight: '600',
                color: COLORS.textDark,
        },
        logout_text: {
                color: '#E03C3C',
        },
        big_divider: {
                height: 8,
                backgroundColor: '#f5f5f5',
                marginVertical: 10,
        },
        info_container: {
                paddingVertical: 15,
        },
        info_item: {
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 20,
        },
        info_icon: {
                marginRight: 12,
                width: 24,
        },
        info_text: {
                flex: 1,
                fontSize: 14,
                color: '#666',
        },
        footer: {
                padding: 20,
                alignItems: 'center',
                marginTop: 10,
                marginBottom: 20,
        },
        footer_text: {
                fontSize: 15,
                fontWeight: 'bold',
                color: COLORS.textDark,
                marginBottom: 5,
        },
        footer_version: {
                fontSize: 12,
                color: '#999',
        },
        admin_badge: {
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: COLORS.primary,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 3,
                borderColor: COLORS.white,
        },
        admin_tag: {
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.primaryLight,
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 12,
                marginTop: 8,
                gap: 4,
        },
        admin_tag_text: {
                fontSize: 12,
                fontWeight: '600',
                color: COLORS.primary,
        },
        switch_view_container: {
                paddingHorizontal: 20,
                paddingVertical: 15,
        },
        switch_view_button: {
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.primary,
                borderRadius: 15,
                padding: 15,
                ...(Platform.OS === 'web'
                        ? { boxShadow: `0px 4px 8px ${COLORS.primary}4D` }
                        : {
                                shadowColor: COLORS.primary,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 8,
                        }
                ),
        },
        switch_view_icon_container: {
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: 'rgba(255,255,255,0.2)',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
        },
        switch_view_content: {
                flex: 1,
        },
        switch_view_title: {
                fontSize: 15,
                fontWeight: 'bold',
                color: COLORS.white,
                marginBottom: 2,
        },
        switch_view_subtitle: {
                fontSize: 11,
                color: 'rgba(255,255,255,0.85)',
        },
});

export default CustomDrawerContent;
