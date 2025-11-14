import React, { useState } from 'react';
import {
        View,
        Text,
        StyleSheet,
        SafeAreaView,
        ScrollView,
        TouchableOpacity,
        Modal,
        TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors.js';
import { useAuth } from '../context/AuthContext.js';
import { useAddresses } from '../context/AddressesContext.js';

const ProfileScreen = ({ navigation }) => {
        const { user, profile, update_profile, is_admin, view_mode, toggle_view_mode } = useAuth();
        const { addresses, default_address, add_address, update_address } = useAddresses();
        const [show_address_modal, set_show_address_modal] = useState(false);
        const [show_edit_modal, set_show_edit_modal] = useState(false);
        const [street, set_street] = useState('');
        const [number, set_number] = useState('');
        const [city, set_city] = useState('');
        const [state, set_state] = useState('');
        const [zip_code, set_zip_code] = useState('');
        const [editing_address, set_editing_address] = useState(null);
        const [edit_name, set_edit_name] = useState(profile?.name || '');
        const [edit_phone, set_edit_phone] = useState(profile?.phone || '');

        // Cargar datos de la dirección si estamos editando
        const open_address_modal = (address = null) => {
                if (address) {
                        // Modo edición
                        set_editing_address(address);
                        set_street(address.street || '');
                        set_number(address.number?.toString() || '');
                        set_city(address.city || '');
                        set_state(address.state || '');
                        set_zip_code(address.postal_code || '');
                } else {
                        // Modo creación
                        set_editing_address(null);
                        set_street('');
                        set_number('');
                        set_city('');
                        set_state('');
                        set_zip_code('');
                }
                set_show_address_modal(true);
        };

        const handle_save_address = async () => {
                const addressData = {
                        street,
                        number: parseInt(number) || 0,
                        city,
                        state,
                        postal_code: zip_code,
                };

                let result;
                if (editing_address) {
                        // Actualizar dirección existente
                        result = await update_address(editing_address.address_id, addressData);
                } else {
                        // Crear nueva dirección
                        result = await add_address(addressData);
                }

                if (result.success) {
                        set_show_address_modal(false);
                        // Limpiar campos
                        set_street('');
                        set_number('');
                        set_city('');
                        set_state('');
                        set_zip_code('');
                        set_editing_address(null);
                } else {
                        alert('Error al guardar la dirección: ' + result.error);
                }
        };

        return (
                <SafeAreaView style={styles.container}>
                        {/* Header */}
                        <View style={styles.header}>
                                <TouchableOpacity
                                        onPress={() => navigation.goBack()}
                                        style={styles.back_button}
                                >
                                        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                                </TouchableOpacity>
                                <Text style={styles.header_title}>Mi Perfil</Text>
                                <View style={styles.placeholder} />
                        </View>

                        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                                {/* Avatar placeholder */}
                                <View style={styles.avatar_container}>
                                        <View style={styles.avatar}>
                                                <Ionicons name="person" size={60} color={COLORS.primary} />
                                        </View>
                                </View>

                                {/* Información del usuario */}
                                <View style={styles.info_section}>
                                        <Text style={styles.name}>{profile?.name || user?.email || 'Usuario'}</Text>
                                        <Text style={styles.email}>{user?.email}</Text>
                                </View>

                                {/* Tarjetas de información */}
                                <View style={styles.cards_container}>
                                        <View style={styles.info_card}>
                                                <View style={styles.icon_circle}>
                                                        <Ionicons name="person-outline" size={24} color={COLORS.primary} />
                                                </View>
                                                <View style={styles.card_content}>
                                                        <Text style={styles.card_label}>Nombre Completo</Text>
                                                        <Text style={styles.card_value}>{profile?.name || 'No especificado'}</Text>
                                                </View>
                                        </View>

                                        <View style={styles.info_card}>
                                                <View style={styles.icon_circle}>
                                                        <Ionicons name="mail-outline" size={24} color={COLORS.primary} />
                                                </View>
                                                <View style={styles.card_content}>
                                                        <Text style={styles.card_label}>Email</Text>
                                                        <Text style={styles.card_value}>{user?.email}</Text>
                                                </View>
                                        </View>

                                        <View style={styles.info_card}>
                                                <View style={styles.icon_circle}>
                                                        <Ionicons name="call-outline" size={24} color={COLORS.primary} />
                                                </View>
                                                <View style={styles.card_content}>
                                                        <Text style={styles.card_label}>Teléfono</Text>
                                                        <Text style={styles.card_value}>{profile?.phone || 'No especificado'}</Text>
                                                </View>
                                        </View>


                                        {/* Sección de Dirección */}
                                        <TouchableOpacity
                                                style={styles.address_card}
                                                onPress={() => open_address_modal(default_address)}
                                        >
                                                <View style={styles.icon_circle}>
                                                        <Ionicons name="location-outline" size={24} color={COLORS.primary} />
                                                </View>
                                                <View style={styles.card_content}>
                                                        <Text style={styles.card_label}>Dirección de Entrega</Text>
                                                        {default_address ? (
                                                                <>
                                                                        <Text style={styles.card_value}>
                                                                                {default_address.street} {default_address.number}
                                                                        </Text>
                                                                        <Text style={styles.address_detail}>
                                                                                {default_address.city}, {default_address.state} {default_address.postal_code}
                                                                        </Text>
                                                                </>
                                                        ) : (
                                                                <Text style={styles.no_address}>
                                                                        Toca para agregar tu dirección
                                                                </Text>
                                                        )}
                                                </View>
                                                <Ionicons name="chevron-forward" size={20} color="#999" />
                                        </TouchableOpacity>
                                </View>

                                {/* Botón de acceso al panel admin (solo para administradores) */}
                                {is_admin && (
                                        <TouchableOpacity
                                                style={styles.admin_button}
                                                activeOpacity={0.8}
                                                onPress={() => {
                                                        navigation.navigate('AdminDrawer');
                                                }}
                                        >
                                                <Ionicons name="shield-checkmark" size={20} color={COLORS.white} />
                                                <Text style={styles.edit_button_text}>Acceder al Panel Admin</Text>
                                        </TouchableOpacity>
                                )}

                                {/* Botón de editar perfil */}
                                <TouchableOpacity
                                        style={styles.edit_button}
                                        activeOpacity={0.8}
                                        onPress={() => {
                                                set_edit_name(profile?.name || '');
                                                set_edit_phone(profile?.phone || '');
                                                set_show_edit_modal(true);
                                        }}
                                >
                                        <Ionicons name="create-outline" size={20} color={COLORS.white} />
                                        <Text style={styles.edit_button_text}>Editar Perfil</Text>
                                </TouchableOpacity>
                        </ScrollView>

                        {/* Modal de Dirección */}
                        <Modal
                                visible={show_address_modal}
                                transparent
                                animationType="slide"
                                onRequestClose={() => set_show_address_modal(false)}
                        >
                                <View style={styles.modal_overlay}>
                                        <View style={styles.modal_content}>
                                                <View style={styles.modal_header}>
                                                        <Text style={styles.modal_title}>
                                                                {editing_address ? 'Editar Dirección' : 'Nueva Dirección'}
                                                        </Text>
                                                        <TouchableOpacity onPress={() => set_show_address_modal(false)}>
                                                                <Ionicons name="close" size={28} color={COLORS.textDark} />
                                                        </TouchableOpacity>
                                                </View>

                                                <View style={styles.input_group}>
                                                        <Text style={styles.input_label}>Calle</Text>
                                                        <TextInput
                                                                style={styles.input}
                                                                value={street}
                                                                onChangeText={set_street}
                                                                placeholder="Ej: Av. Reforma"
                                                        />
                                                </View>

                                                <View style={styles.input_group}>
                                                        <Text style={styles.input_label}>Número</Text>
                                                        <TextInput
                                                                style={styles.input}
                                                                value={number}
                                                                onChangeText={set_number}
                                                                placeholder="Ej: 123"
                                                                keyboardType="numeric"
                                                        />
                                                </View>

                                                <View style={styles.input_group}>
                                                        <Text style={styles.input_label}>Ciudad</Text>
                                                        <TextInput
                                                                style={styles.input}
                                                                value={city}
                                                                onChangeText={set_city}
                                                                placeholder="Ej: Ciudad de México"
                                                        />
                                                </View>

                                                <View style={styles.input_group}>
                                                        <Text style={styles.input_label}>Estado</Text>
                                                        <TextInput
                                                                style={styles.input}
                                                                value={state}
                                                                onChangeText={set_state}
                                                                placeholder="Ej: CDMX"
                                                        />
                                                </View>

                                                <View style={styles.input_group}>
                                                        <Text style={styles.input_label}>Código Postal</Text>
                                                        <TextInput
                                                                style={styles.input}
                                                                value={zip_code}
                                                                onChangeText={set_zip_code}
                                                                placeholder="Ej: 01000"
                                                                keyboardType="numeric"
                                                                maxLength={5}
                                                        />
                                                </View>

                                                <TouchableOpacity
                                                        style={styles.save_button}
                                                        onPress={handle_save_address}
                                                >
                                                        <Text style={styles.save_button_text}>Guardar Dirección</Text>
                                                </TouchableOpacity>
                                        </View>
                                </View>
                        </Modal>

                        {/* Modal de Editar Perfil */}
                        <Modal
                                visible={show_edit_modal}
                                transparent
                                animationType="slide"
                                onRequestClose={() => set_show_edit_modal(false)}
                        >
                                <View style={styles.modal_overlay}>
                                        <View style={styles.modal_content}>
                                                <View style={styles.modal_header}>
                                                        <Text style={styles.modal_title}>Editar Perfil</Text>
                                                        <TouchableOpacity onPress={() => set_show_edit_modal(false)}>
                                                                <Ionicons name="close" size={28} color={COLORS.textDark} />
                                                        </TouchableOpacity>
                                                </View>

                                                <View style={styles.input_group}>
                                                        <Text style={styles.input_label}>Nombre Completo</Text>
                                                        <TextInput
                                                                style={styles.input}
                                                                value={edit_name}
                                                                onChangeText={set_edit_name}
                                                                placeholder="Ingresa tu nombre completo"
                                                        />
                                                </View>

                                                <View style={styles.input_group}>
                                                        <Text style={styles.input_label}>Teléfono</Text>
                                                        <TextInput
                                                                style={styles.input}
                                                                value={edit_phone}
                                                                onChangeText={set_edit_phone}
                                                                placeholder="Ingresa tu teléfono"
                                                                keyboardType="phone-pad"
                                                        />
                                                </View>

                                                <TouchableOpacity
                                                        style={styles.save_button}
                                                        onPress={async () => {
                                                                const result = await update_profile({
                                                                        name: edit_name,
                                                                        phone: edit_phone,
                                                                });
                                                                if (result.success) {
                                                                        set_show_edit_modal(false);
                                                                        alert('Perfil actualizado correctamente');
                                                                } else {
                                                                        alert('Error al actualizar perfil: ' + result.error);
                                                                }
                                                        }}
                                                >
                                                        <Text style={styles.save_button_text}>Guardar Cambios</Text>
                                                </TouchableOpacity>
                                        </View>
                                </View>
                        </Modal>
                </SafeAreaView>
        );
};

const styles = StyleSheet.create({
        container: {
                flex: 1,
                backgroundColor: COLORS.white,
        },
        header: {
                backgroundColor: COLORS.primary,
                paddingHorizontal: 20,
                paddingVertical: 15,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottomLeftRadius: 25,
                borderBottomRightRadius: 25,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 8,
        },
        back_button: {
                padding: 5,
        },
        header_title: {
                fontSize: 20,
                fontWeight: 'bold',
                color: COLORS.white,
                flex: 1,
                textAlign: 'center',
        },
        placeholder: {
                width: 34,
        },
        content: {
                flex: 1,
        },
        avatar_container: {
                alignItems: 'center',
                paddingVertical: 30,
        },
        avatar: {
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: COLORS.primaryLight,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 4,
                borderColor: COLORS.primary,
        },
        info_section: {
                alignItems: 'center',
                marginBottom: 30,
        },
        name: {
                fontSize: 26,
                fontWeight: 'bold',
                color: COLORS.textDark,
                marginBottom: 5,
        },
        email: {
                fontSize: 16,
                color: '#666',
        },
        cards_container: {
                paddingHorizontal: 20,
        },
        info_card: {
                flexDirection: 'row',
                backgroundColor: COLORS.white,
                borderRadius: 15,
                padding: 15,
                marginBottom: 15,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
        },
        icon_circle: {
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: COLORS.primaryLight,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 15,
        },
        card_content: {
                flex: 1,
        },
        card_label: {
                fontSize: 12,
                color: '#999',
                marginBottom: 3,
        },
        card_value: {
                fontSize: 16,
                fontWeight: '600',
                color: COLORS.textDark,
        },
        address_card: {
                flexDirection: 'row',
                backgroundColor: COLORS.primaryLight,
                borderRadius: 15,
                padding: 15,
                marginBottom: 15,
                alignItems: 'center',
                borderWidth: 2,
                borderColor: COLORS.primary,
                borderStyle: 'dashed',
        },
        address_detail: {
                fontSize: 14,
                color: '#666',
                marginTop: 3,
        },
        no_address: {
                fontSize: 14,
                color: '#999',
                fontStyle: 'italic',
        },
        edit_button: {
                flexDirection: 'row',
                backgroundColor: COLORS.primary,
                marginHorizontal: 20,
                marginVertical: 30,
                paddingVertical: 15,
                borderRadius: 15,
                justifyContent: 'center',
                alignItems: 'center',
        },
        edit_button_text: {
                color: COLORS.white,
                fontSize: 16,
                fontWeight: 'bold',
                marginLeft: 10,
        },
        admin_button: {
                flexDirection: 'row',
                backgroundColor: '#FF6B6B',
                marginHorizontal: 20,
                marginBottom: 15,
                paddingVertical: 15,
                borderRadius: 15,
                justifyContent: 'center',
                alignItems: 'center',
        },
        modal_overlay: {
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.5)',
                justifyContent: 'flex-end',
        },
        modal_content: {
                backgroundColor: COLORS.white,
                borderTopLeftRadius: 30,
                borderTopRightRadius: 30,
                padding: 25,
                paddingBottom: 35,
        },
        modal_header: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
        },
        modal_title: {
                fontSize: 22,
                fontWeight: 'bold',
                color: COLORS.textDark,
        },
        input_group: {
                marginBottom: 15,
        },
        input_label: {
                fontSize: 14,
                fontWeight: '600',
                color: COLORS.textDark,
                marginBottom: 8,
        },
        input: {
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 10,
                padding: 12,
                fontSize: 15,
                backgroundColor: COLORS.white,
        },
        save_button: {
                backgroundColor: COLORS.primary,
                paddingVertical: 15,
                borderRadius: 15,
                alignItems: 'center',
                marginTop: 10,
        },
        save_button_text: {
                color: COLORS.white,
                fontSize: 16,
                fontWeight: 'bold',
        },
});

export default ProfileScreen;
