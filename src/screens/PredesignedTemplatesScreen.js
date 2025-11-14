import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    Image,
    ScrollView,
    Modal,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { getAllDesigns, getDesignsByCategory, getDesignCategories } from '../services/designsService';
import CustomButton from '../components/CustomButton';

const PredesignedTemplatesScreen = ({ navigation }) => {
    const [selected_category, set_selected_category] = useState('all');
    const [selected_template, set_selected_template] = useState(null);
    const [modal_visible, set_modal_visible] = useState(false);
    const [designs, set_designs] = useState([]);
    const [categories, set_categories] = useState([]);
    const [loading, set_loading] = useState(true);
    const [refreshing, set_refreshing] = useState(false);

    useEffect(() => {
        load_data();
    }, []);

    const load_data = async () => {
        try {
            set_loading(true);

            // Cargar diseños y categorías en paralelo
            const [designsResult, categoriesResult] = await Promise.all([
                getAllDesigns(),
                getDesignCategories()
            ]);

            if (designsResult.error) {
                console.error('Error cargando diseños:', designsResult.error);
            } else {
                set_designs(designsResult.data || []);
            }

            if (categoriesResult.error) {
                console.error('Error cargando categorías:', categoriesResult.error);
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

    const get_filtered_templates = () => {
        if (selected_category === 'all') return designs;
        return designs.filter((d) => d.category === selected_category);
    };

    const open_template_detail = (template) => {
        set_selected_template(template);
        set_modal_visible(true);
    };

    const close_modal = () => {
        set_modal_visible(false);
        set_selected_template(null);
    };

    const render_template = ({ item }) => (
        <TouchableOpacity
            style={styles.template_card}
            onPress={() => open_template_detail(item)}
        >
            <Image
                source={{ uri: item.image_url }}
                style={styles.template_image}
                defaultSource={require('../../img/t1.jpeg')}
            />
            <View style={styles.template_overlay}>
                <Text style={styles.template_name}>{item.name}</Text>
                <View style={styles.price_badge}>
                    <Text style={styles.price_text}>+${item.price} MXN</Text>
                </View>
            </View>
            {item.is_customizable && (
                <View style={styles.customizable_badge}>
                    <Ionicons name="create" size={14} color={COLORS.white} />
                    <Text style={styles.customizable_text}>Personalizable</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    const render_category = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.category_chip,
                selected_category === item.category_id && styles.category_chip_active,
            ]}
            onPress={() => set_selected_category(item.category_id)}
        >
            <Ionicons
                name={item.icon}
                size={18}
                color={selected_category === item.category_id ? COLORS.primary : '#666'}
            />
            <Text
                style={[
                    styles.category_text,
                    selected_category === item.category_id && styles.category_text_active,
                ]}
            >
                {item.name}
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back_button}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.header_title}>Diseños Prediseñados</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Categorías */}
            <View style={styles.categories_section}>
                {loading ? (
                    <ActivityIndicator size="small" color={COLORS.primary} style={{ padding: 10 }} />
                ) : (
                    <FlatList
                        data={categories}
                        renderItem={render_category}
                        keyExtractor={(item) => item.category_id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categories_list}
                    />
                )}
            </View>

            {/* Grid de diseños */}
            {loading ? (
                <View style={styles.loading_container}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loading_text}>Cargando diseños...</Text>
                </View>
            ) : (
                <FlatList
                    data={get_filtered_templates()}
                    renderItem={render_template}
                    keyExtractor={(item) => item.design_id.toString()}
                    numColumns={2}
                    contentContainerStyle={styles.templates_grid}
                    columnWrapperStyle={styles.grid_row}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handle_refresh}
                            colors={[COLORS.primary]}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.empty_container}>
                            <Ionicons name="images-outline" size={60} color="#ccc" />
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

            {/* Modal de detalle */}
            <Modal
                visible={modal_visible}
                animationType="slide"
                transparent={true}
                onRequestClose={close_modal}
            >
                <View style={styles.modal_overlay}>
                    <View style={styles.modal_container}>
                        <View style={styles.modal_header}>
                            <Text style={styles.modal_title}>
                                {selected_template?.name}
                            </Text>
                            <TouchableOpacity onPress={close_modal}>
                                <Ionicons name="close" size={28} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modal_content}>
                            <Image
                                source={{ uri: selected_template?.image_url }}
                                style={styles.detail_image}
                                defaultSource={require('../../img/t1.jpeg')}
                            />

                            <View style={styles.detail_section}>
                                <Text style={styles.detail_label}>Descripción</Text>
                                <Text style={styles.detail_text}>
                                    {selected_template?.description}
                                </Text>
                            </View>

                            <View style={styles.detail_section}>
                                <Text style={styles.detail_label}>Precio adicional</Text>
                                <Text style={styles.detail_price}>
                                    +${selected_template?.price} MXN
                                </Text>
                            </View>

                            {selected_template?.colors && selected_template.colors.length > 0 && (
                                <View style={styles.detail_section}>
                                    <Text style={styles.detail_label}>Colores disponibles</Text>
                                    <View style={styles.colors_row}>
                                        {selected_template.colors.map((color, index) => (
                                            <View
                                                key={index}
                                                style={[
                                                    styles.color_circle,
                                                    { backgroundColor: color },
                                                ]}
                                            />
                                        ))}
                                    </View>
                                </View>
                            )}

                            {selected_template?.is_customizable && (
                                <View style={styles.customizable_info}>
                                    <Ionicons name="information-circle" size={20} color="#2196F3" />
                                    <Text style={styles.customizable_info_text}>
                                        Este diseño puede personalizarse con tu texto
                                    </Text>
                                </View>
                            )}

                            <CustomButton
                                title="USAR ESTE DISEÑO"
                                onPress={() => {
                                    close_modal();
                                    // Aquí se integraría con la pantalla de productos
                                    navigation.navigate('Categories');
                                }}
                                style={styles.use_button}
                            />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
        paddingHorizontal: 15,
        paddingVertical: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    back_button: {
        padding: 5,
    },
    header_title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
        flex: 1,
        textAlign: 'center',
    },
    placeholder: {
        width: 34,
    },
    categories_section: {
        backgroundColor: COLORS.white,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    categories_list: {
        paddingHorizontal: 15,
    },
    category_chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        marginRight: 10,
        gap: 6,
    },
    category_chip_active: {
        backgroundColor: COLORS.primaryLight,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    category_text: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    category_text_active: {
        color: COLORS.primary,
    },
    templates_grid: {
        padding: 15,
    },
    grid_row: {
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    template_card: {
        width: '48%',
        borderRadius: 15,
        overflow: 'hidden',
        backgroundColor: COLORS.white,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    template_image: {
        width: '100%',
        height: 180,
        backgroundColor: '#f0f0f0',
    },
    template_overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 10,
    },
    template_name: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 4,
    },
    price_badge: {
        alignSelf: 'flex-start',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    price_text: {
        fontSize: 11,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    customizable_badge: {
        position: 'absolute',
        top: 10,
        right: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(76, 175, 80, 0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    customizable_text: {
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.white,
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
    },
    modal_overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modal_container: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '85%',
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
        flex: 1,
    },
    modal_content: {
        padding: 20,
    },
    detail_image: {
        width: '100%',
        height: 250,
        borderRadius: 15,
        marginBottom: 20,
        backgroundColor: '#f0f0f0',
    },
    detail_section: {
        marginBottom: 20,
    },
    detail_label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    detail_text: {
        fontSize: 16,
        color: '#333',
        lineHeight: 22,
    },
    detail_price: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    colors_row: {
        flexDirection: 'row',
        gap: 10,
    },
    color_circle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    customizable_info: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E3F2FD',
        padding: 12,
        borderRadius: 10,
        marginBottom: 20,
        gap: 10,
    },
    customizable_info_text: {
        flex: 1,
        fontSize: 13,
        color: '#1976D2',
        lineHeight: 18,
    },
    use_button: {
        marginBottom: 10,
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
    reload_button: {
        marginTop: 15,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: COLORS.primary,
        borderRadius: 20,
    },
    reload_text: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
});

export default PredesignedTemplatesScreen;
