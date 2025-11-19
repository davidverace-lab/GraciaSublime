import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    TextInput,
    Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import {
    getProductVariants,
    createVariant,
    updateVariant,
    deleteVariant,
    generateShirtVariants,
    generateCapVariants,
    createBulkVariants,
} from '../services/productVariantsService';

const AdminProductVariantsScreen = ({ route, navigation }) => {
    const { product } = route.params;

    const [variants, set_variants] = useState([]);
    const [loading, set_loading] = useState(true);
    const [show_add_form, set_show_add_form] = useState(false);

    // Form states
    const [form_size, set_form_size] = useState('');
    const [form_gender, set_form_gender] = useState(null);
    const [form_stock, set_form_stock] = useState('10');
    const [form_price_adjustment, set_form_price_adjustment] = useState('0');
    const [form_is_available, set_form_is_available] = useState(true);
    const [editing_variant, set_editing_variant] = useState(null);

    const sizes = ['xs', 's', 'm', 'l', 'xl', 'xxl'];

    useEffect(() => {
        load_variants();
    }, []);

    const load_variants = async () => {
        try {
            set_loading(true);
            const { data, error } = await getProductVariants(product.product_id);

            if (error) {
                console.error('Error cargando variantes:', error);
                Alert.alert('Error', 'No se pudieron cargar las variantes');
                return;
            }

            set_variants(data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            set_loading(false);
        }
    };

    const is_shirt = () => product.category_id === 3;
    const is_cap = () => product.category_id === 2;

    const requires_gender = () => is_shirt();

    const reset_form = () => {
        set_form_size('');
        set_form_gender(null);
        set_form_stock('10');
        set_form_price_adjustment('0');
        set_form_is_available(true);
        set_editing_variant(null);
        set_show_add_form(false);
    };

    const handle_add_variant = async () => {
        if (!form_size) {
            Alert.alert('Error', 'Debes seleccionar una talla');
            return;
        }

        if (requires_gender() && !form_gender) {
            Alert.alert('Error', 'Debes seleccionar un género para camisas');
            return;
        }

        const variant_data = {
            product_id: product.product_id,
            size: form_size,
            gender: requires_gender() ? form_gender : null,
            stock: parseInt(form_stock) || 0,
            price_adjustment: parseFloat(form_price_adjustment) || 0,
            is_available: form_is_available,
        };

        try {
            set_loading(true);

            if (editing_variant) {
                // Actualizar variante existente
                const { error } = await updateVariant(editing_variant.variant_id, {
                    stock: variant_data.stock,
                    price_adjustment: variant_data.price_adjustment,
                    is_available: variant_data.is_available,
                });

                if (error) throw error;

                Alert.alert('Éxito', 'Variante actualizada correctamente');
            } else {
                // Crear nueva variante
                const { error } = await createVariant(variant_data);

                if (error) throw error;

                Alert.alert('Éxito', 'Variante creada correctamente');
            }

            reset_form();
            await load_variants();
        } catch (error) {
            console.error('Error guardando variante:', error);
            Alert.alert('Error', error.message || 'No se pudo guardar la variante');
        } finally {
            set_loading(false);
        }
    };

    const handle_edit_variant = (variant) => {
        set_editing_variant(variant);
        set_form_size(variant.size);
        set_form_gender(variant.gender);
        set_form_stock(variant.stock.toString());
        set_form_price_adjustment(variant.price_adjustment.toString());
        set_form_is_available(variant.is_available);
        set_show_add_form(true);
    };

    const handle_delete_variant = (variant) => {
        Alert.alert(
            'Confirmar eliminación',
            `¿Estás seguro de eliminar la talla ${variant.size.toUpperCase()}${variant.gender ? ` (${variant.gender === 'male' ? 'Hombre' : 'Mujer'})` : ''}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            set_loading(true);
                            const { error } = await deleteVariant(variant.variant_id);

                            if (error) throw error;

                            Alert.alert('Éxito', 'Variante eliminada');
                            await load_variants();
                        } catch (error) {
                            console.error('Error eliminando variante:', error);
                            Alert.alert('Error', 'No se pudo eliminar la variante');
                        } finally {
                            set_loading(false);
                        }
                    },
                },
            ]
        );
    };

    const handle_generate_all_variants = async () => {
        const variants_to_create = is_shirt()
            ? generateShirtVariants(product.product_id, 10)
            : is_cap()
            ? generateCapVariants(product.product_id, 10)
            : [];

        if (variants_to_create.length === 0) {
            Alert.alert('Error', 'Este tipo de producto no soporta generación automática de variantes');
            return;
        }

        Alert.alert(
            'Confirmar generación',
            `Se crearán ${variants_to_create.length} variantes de talla. ¿Continuar?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Crear',
                    onPress: async () => {
                        try {
                            set_loading(true);
                            const { error } = await createBulkVariants(variants_to_create);

                            if (error) throw error;

                            Alert.alert('Éxito', `${variants_to_create.length} variantes creadas`);
                            await load_variants();
                        } catch (error) {
                            console.error('Error creando variantes:', error);
                            Alert.alert('Error', error.message || 'No se pudieron crear las variantes');
                        } finally {
                            set_loading(false);
                        }
                    },
                },
            ]
        );
    };

    const render_variant_card = (variant) => (
        <View key={variant.variant_id} style={styles.variant_card}>
            <View style={styles.variant_info}>
                <View style={styles.variant_header}>
                    <View style={styles.size_badge}>
                        <Text style={styles.size_text}>{variant.size.toUpperCase()}</Text>
                    </View>
                    {variant.gender && (
                        <View style={[styles.gender_badge, variant.gender === 'male' ? styles.male_badge : styles.female_badge]}>
                            <Ionicons
                                name={variant.gender === 'male' ? 'male' : 'female'}
                                size={14}
                                color={COLORS.white}
                            />
                            <Text style={styles.gender_text}>
                                {variant.gender === 'male' ? 'Hombre' : 'Mujer'}
                            </Text>
                        </View>
                    )}
                    {!variant.is_available && (
                        <View style={styles.unavailable_badge}>
                            <Text style={styles.unavailable_text}>No disponible</Text>
                        </View>
                    )}
                </View>

                <View style={styles.variant_details}>
                    <View style={styles.detail_row}>
                        <Ionicons name="cube-outline" size={16} color="#666" />
                        <Text style={styles.detail_text}>Stock: {variant.stock}</Text>
                    </View>
                    {variant.price_adjustment !== 0 && (
                        <View style={styles.detail_row}>
                            <Ionicons name="cash-outline" size={16} color="#666" />
                            <Text style={styles.detail_text}>
                                Ajuste: ${variant.price_adjustment > 0 ? '+' : ''}{variant.price_adjustment}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.variant_actions}>
                <TouchableOpacity
                    style={styles.action_button}
                    onPress={() => handle_edit_variant(variant)}
                >
                    <Ionicons name="pencil" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.action_button}
                    onPress={() => handle_delete_variant(variant)}
                >
                    <Ionicons name="trash" size={20} color="#FF6B6B" />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading && variants.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loading_container}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loading_text}>Cargando variantes...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back_button}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.header_title}>Gestionar Tallas</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Product Info */}
            <View style={styles.product_info}>
                <Text style={styles.product_name}>{product.name}</Text>
                <Text style={styles.product_category}>
                    {is_shirt() ? 'Camisa' : is_cap() ? 'Gorra' : 'Producto'}
                </Text>
            </View>

            <ScrollView style={styles.content}>
                {/* Quick Actions */}
                <View style={styles.quick_actions}>
                    <TouchableOpacity
                        style={styles.quick_action_button}
                        onPress={() => set_show_add_form(true)}
                    >
                        <Ionicons name="add-circle" size={24} color={COLORS.primary} />
                        <Text style={styles.quick_action_text}>Agregar Talla</Text>
                    </TouchableOpacity>

                    {(is_shirt() || is_cap()) && variants.length === 0 && (
                        <TouchableOpacity
                            style={[styles.quick_action_button, styles.generate_button]}
                            onPress={handle_generate_all_variants}
                        >
                            <Ionicons name="flash" size={24} color={COLORS.white} />
                            <Text style={[styles.quick_action_text, styles.generate_text]}>
                                Generar Todas
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Add/Edit Form */}
                {show_add_form && (
                    <View style={styles.form_container}>
                        <View style={styles.form_header}>
                            <Text style={styles.form_title}>
                                {editing_variant ? 'Editar Variante' : 'Nueva Variante'}
                            </Text>
                            <TouchableOpacity onPress={reset_form}>
                                <Ionicons name="close" size={24} color={COLORS.textDark} />
                            </TouchableOpacity>
                        </View>

                        {/* Size Selection */}
                        <Text style={styles.label}>Talla *</Text>
                        <View style={styles.size_selector}>
                            {sizes.map(size => (
                                <TouchableOpacity
                                    key={size}
                                    style={[
                                        styles.size_option,
                                        form_size === size && styles.size_option_selected
                                    ]}
                                    onPress={() => set_form_size(size)}
                                    disabled={editing_variant !== null}
                                >
                                    <Text style={[
                                        styles.size_option_text,
                                        form_size === size && styles.size_option_text_selected
                                    ]}>
                                        {size.toUpperCase()}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Gender Selection (for shirts) */}
                        {requires_gender() && (
                            <>
                                <Text style={styles.label}>Género *</Text>
                                <View style={styles.gender_selector}>
                                    <TouchableOpacity
                                        style={[
                                            styles.gender_option,
                                            form_gender === 'male' && styles.gender_option_selected
                                        ]}
                                        onPress={() => set_form_gender('male')}
                                        disabled={editing_variant !== null}
                                    >
                                        <Ionicons
                                            name="male"
                                            size={20}
                                            color={form_gender === 'male' ? COLORS.white : COLORS.primary}
                                        />
                                        <Text style={[
                                            styles.gender_option_text,
                                            form_gender === 'male' && styles.gender_option_text_selected
                                        ]}>
                                            Hombre
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.gender_option,
                                            form_gender === 'female' && styles.gender_option_selected
                                        ]}
                                        onPress={() => set_form_gender('female')}
                                        disabled={editing_variant !== null}
                                    >
                                        <Ionicons
                                            name="female"
                                            size={20}
                                            color={form_gender === 'female' ? COLORS.white : COLORS.primary}
                                        />
                                        <Text style={[
                                            styles.gender_option_text,
                                            form_gender === 'female' && styles.gender_option_text_selected
                                        ]}>
                                            Mujer
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}

                        {/* Stock Input */}
                        <Text style={styles.label}>Stock *</Text>
                        <TextInput
                            style={styles.input}
                            value={form_stock}
                            onChangeText={set_form_stock}
                            keyboardType="numeric"
                            placeholder="Ej: 10"
                        />

                        {/* Price Adjustment */}
                        <Text style={styles.label}>Ajuste de Precio (opcional)</Text>
                        <TextInput
                            style={styles.input}
                            value={form_price_adjustment}
                            onChangeText={set_form_price_adjustment}
                            keyboardType="numeric"
                            placeholder="Ej: 0 (sin ajuste)"
                        />

                        {/* Availability Switch */}
                        <View style={styles.switch_row}>
                            <Text style={styles.label}>Disponible</Text>
                            <Switch
                                value={form_is_available}
                                onValueChange={set_form_is_available}
                                trackColor={{ false: '#ccc', true: COLORS.primary }}
                                thumbColor={COLORS.white}
                            />
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={styles.submit_button}
                            onPress={handle_add_variant}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={COLORS.white} />
                            ) : (
                                <Text style={styles.submit_button_text}>
                                    {editing_variant ? 'Actualizar' : 'Agregar'} Variante
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {/* Variants List */}
                <View style={styles.variants_list}>
                    <Text style={styles.section_title}>
                        Variantes ({variants.length})
                    </Text>

                    {variants.length === 0 ? (
                        <View style={styles.empty_state}>
                            <Ionicons name="shirt-outline" size={60} color="#ccc" />
                            <Text style={styles.empty_text}>No hay variantes creadas</Text>
                            <Text style={styles.empty_subtext}>
                                Agrega tallas para este producto
                            </Text>
                        </View>
                    ) : (
                        variants.map(render_variant_card)
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingVertical: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    back_button: {
        padding: 5,
    },
    header_title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    placeholder: {
        width: 34,
    },
    product_info: {
        backgroundColor: COLORS.white,
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    product_name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginBottom: 4,
    },
    product_category: {
        fontSize: 14,
        color: '#666',
    },
    content: {
        flex: 1,
        padding: 15,
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
    quick_actions: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    quick_action_button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        padding: 15,
        borderRadius: 12,
        gap: 8,
        elevation: 2,
    },
    generate_button: {
        backgroundColor: COLORS.primary,
    },
    quick_action_text: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
    },
    generate_text: {
        color: COLORS.white,
    },
    form_container: {
        backgroundColor: COLORS.white,
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        elevation: 2,
    },
    form_header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    form_title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textDark,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textDark,
        marginBottom: 8,
        marginTop: 12,
    },
    size_selector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 10,
    },
    size_option: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#ddd',
        backgroundColor: COLORS.white,
    },
    size_option_selected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    size_option_text: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textDark,
    },
    size_option_text_selected: {
        color: COLORS.white,
    },
    gender_selector: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },
    gender_option: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: COLORS.primary,
        backgroundColor: COLORS.white,
        gap: 6,
    },
    gender_option_selected: {
        backgroundColor: COLORS.primary,
    },
    gender_option_text: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
    },
    gender_option_text_selected: {
        color: COLORS.white,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: COLORS.white,
        marginBottom: 10,
    },
    switch_row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    submit_button: {
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    submit_button_text: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    section_title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginBottom: 15,
    },
    variants_list: {
        marginTop: 10,
    },
    variant_card: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2,
    },
    variant_info: {
        flex: 1,
    },
    variant_header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    size_badge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    size_text: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: 'bold',
    },
    gender_badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    male_badge: {
        backgroundColor: '#2196F3',
    },
    female_badge: {
        backgroundColor: '#E91E63',
    },
    gender_text: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '600',
    },
    unavailable_badge: {
        backgroundColor: '#FF6B6B',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    unavailable_text: {
        color: COLORS.white,
        fontSize: 11,
        fontWeight: '600',
    },
    variant_details: {
        gap: 6,
    },
    detail_row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detail_text: {
        fontSize: 13,
        color: '#666',
    },
    variant_actions: {
        flexDirection: 'row',
        gap: 10,
    },
    action_button: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
    },
    empty_state: {
        alignItems: 'center',
        padding: 40,
    },
    empty_text: {
        fontSize: 16,
        fontWeight: '600',
        color: '#999',
        marginTop: 15,
    },
    empty_subtext: {
        fontSize: 14,
        color: '#ccc',
        marginTop: 5,
    },
});

export default AdminProductVariantsScreen;
