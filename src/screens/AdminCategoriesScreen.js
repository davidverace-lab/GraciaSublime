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
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoriesWithProductCount,
} from '../services/categoriesService';
import CustomButton from '../components/CustomButton';

const AdminCategoriesScreen = () => {
    const [categories, set_categories] = useState([]);
    const [show_edit_modal, set_show_edit_modal] = useState(false);
    const [show_create_modal, set_show_create_modal] = useState(false);
    const [selected_category, set_selected_category] = useState(null);
    const [edit_name, set_edit_name] = useState('');
    const [edit_description, set_edit_description] = useState('');
    const [edit_color, set_edit_color] = useState('');
    const [edit_image, set_edit_image] = useState(null);
    const [edit_icon, set_edit_icon] = useState('cube');
    const [loading, set_loading] = useState(true);
    const [refreshing, set_refreshing] = useState(false);

    useEffect(() => {
        load_categories();
    }, []);

    const load_categories = async () => {
        try {
            set_loading(true);
            const { data, error } = await getCategoriesWithProductCount();

            if (error) {
                console.error('Error cargando categorías:', error);
                Alert.alert('Error', 'No se pudieron cargar las categorías');
                return;
            }

            set_categories(data || []);
        } catch (error) {
            console.error('Error al cargar categorías:', error);
            Alert.alert('Error', 'Ocurrió un error al cargar las categorías');
        } finally {
            set_loading(false);
            set_refreshing(false);
        }
    };

    const on_refresh = async () => {
        set_refreshing(true);
        await load_categories();
    };

    const open_edit_modal = (category) => {
        set_selected_category(category);
        set_edit_name(category.name);
        set_edit_description(category.description);
        set_edit_color(category.color);
        set_edit_image(category.image);
        set_edit_icon(category.icon || 'cube');
        set_show_edit_modal(true);
    };

    const close_edit_modal = () => {
        set_show_edit_modal(false);
        set_selected_category(null);
        set_edit_name('');
        set_edit_description('');
        set_edit_color('');
        set_edit_image(null);
        set_edit_icon('cube');
    };

    const open_create_modal = () => {
        set_edit_name('');
        set_edit_description('');
        set_edit_color('#FFB6C1');
        set_edit_image(null);
        set_edit_icon('cube');
        set_show_create_modal(true);
    };

    const close_create_modal = () => {
        set_show_create_modal(false);
        set_edit_name('');
        set_edit_description('');
        set_edit_color('');
        set_edit_image(null);
        set_edit_icon('cube');
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
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled) {
            set_edit_image({ uri: result.assets[0].uri });
        }
    };

    const remove_image = () => {
        set_edit_image(null);
    };

    const save_category = async () => {
        if (!edit_name.trim()) {
            Alert.alert('Error', 'El nombre es requerido');
            return;
        }

        try {
            const categoryData = {
                name: edit_name.trim(),
                description: edit_description.trim() || null,
            };

            // Solo agregar image_url si existe la columna
            // (la agregarás ejecutando el SQL)
            if (edit_image?.uri) {
                try {
                    categoryData.image_url = edit_image.uri;
                } catch (e) {
                    console.log('Columna image_url no disponible aún');
                }
            }

            const { data, error } = await updateCategory(
                selected_category.category_id,
                categoryData
            );

            if (error) {
                console.error('Error actualizando categoría:', error);
                Alert.alert('Error', 'No se pudo actualizar la categoría');
                return;
            }

            close_edit_modal();
            await load_categories(); // Recargar categorías
            Alert.alert('Éxito', 'Categoría actualizada correctamente');
        } catch (error) {
            console.error('Error al actualizar categoría:', error);
            Alert.alert('Error', 'Ocurrió un error al actualizar la categoría');
        }
    };

    const create_category = async () => {
        if (!edit_name.trim()) {
            Alert.alert('Error', 'El nombre es requerido');
            return;
        }

        try {
            const categoryData = {
                name: edit_name.trim(),
                description: edit_description.trim() || null,
            };

            // Solo agregar image_url si existe la columna
            if (edit_image?.uri) {
                try {
                    categoryData.image_url = edit_image.uri;
                } catch (e) {
                    console.log('Columna image_url no disponible aún');
                }
            }

            const { data, error } = await createCategory(categoryData);

            if (error) {
                console.error('Error creando categoría:', error);
                Alert.alert('Error', 'No se pudo crear la categoría');
                return;
            }

            close_create_modal();
            await load_categories(); // Recargar categorías
            Alert.alert('Éxito', 'Categoría creada correctamente');
        } catch (error) {
            console.error('Error al crear categoría:', error);
            Alert.alert('Error', 'Ocurrió un error al crear la categoría');
        }
    };

    const handle_delete_category = async (category) => {
        Alert.alert(
            'Eliminar Categoría',
            `¿Estás seguro de que quieres eliminar "${category.name}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { error } = await deleteCategory(category.category_id);

                            if (error) {
                                console.error('Error eliminando categoría:', error);
                                Alert.alert('Error', error.message || 'No se pudo eliminar la categoría');
                                return;
                            }

                            await load_categories(); // Recargar categorías
                            Alert.alert('Éxito', 'Categoría eliminada correctamente');
                        } catch (error) {
                            console.error('Error al eliminar categoría:', error);
                            Alert.alert('Error', 'Ocurrió un error al eliminar la categoría');
                        }
                    },
                },
            ]
        );
    };

    const render_category = ({ item }) => {
        const imageSource = item.image_url
            ? { uri: item.image_url }
            : typeof item.image === 'number'
            ? item.image
            : null;
        const productCount = item.productCount || 0;

        return (
            <View style={styles.category_card}>
                {/* Imagen de la categoría como fondo */}
                {imageSource && (
                    <Image
                        source={imageSource}
                        style={styles.category_background_image}
                        resizeMode="cover"
                    />
                )}

                {/* Overlay oscuro para mejorar legibilidad */}
                <View style={styles.category_overlay} />

                {/* Contenido sobre la imagen */}
                <View style={styles.category_content_row}>
                    <View style={[styles.icon_container, { backgroundColor: COLORS.primary }]}>
                        <Ionicons name="pricetag" size={32} color={COLORS.white} />
                    </View>

                    <View style={styles.category_info}>
                        <Text style={styles.category_name}>{item.name}</Text>
                        <Text style={styles.category_description}>
                            {item.description || 'Sin descripción'}
                        </Text>
                        <Text style={styles.category_products}>
                            {productCount} {productCount === 1 ? 'producto' : 'productos'}
                        </Text>
                    </View>

                    <View style={styles.actions_column}>
                        <TouchableOpacity
                            style={styles.edit_button}
                            onPress={() => open_edit_modal(item)}
                        >
                            <Ionicons name="create-outline" size={24} color={COLORS.white} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.delete_button}
                            onPress={() => handle_delete_category(item)}
                        >
                            <Ionicons name="trash-outline" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    const color_options = [
        '#FF6B6B',
        '#4ECDC4',
        '#45B7D1',
        '#FFA07A',
        '#98D8C8',
        '#F7DC6F',
        '#BB8FCE',
        '#85C1E2',
    ];

    const icon_options = [
        'cafe',
        'sunny',
        'shirt',
        'water',
        'gift',
        'heart',
        'star',
        'cube',
        'briefcase',
        'book',
    ];

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
                            {is_create ? 'Nueva Categoría' : 'Editar Categoría'}
                        </Text>
                        <TouchableOpacity
                            onPress={is_create ? close_create_modal : close_edit_modal}
                        >
                            <Ionicons name="close" size={28} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modal_body}>
                        {/* Imagen */}
                        <View style={styles.input_group}>
                            <Text style={styles.label}>Imagen de la categoría</Text>
                            {edit_image ? (
                                <View style={styles.image_preview_container}>
                                    <Image
                                        source={
                                            typeof edit_image === 'number'
                                                ? edit_image
                                                : edit_image
                                        }
                                        style={styles.image_preview}
                                    />
                                    <TouchableOpacity
                                        style={styles.remove_image_button}
                                        onPress={remove_image}
                                    >
                                        <Ionicons name="close-circle" size={32} color="#F44336" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={styles.add_image_button}
                                    onPress={pick_image}
                                >
                                    <Ionicons name="image-outline" size={40} color="#999" />
                                    <Text style={styles.add_image_text}>Agregar imagen</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.input_group}>
                            <Text style={styles.label}>Nombre</Text>
                            <TextInput
                                style={styles.input}
                                value={edit_name}
                                onChangeText={set_edit_name}
                                placeholder="Nombre de la categoría"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.input_group}>
                            <Text style={styles.label}>Descripción</Text>
                            <TextInput
                                style={[styles.input, styles.text_area]}
                                value={edit_description}
                                onChangeText={set_edit_description}
                                placeholder="Descripción"
                                placeholderTextColor="#999"
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        <View style={styles.input_group}>
                            <Text style={styles.label}>Icono</Text>
                            <View style={styles.icon_grid}>
                                {icon_options.map((icon) => (
                                    <TouchableOpacity
                                        key={icon}
                                        style={[
                                            styles.icon_option,
                                            edit_icon === icon && styles.icon_selected,
                                        ]}
                                        onPress={() => set_edit_icon(icon)}
                                    >
                                        <Ionicons name={icon} size={24} color="#333" />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.input_group}>
                            <Text style={styles.label}>Color</Text>
                            <View style={styles.color_grid}>
                                {color_options.map((color) => (
                                    <TouchableOpacity
                                        key={color}
                                        style={[
                                            styles.color_option,
                                            { backgroundColor: color },
                                            edit_color === color && styles.color_selected,
                                        ]}
                                        onPress={() => set_edit_color(color)}
                                    >
                                        {edit_color === color && (
                                            <Ionicons
                                                name="checkmark"
                                                size={24}
                                                color={COLORS.white}
                                            />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <CustomButton
                            title={is_create ? 'CREAR CATEGORÍA' : 'GUARDAR CAMBIOS'}
                            onPress={is_create ? create_category : save_category}
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

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.header_title}>Categorías</Text>
                </View>
                <View style={styles.loading_container}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loading_text}>Cargando categorías...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.header_title}>Categorías</Text>
                <TouchableOpacity style={styles.add_button} onPress={open_create_modal}>
                    <Ionicons name="add-circle" size={28} color={COLORS.white} />
                    <Text style={styles.add_button_text}>Nueva</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={categories}
                renderItem={render_category}
                keyExtractor={(item) => item.category_id?.toString() || item.id?.toString()}
                contentContainerStyle={styles.list_container}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={on_refresh}
                        colors={[COLORS.primary]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.empty_container}>
                        <Ionicons name="pricetag-outline" size={80} color="#ccc" />
                        <Text style={styles.empty_text}>No hay categorías</Text>
                        <Text style={styles.empty_subtext}>
                            Toca el botón + para crear una
                        </Text>
                    </View>
                }
            />

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
    list_container: {
        padding: 15,
    },
    category_card: {
        backgroundColor: COLORS.white,
        borderRadius: 15,
        marginBottom: 15,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        height: 120,
        position: 'relative',
    },
    category_background_image: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
    },
    category_overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    category_content_row: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        position: 'relative',
        zIndex: 2,
    },
    icon_container: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    category_info: {
        flex: 1,
        marginLeft: 15,
    },
    category_name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 4,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    category_description: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.95)',
        marginBottom: 4,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    category_products: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.85)',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    edit_button: {
        padding: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 25,
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
        maxHeight: '80%',
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
    color_grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    color_option: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    color_selected: {
        borderColor: '#333',
        borderWidth: 3,
    },
    icon_grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    icon_option: {
        width: 50,
        height: 50,
        borderRadius: 10,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    icon_selected: {
        borderColor: COLORS.primary,
        backgroundColor: '#E8F5E9',
    },
    image_preview_container: {
        position: 'relative',
        width: '100%',
        height: 150,
        borderRadius: 12,
        overflow: 'hidden',
    },
    image_preview: {
        width: '100%',
        height: '100%',
    },
    remove_image_button: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'white',
        borderRadius: 16,
    },
    add_image_button: {
        width: '100%',
        height: 150,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
    },
    add_image_text: {
        marginTop: 10,
        fontSize: 14,
        color: '#999',
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
    loading_container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loading_text: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    empty_container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
    },
    empty_text: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#999',
        marginTop: 15,
    },
    empty_subtext: {
        fontSize: 14,
        color: '#bbb',
        marginTop: 5,
    },
    actions_column: {
        flexDirection: 'column',
        gap: 8,
    },
    delete_button: {
        backgroundColor: '#F44336',
        padding: 8,
        borderRadius: 8,
    },
});

export default AdminCategoriesScreen;
