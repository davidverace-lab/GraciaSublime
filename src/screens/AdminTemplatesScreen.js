import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    Image,
    Modal,
    TextInput,
    Alert,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../constants/colors';
import {
    getAllDesigns,
    getDesignCategories,
    createDesign,
    updateDesign,
    deleteDesign,
} from '../services/designsService';
import CustomButton from '../components/CustomButton';

const AdminTemplatesScreen = () => {
    const [designs, set_designs] = useState([]);
    const [categories, set_categories] = useState([]);
    const [loading, set_loading] = useState(true);
    const [refreshing, set_refreshing] = useState(false);
    const [show_edit_modal, set_show_edit_modal] = useState(false);
    const [show_create_modal, set_show_create_modal] = useState(false);
    const [selected_design, set_selected_design] = useState(null);
    const [filter_category, set_filter_category] = useState('all');

    // Campos de edición/creación
    const [edit_name, set_edit_name] = useState('');
    const [edit_description, set_edit_description] = useState('');
    const [edit_category, set_edit_category] = useState('cumpleaños');
    const [edit_price, set_edit_price] = useState('50');
    const [edit_image_url, set_edit_image_url] = useState('');
    const [edit_customizable, set_edit_customizable] = useState(true);
    const [saving, set_saving] = useState(false);

    useEffect(() => {
        load_data();
    }, []);

    const load_data = async () => {
        try {
            set_loading(true);

            const [designsResult, categoriesResult] = await Promise.all([
                getAllDesigns(),
                getDesignCategories()
            ]);

            if (designsResult.error) {
                console.error('❌ Error cargando diseños:', designsResult.error);
                Alert.alert('Error', 'No se pudieron cargar los diseños');
            } else {
                console.log('✅ Diseños cargados:', designsResult.data?.length);
                set_designs(designsResult.data || []);
            }

            if (categoriesResult.error) {
                console.error('❌ Error cargando categorías:', categoriesResult.error);
            } else {
                set_categories(categoriesResult.data || []);
            }
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            set_loading(false);
        }
    };

    const handle_refresh = async () => {
        set_refreshing(true);
        await load_data();
        set_refreshing(false);
    };

    const open_edit_modal = (design) => {
        set_selected_design(design);
        set_edit_name(design.name);
        set_edit_description(design.description || '');
        set_edit_category(design.category);
        set_edit_price(design.price.toString());
        set_edit_image_url(design.image_url);
        set_edit_customizable(design.is_customizable);
        set_show_edit_modal(true);
    };

    const close_edit_modal = () => {
        set_show_edit_modal(false);
        set_selected_design(null);
        reset_form();
    };

    const open_create_modal = () => {
        reset_form();
        set_show_create_modal(true);
    };

    const close_create_modal = () => {
        set_show_create_modal(false);
        reset_form();
    };

    const reset_form = () => {
        set_edit_name('');
        set_edit_description('');
        set_edit_category('cumpleaños');
        set_edit_price('50');
        set_edit_image_url('');
        set_edit_customizable(true);
    };

    const pick_image = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso requerido', 'Se necesita permiso para acceder a las fotos');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            // Por ahora usa la URI local
            // En producción deberías subir a Supabase Storage
            set_edit_image_url(result.assets[0].uri);
        }
    };

    const save_design = async () => {
        if (!edit_name.trim()) {
            Alert.alert('Error', 'El nombre es requerido');
            return;
        }

        if (!edit_image_url.trim()) {
            Alert.alert('Error', 'La URL de la imagen es requerida');
            return;
        }

        const price_value = parseFloat(edit_price);
        if (isNaN(price_value) || price_value < 0) {
            Alert.alert('Error', 'El precio debe ser un número válido');
            return;
        }

        set_saving(true);

        try {
            const designData = {
                name: edit_name.trim(),
                description: edit_description.trim(),
                category: edit_category,
                price: price_value,
                image_url: edit_image_url.trim(),
                is_customizable: edit_customizable,
                is_active: true,
            };

            console.log('💾 Guardando diseño:', designData);

            const result = await updateDesign(selected_design.design_id, designData);

            if (!result.success) {
                console.error('❌ Error actualizando:', result.error);
                Alert.alert('Error', `No se pudo actualizar el diseño: ${result.error?.message || result.error}`);
                return;
            }

            console.log('✅ Diseño actualizado:', result.data);
            await load_data();
            close_edit_modal();
            Alert.alert('Éxito', 'Diseño actualizado correctamente');
        } catch (error) {
            console.error('Error al guardar diseño:', error);
            Alert.alert('Error', 'Ocurrió un error al guardar el diseño');
        } finally {
            set_saving(false);
        }
    };

    const create_new_design = async () => {
        if (!edit_name.trim()) {
            Alert.alert('Error', 'El nombre es requerido');
            return;
        }

        if (!edit_image_url.trim()) {
            Alert.alert('Error', 'La URL de la imagen es requerida');
            return;
        }

        const price_value = parseFloat(edit_price);
        if (isNaN(price_value) || price_value < 0) {
            Alert.alert('Error', 'El precio debe ser un número válido');
            return;
        }

        set_saving(true);

        try {
            const designData = {
                name: edit_name.trim(),
                description: edit_description.trim(),
                category: edit_category,
                price: price_value,
                image_url: edit_image_url.trim(),
                is_customizable: edit_customizable,
                is_active: true,
                colors: [], // Array vacío por defecto
            };

            console.log('➕ Creando diseño:', designData);

            const result = await createDesign(designData);

            if (!result.success) {
                console.error('❌ Error creando:', result.error);
                Alert.alert('Error', `No se pudo crear el diseño: ${result.error?.message || result.error}`);
                return;
            }

            console.log('✅ Diseño creado:', result.data);
            await load_data();
            close_create_modal();
            Alert.alert('Éxito', 'Diseño creado correctamente');
        } catch (error) {
            console.error('Error al crear diseño:', error);
            Alert.alert('Error', 'Ocurrió un error al crear el diseño');
        } finally {
            set_saving(false);
        }
    };

    const delete_design_handler = (design) => {
        Alert.alert(
            'Confirmar eliminación',
            `¿Estás seguro de eliminar el diseño "${design.name}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            console.log('🗑️ Eliminando diseño:', design.design_id);
                            const result = await deleteDesign(design.design_id);

                            if (result.error) {
                                Alert.alert('Error', 'No se pudo eliminar el diseño');
                                return;
                            }

                            await load_data();
                            Alert.alert('Éxito', 'Diseño eliminado correctamente');
                        } catch (error) {
                            console.error('Error eliminando diseño:', error);
                            Alert.alert('Error', 'Ocurrió un error al eliminar el diseño');
                        }
                    },
                },
            ]
        );
    };

    const get_filtered_designs = () => {
        if (filter_category === 'all') return designs;
        return designs.filter((d) => d.category === filter_category);
    };

    const render_design = ({ item }) => (
        <View style={styles.template_card}>
            <Image
                source={{ uri: item.image_url }}
                style={styles.template_image}
                defaultSource={require('../../img/t1.jpeg')}
            />

            <View style={styles.template_info}>
                <Text style={styles.template_name}>{item.name}</Text>
                <Text style={styles.template_description} numberOfLines={2}>
                    {item.description}
                </Text>
                <View style={styles.template_meta}>
                    <View style={styles.meta_item}>
                        <Ionicons name="pricetag" size={16} color={COLORS.primary} />
                        <Text style={styles.meta_text}>${item.price} MXN</Text>
                    </View>
                    <View style={styles.meta_item}>
                        <Ionicons
                            name={item.is_customizable ? 'create' : 'lock-closed'}
                            size={16}
                            color="#666"
                        />
                        <Text style={styles.meta_text}>
                            {item.is_customizable ? 'Personalizable' : 'Fijo'}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.action_button}
                    onPress={() => open_edit_modal(item)}
                >
                    <Ionicons name="create-outline" size={22} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.action_button, styles.delete_button]}
                    onPress={() => delete_design_handler(item)}
                >
                    <Ionicons name="trash-outline" size={22} color="#F44336" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const render_edit_modal = (is_create = false) => (
        <Modal
            visible={is_create ? show_create_modal : show_edit_modal}
            animationType="slide"
            transparent={true}
            onRequestClose={is_create ? close_create_modal : close_edit_modal}
        >
            <View style={styles.modal_overlay}>
                <View style={styles.modal_content}>
                    <View style={styles.modal_header}>
                        <Text style={styles.modal_title}>
                            {is_create ? 'Nuevo Diseño' : 'Editar Diseño'}
                        </Text>
                        <TouchableOpacity
                            onPress={is_create ? close_create_modal : close_edit_modal}
                        >
                            <Ionicons name="close" size={28} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modal_body}>
                        {/* Preview de imagen */}
                        {edit_image_url ? (
                            <View style={styles.input_group}>
                                <Text style={styles.label}>Preview</Text>
                                <Image
                                    source={{ uri: edit_image_url }}
                                    style={styles.image_preview}
                                    defaultSource={require('../../img/t1.jpeg')}
                                />
                            </View>
                        ) : null}

                        {/* URL de imagen */}
                        <View style={styles.input_group}>
                            <Text style={styles.label}>URL de Imagen *</Text>
                            <TextInput
                                style={styles.input}
                                value={edit_image_url}
                                onChangeText={set_edit_image_url}
                                placeholder="https://ejemplo.com/imagen.jpg"
                                placeholderTextColor="#999"
                            />
                            <TouchableOpacity
                                style={styles.pick_image_button}
                                onPress={pick_image}
                            >
                                <Ionicons name="images" size={20} color={COLORS.primary} />
                                <Text style={styles.pick_image_text}>
                                    Seleccionar de galería
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Nombre */}
                        <View style={styles.input_group}>
                            <Text style={styles.label}>Nombre *</Text>
                            <TextInput
                                style={styles.input}
                                value={edit_name}
                                onChangeText={set_edit_name}
                                placeholder="Ej: Feliz Cumpleaños"
                                placeholderTextColor="#999"
                            />
                        </View>

                        {/* Descripción */}
                        <View style={styles.input_group}>
                            <Text style={styles.label}>Descripción</Text>
                            <TextInput
                                style={[styles.input, styles.text_area]}
                                value={edit_description}
                                onChangeText={set_edit_description}
                                placeholder="Descripción del diseño"
                                placeholderTextColor="#999"
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        {/* Categoría */}
                        <View style={styles.input_group}>
                            <Text style={styles.label}>Categoría</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.category_scroll}
                            >
                                {categories.filter((c) => c.category_id !== 'all').map((cat) => (
                                    <TouchableOpacity
                                        key={cat.category_id}
                                        style={[
                                            styles.category_option,
                                            edit_category === cat.category_id &&
                                                styles.category_option_selected,
                                        ]}
                                        onPress={() => set_edit_category(cat.category_id)}
                                    >
                                        <Ionicons
                                            name={cat.icon}
                                            size={18}
                                            color={
                                                edit_category === cat.category_id
                                                    ? COLORS.white
                                                    : COLORS.primary
                                            }
                                        />
                                        <Text
                                            style={[
                                                styles.category_option_text,
                                                edit_category === cat.category_id &&
                                                    styles.category_option_text_selected,
                                            ]}
                                        >
                                            {cat.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Precio */}
                        <View style={styles.input_group}>
                            <Text style={styles.label}>Precio Adicional (MXN) *</Text>
                            <TextInput
                                style={styles.input}
                                value={edit_price}
                                onChangeText={set_edit_price}
                                placeholder="50"
                                placeholderTextColor="#999"
                                keyboardType="decimal-pad"
                            />
                        </View>

                        {/* Personalizable */}
                        <TouchableOpacity
                            style={styles.checkbox_row}
                            onPress={() => set_edit_customizable(!edit_customizable)}
                        >
                            <Ionicons
                                name={edit_customizable ? 'checkbox' : 'square-outline'}
                                size={24}
                                color={COLORS.primary}
                            />
                            <Text style={styles.checkbox_label}>
                                Diseño personalizable con texto
                            </Text>
                        </TouchableOpacity>

                        <CustomButton
                            title={
                                saving
                                    ? 'Guardando...'
                                    : is_create
                                    ? 'CREAR DISEÑO'
                                    : 'GUARDAR CAMBIOS'
                            }
                            onPress={is_create ? create_new_design : save_design}
                            disabled={saving}
                            style={styles.save_button}
                        />

                        <TouchableOpacity
                            style={styles.cancel_button}
                            onPress={is_create ? close_create_modal : close_edit_modal}
                        >
                            <Text style={styles.cancel_text}>CANCELAR</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.header_title}>Diseños Prediseñados</Text>
                <TouchableOpacity style={styles.add_button} onPress={open_create_modal}>
                    <Ionicons name="add-circle" size={28} color={COLORS.white} />
                    <Text style={styles.add_button_text}>Nuevo</Text>
                </TouchableOpacity>
            </View>

            {/* Filtros */}
            {!loading && categories.length > 0 && (
                <View style={styles.filters_section}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat.category_id}
                                style={[
                                    styles.filter_chip,
                                    filter_category === cat.category_id &&
                                        styles.filter_chip_active,
                                ]}
                                onPress={() => set_filter_category(cat.category_id)}
                            >
                                <Ionicons
                                    name={cat.icon}
                                    size={16}
                                    color={
                                        filter_category === cat.category_id
                                            ? COLORS.white
                                            : '#666'
                                    }
                                />
                                <Text
                                    style={[
                                        styles.filter_text,
                                        filter_category === cat.category_id &&
                                            styles.filter_text_active,
                                    ]}
                                >
                                    {cat.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Lista de diseños */}
            {loading ? (
                <View style={styles.loading_container}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loading_text}>Cargando diseños...</Text>
                </View>
            ) : (
                <FlatList
                    data={get_filtered_designs()}
                    renderItem={render_design}
                    keyExtractor={(item) => item.design_id.toString()}
                    contentContainerStyle={styles.list_container}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handle_refresh}
                            colors={[COLORS.primary]}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.empty_container}>
                            <Ionicons name="color-palette-outline" size={80} color="#ccc" />
                            <Text style={styles.empty_text}>No hay diseños disponibles</Text>
                            <TouchableOpacity
                                style={styles.reload_button}
                                onPress={load_data}
                            >
                                <Text style={styles.reload_text}>Recargar</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}

            {/* Modal de Edición */}
            {render_edit_modal(false)}

            {/* Modal de Creación */}
            {render_edit_modal(true)}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 15,
        paddingTop: 10,
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    header_title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    add_button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    add_button_text: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.white,
    },
    filters_section: {
        backgroundColor: COLORS.white,
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    filter_chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        marginRight: 10,
        gap: 6,
    },
    filter_chip_active: {
        backgroundColor: COLORS.primary,
    },
    filter_text: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
    },
    filter_text_active: {
        color: COLORS.white,
    },
    list_container: {
        padding: 15,
    },
    template_card: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    template_image: {
        width: 100,
        height: 120,
        backgroundColor: '#f0f0f0',
    },
    template_info: {
        flex: 1,
        padding: 12,
    },
    template_name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    template_description: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
    },
    template_meta: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 8,
    },
    meta_item: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    meta_text: {
        fontSize: 12,
        color: '#666',
    },
    actions: {
        flexDirection: 'column',
        justifyContent: 'center',
        paddingHorizontal: 8,
        gap: 8,
    },
    action_button: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
    },
    delete_button: {
        backgroundColor: '#FFE5E5',
    },
    empty_container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    empty_text: {
        fontSize: 16,
        color: '#999',
        marginTop: 15,
        marginBottom: 15,
    },
    reload_button: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: COLORS.primary,
        borderRadius: 20,
    },
    reload_text: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    loading_container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    loading_text: {
        marginTop: 15,
        fontSize: 16,
        color: '#666',
    },
    modal_overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modal_content: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
    },
    modal_header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    modal_title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    modal_body: {
        padding: 20,
    },
    input_group: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    text_area: {
        height: 80,
        textAlignVertical: 'top',
    },
    image_preview: {
        width: '100%',
        height: 180,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
    },
    pick_image_button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: COLORS.primaryLight,
        borderRadius: 8,
        gap: 8,
    },
    pick_image_text: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
    },
    category_scroll: {
        marginBottom: 10,
    },
    category_option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: '#f5f5f5',
        marginRight: 8,
        gap: 6,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    category_option_selected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    category_option_text: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.primary,
    },
    category_option_text_selected: {
        color: COLORS.white,
    },
    checkbox_row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
    },
    checkbox_label: {
        fontSize: 14,
        color: '#333',
    },
    save_button: {
        marginTop: 10,
    },
    cancel_button: {
        marginTop: 10,
        paddingVertical: 15,
        alignItems: 'center',
    },
    cancel_text: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#999',
    },
});

export default AdminTemplatesScreen;
