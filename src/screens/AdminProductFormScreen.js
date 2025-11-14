import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    Switch,
    Image,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../constants/colors';
import { createProduct, updateProduct } from '../services/productsService';
import { getAllCategories } from '../services/categoriesService';
import CustomButton from '../components/CustomButton';
import { useProducts } from '../context/ProductsContext';

const AdminProductFormScreen = ({ route, navigation }) => {
    const { product } = route.params || {};
    const is_edit = !!product;
    const { create_product, update_product, load_products } = useProducts();

    const [name, set_name] = useState(product?.name || '');
    const [description, set_description] = useState(product?.description || '');
    const [price, set_price] = useState(product?.price?.toString() || '');
    const [stock, set_stock] = useState(product?.stock?.toString() || '0');
    const [category_id, set_category_id] = useState(product?.category_id || null);
    const [is_active, set_is_active] = useState(product?.is_active ?? true);
    const [is_customizable, set_is_customizable] = useState(product?.is_customizable ?? true);
    const [image, set_image] = useState(product?.image_url ? { uri: product.image_url } : product?.image || null);
    const [loading, set_loading] = useState(false);
    const [categories, set_categories] = useState([]);
    const [loading_categories, set_loading_categories] = useState(true);

    useEffect(() => {
        load_categories();
    }, []);

    const load_categories = async () => {
        try {
            set_loading_categories(true);
            const { data, error } = await getAllCategories();

            if (error) {
                console.error('Error cargando categorías:', error);
                Alert.alert('Error', 'No se pudieron cargar las categorías');
                return;
            }

            set_categories(data || []);

            // Si no hay categoría seleccionada y hay categorías, seleccionar la primera
            if (!category_id && data && data.length > 0) {
                set_category_id(data[0].category_id);
            }
        } catch (error) {
            console.error('Error al cargar categorías:', error);
        } finally {
            set_loading_categories(false);
        }
    };

    const pick_image = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permiso denegado', 'Necesitamos acceso a tus fotos');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            set_image({ uri: result.assets[0].uri });
        }
    };

    const validate_form = () => {
        if (!name.trim()) {
            Alert.alert('Error', 'El nombre es requerido');
            return false;
        }
        if (!description.trim()) {
            Alert.alert('Error', 'La descripción es requerida');
            return false;
        }
        if (!price || parseFloat(price) <= 0) {
            Alert.alert('Error', 'El precio debe ser mayor a 0');
            return false;
        }
        if (!stock || parseInt(stock) < 0) {
            Alert.alert('Error', 'El stock no puede ser negativo');
            return false;
        }
        if (!category_id) {
            Alert.alert('Error', 'Debes seleccionar una categoría');
            return false;
        }
        if (!image) {
            Alert.alert('Error', 'La imagen es requerida');
            return false;
        }
        return true;
    };

    const handle_save = async () => {
        if (!validate_form()) return;

        set_loading(true);

        try {
            // Preparar datos del producto
            const productData = {
                name: name.trim(),
                description: description.trim(),
                price: parseFloat(price),
                category_id: category_id,
                // TODO: En producción, deberías subir la imagen a Supabase Storage
                // Por ahora usamos la URI local o la URL existente
                image_url: image?.uri || null,
            };

            // Solo agregar estas columnas si existen en la BD
            // (las agregarás ejecutando el SQL)
            try {
                productData.stock = parseInt(stock);
                productData.is_active = is_active;
                productData.is_customizable = is_customizable;
            } catch (e) {
                console.log('Algunas columnas opcionales no están disponibles');
            }

            if (is_edit) {
                // Editar producto existente
                const result = await update_product(product.product_id, productData);

                if (!result.success) {
                    console.error('Error actualizando producto:', result.error);
                    Alert.alert(
                        'Error al actualizar',
                        `Detalles: ${result.error}\n\nPosibles causas:\n- No tienes permisos de admin\n- Faltan políticas RLS\n- Error en la base de datos`
                    );
                    return;
                }

                await load_products();
                Alert.alert('Éxito', 'Producto actualizado correctamente', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            } else {
                // Crear nuevo producto
                console.log('📦 Creando producto:', productData);
                const result = await create_product(productData);

                if (!result.success) {
                    console.error('❌ Error creando producto:', result.error);
                    Alert.alert(
                        'Error al crear producto',
                        `Detalles: ${result.error}\n\nPosibles causas:\n- No tienes permisos de admin\n- Ejecuta HACER_PERFIL_ADMIN.sql\n- Ejecuta VERIFICAR_Y_ARREGLAR_PRODUCTS.sql`
                    );
                    return;
                }

                console.log('✅ Producto creado exitosamente:', result.data);
                await load_products();
                Alert.alert('Éxito', 'Producto creado correctamente', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            }
        } catch (error) {
            console.error('Error al guardar producto:', error);
            Alert.alert('Error', 'Ocurrió un error al guardar el producto');
        } finally {
            set_loading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.back_button}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.header_title}>
                    {is_edit ? 'Editar Producto' : 'Nuevo Producto'}
                </Text>
                <TouchableOpacity onPress={handle_save} disabled={loading}>
                    <Ionicons
                        name="checkmark"
                        size={24}
                        color={loading ? '#ccc' : COLORS.primary}
                    />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Imagen del producto */}
                    <View style={styles.section}>
                        <Text style={styles.section_title}>📸 Imagen del Producto</Text>

                        <TouchableOpacity style={styles.image_picker} onPress={pick_image}>
                            {image ? (
                                <Image source={image} style={styles.preview_image} />
                            ) : (
                                <View style={styles.image_placeholder}>
                                    <Ionicons name="camera" size={40} color="#999" />
                                    <Text style={styles.image_placeholder_text}>
                                        Toca para agregar imagen
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Información básica */}
                    <View style={styles.section}>
                        <Text style={styles.section_title}>ℹ️ Información Básica</Text>

                        <View style={styles.input_group}>
                            <Text style={styles.label}>Nombre del Producto *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ej: Taza Clásica Perfecta"
                                placeholderTextColor="#999"
                                value={name}
                                onChangeText={set_name}
                            />
                        </View>

                        <View style={styles.input_group}>
                            <Text style={styles.label}>Descripción *</Text>
                            <TextInput
                                style={[styles.input, styles.text_area]}
                                placeholder="Describe el producto..."
                                placeholderTextColor="#999"
                                value={description}
                                onChangeText={set_description}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>

                    {/* Precio y Stock */}
                    <View style={styles.section}>
                        <Text style={styles.section_title}>💰 Precio y Stock</Text>

                        <View style={styles.row}>
                            <View style={styles.half_input}>
                                <Text style={styles.label}>Precio (MXN) *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0.00"
                                    placeholderTextColor="#999"
                                    value={price}
                                    onChangeText={set_price}
                                    keyboardType="decimal-pad"
                                />
                            </View>

                            <View style={styles.half_input}>
                                <Text style={styles.label}>Stock *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0"
                                    placeholderTextColor="#999"
                                    value={stock}
                                    onChangeText={set_stock}
                                    keyboardType="number-pad"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Categoría */}
                    <View style={styles.section}>
                        <Text style={styles.section_title}>📁 Categoría</Text>

                        {loading_categories ? (
                            <ActivityIndicator size="small" color={COLORS.primary} />
                        ) : (
                            <View style={styles.category_grid}>
                                {categories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.category_id}
                                        style={[
                                            styles.category_chip,
                                            category_id === cat.category_id &&
                                                styles.category_chip_active,
                                        ]}
                                        onPress={() => set_category_id(cat.category_id)}
                                    >
                                        <Text
                                            style={[
                                                styles.category_text,
                                                category_id === cat.category_id &&
                                                    styles.category_text_active,
                                            ]}
                                        >
                                            {cat.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {categories.length === 0 && !loading_categories && (
                            <Text style={styles.no_categories_text}>
                                No hay categorías disponibles. Crea una primero.
                            </Text>
                        )}
                    </View>

                    {/* Opciones */}
                    <View style={styles.section}>
                        <Text style={styles.section_title}>⚙️ Opciones</Text>

                        <View style={styles.switch_container}>
                            <View style={styles.switch_left}>
                                <Ionicons
                                    name="checkmark-circle"
                                    size={20}
                                    color={is_active ? COLORS.primary : '#999'}
                                />
                                <Text style={styles.switch_label}>Producto activo</Text>
                            </View>
                            <Switch
                                value={is_active}
                                onValueChange={set_is_active}
                                trackColor={{ false: '#e0e0e0', true: COLORS.primary }}
                                thumbColor={COLORS.white}
                            />
                        </View>

                        <View style={styles.switch_container}>
                            <View style={styles.switch_left}>
                                <Ionicons
                                    name="color-palette"
                                    size={20}
                                    color={is_customizable ? COLORS.primary : '#999'}
                                />
                                <Text style={styles.switch_label}>
                                    Permitir personalización
                                </Text>
                            </View>
                            <Switch
                                value={is_customizable}
                                onValueChange={set_is_customizable}
                                trackColor={{ false: '#e0e0e0', true: COLORS.primary }}
                                thumbColor={COLORS.white}
                            />
                        </View>
                    </View>

                    {/* Botones */}
                    <View style={styles.buttons_container}>
                        <CustomButton
                            title={
                                loading
                                    ? 'Guardando...'
                                    : is_edit
                                    ? 'GUARDAR CAMBIOS'
                                    : 'CREAR PRODUCTO'
                            }
                            onPress={handle_save}
                            disabled={loading}
                        />

                        <TouchableOpacity
                            style={styles.cancel_button}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.cancel_text}>CANCELAR</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    back_button: {
        padding: 5,
    },
    header_title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        flex: 1,
    },
    section: {
        backgroundColor: COLORS.white,
        padding: 15,
        marginTop: 10,
    },
    section_title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    image_picker: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
    },
    preview_image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    image_placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderStyle: 'dashed',
        borderRadius: 12,
    },
    image_placeholder_text: {
        marginTop: 10,
        fontSize: 14,
        color: '#999',
    },
    input_group: {
        marginBottom: 15,
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
        height: 100,
        paddingTop: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
    },
    half_input: {
        flex: 1,
    },
    category_grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    category_chip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    category_chip_active: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    category_text: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    category_text_active: {
        color: COLORS.white,
    },
    switch_container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    switch_left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    switch_label: {
        fontSize: 15,
        color: '#333',
    },
    buttons_container: {
        padding: 15,
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
    no_categories_text: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        fontStyle: 'italic',
        paddingVertical: 20,
    },
});

export default AdminProductFormScreen;
