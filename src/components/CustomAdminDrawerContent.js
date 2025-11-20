import React from 'react';
import {
        View,
        Text,
        StyleSheet,
        TouchableOpacity,
        Alert,
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors.js';
import { useAuth } from '../context/AuthContext.js';

const CustomAdminDrawerContent = (props) => {
        const { user, profile, logout, view_mode, toggle_view_mode } = useAuth();

        const handle_logout = () => {
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
        };

        const handle_switch_to_client = () => {
                toggle_view_mode();
                props.navigation.reset({
                        index: 0,
                        routes: [{ name: 'MainDrawer' }],
                });
        };

        return (
                <DrawerContentScrollView {...props} style={styles.container}>
                        {/* Header del drawer con información del usuario */}
                        <View style={styles.header}>
                                <View style={styles.avatar_container}>
                                        <View style={styles.avatar}>
                                                <Ionicons name="briefcase" size={40} color={COLORS.white} />
                                        </View>
                                </View>
                                <Text style={styles.user_name}>{profile?.name || 'Administrador'}</Text>
                                <Text style={styles.user_email}>{user?.email}</Text>
                                <View style={styles.admin_tag}>
                                        <Ionicons name="shield-checkmark" size={14} color={COLORS.white} />
                                        <Text style={styles.admin_tag_text}>Panel de Administración</Text>
                                </View>
                        </View>

                        {/* Botón GRANDE Y VISIBLE para cambiar a vista cliente */}
                        <View style={styles.switch_view_container}>
                                <TouchableOpacity
                                        style={styles.switch_view_button}
                                        onPress={handle_switch_to_client}
                                        activeOpacity={0.8}
                                >
                                        <View style={styles.switch_view_icon_container}>
                                                <Ionicons name="storefront" size={28} color={COLORS.white} />
                                        </View>
                                        <View style={styles.switch_view_content}>
                                                <Text style={styles.switch_view_title}>🛍️ VER VISTA CLIENTE</Text>
                                                <Text style={styles.switch_view_subtitle}>Cambiar a modo tienda</Text>
                                        </View>
                                        <Ionicons name="arrow-forward-circle" size={28} color={COLORS.white} />
                                </TouchableOpacity>
                        </View>

                        {/* Divider */}
                        <View style={styles.divider} />

                        {/* Botón de cerrar sesión */}
                        <View style={styles.menu_container}>
                                <TouchableOpacity style={styles.menu_item} onPress={handle_logout}>
                                        <View style={[styles.menu_icon_container, styles.logout_icon]}>
                                                <Ionicons name="log-out-outline" size={22} color="#E03C3C" />
                                        </View>
                                        <Text style={[styles.menu_text, styles.logout_text]}>Cerrar Sesión</Text>
                                        <Ionicons name="chevron-forward" size={18} color="#ccc" />
                                </TouchableOpacity>
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                                <Text style={styles.footer_text}>Gracia Sublime Admin</Text>
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
                backgroundColor: COLORS.primary,
                padding: 25,
                paddingTop: 50,
                alignItems: 'center',
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(255,255,255,0.2)',
        },
        avatar_container: {
                marginBottom: 15,
        },
        avatar: {
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: 'rgba(255,255,255,0.2)',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 3,
                borderColor: COLORS.white,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 4,
        },
        user_name: {
                fontSize: 20,
                fontWeight: 'bold',
                color: COLORS.white,
                marginBottom: 5,
        },
        user_email: {
                fontSize: 14,
                color: 'rgba(255,255,255,0.9)',
        },
        admin_tag: {
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.2)',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 12,
                marginTop: 10,
                gap: 6,
        },
        admin_tag_text: {
                fontSize: 12,
                fontWeight: '600',
                color: COLORS.white,
        },
        switch_view_container: {
                paddingHorizontal: 15,
                paddingVertical: 20,
        },
        switch_view_button: {
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.primary,
                borderRadius: 16,
                padding: 18,
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 8,
                borderWidth: 3,
                borderColor: COLORS.white,
        },
        switch_view_icon_container: {
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: 'rgba(255,255,255,0.25)',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 14,
                borderWidth: 2,
                borderColor: COLORS.white,
        },
        switch_view_content: {
                flex: 1,
        },
        switch_view_title: {
                fontSize: 17,
                fontWeight: 'bold',
                color: COLORS.white,
                marginBottom: 4,
                letterSpacing: 0.5,
        },
        switch_view_subtitle: {
                fontSize: 12,
                color: 'rgba(255,255,255,0.9)',
                fontWeight: '500',
        },
        divider: {
                height: 1,
                backgroundColor: '#e0e0e0',
                marginVertical: 10,
        },
        menu_container: {
                paddingVertical: 10,
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
        footer: {
                padding: 20,
                alignItems: 'center',
                marginTop: 'auto',
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
});

export default CustomAdminDrawerContent;
