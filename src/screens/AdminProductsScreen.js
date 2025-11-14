import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    Image,
    TextInput,
    Alert,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { getAllProducts, updateProduct, deleteProduct } from '../services/productsService';

const AdminProductsScreen = ({ navigation }) => {
    const [products, set_products] = useState([]);
    const [filtered_products, set_filtered_products] = useState([]);
    const [search_query, set_search_query] = useState('');
    const [filter_status, set_filter_status] = useState('all'); // all, active, inactive
    const [refreshing, set_refreshing] = useState(false);
    const [loading, set_loading] = useState(true);

    useEffect(() => {
        load_products();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            load_products();
        });
        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        apply_filters();
    }, [search_query, filter_status, products]);

    const load_products = async () => {
        try {
            set_loading(true);
            const { data, error } = await getAllProducts();

            if (error) {
                console.error('Error cargando productos:', error);
                Alert.alert('Error', 'No se pudieron cargar los productos');
                return;
            }

            set_products(data || []);
        } catch (error) {
            console.error('Error al cargar productos:', error);
            Alert.alert('Error', 'Ocurrió un error al cargar los productos');
        } finally {
            set_loading(false);
            set_refreshing(false);
        }
    };

    const apply_filters = () => {
        let filtered = [...products];

        // Filtrar por búsqueda
        if (search_query) {
            filtered = filtered.filter((product) =>
                product.name.toLowerCase().includes(search_query.toLowerCase())
            );
        }

        // Filtrar por estado
        if (filter_status === 'active') {
            filtered = filtered.filter((p) => p.is_active);
        } else if (filter_status === 'inactive') {
            filtered = filtered.filter((p) => !p.is_active);
        }

        set_filtered_products(filtered);
    };

    const on_refresh = async () => {
        set_refreshing(true);
        await load_products();
    };

    const toggle_product_status = async (product_id) => {
        try {
            // Find the product to toggle
            const product = products.find((p) => p.product_id === product_id);
            if (!product) return;

            // Update in database
            const { data, error } = await updateProduct(product_id, {
                is_active: !product.is_active,
            });

            if (error) {
                console.error('Error actualizando estado:', error);
                Alert.alert('Error', 'No se pudo actualizar el estado del producto');
                return;
            }

            // Update local state
            const updated_products = products.map((p) =>
                p.product_id === product_id ? { ...p, is_active: !p.is_active } : p
            );
            set_products(updated_products);

            Alert.alert(
                'Éxito',
                `Producto ${product.is_active ? 'desactivado' : 'activado'} correctamente`
            );
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            Alert.alert('Error', 'Ocurrió un error al actualizar el producto');
        }
    };

    const handle_delete_product = async (product_id) => {
        Alert.alert(
            'Eliminar Producto',
            '¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { error } = await deleteProduct(product_id);

                            if (error) {
                                console.error('Error eliminando producto:', error);
                                Alert.alert('Error', 'No se pudo eliminar el producto');
                                return;
                            }

                            // Update local state
                            const updated_products = products.filter(
                                (p) => p.product_id !== product_id
                            );
                            set_products(updated_products);

                            Alert.alert('Éxito', 'Producto eliminado correctamente');
                        } catch (error) {
                            console.error('Error al eliminar producto:', error);
                            Alert.alert('Error', 'Ocurrió un error al eliminar el producto');
                        }
                    },
                },
            ]
        );
    };

    const render_product = ({ item }) => {
        const stock = item.stock || 0;
        const isLowStock = stock < 10;
        const imageSource = item.image_url ? { uri: item.image_url } : item.image;

        return (
            <View style={styles.product_card}>
                <Image source={imageSource} style={styles.product_image} />

                <View style={styles.product_info}>
                    <Text style={styles.product_name} numberOfLines={2}>
                        {item.name}
                    </Text>
                    <Text style={styles.product_price}>${item.price} MXN</Text>

                    <View style={styles.product_meta}>
                        <View style={styles.stock_container}>
                            <Ionicons
                                name="cube-outline"
                                size={14}
                                color={isLowStock ? '#F44336' : '#4CAF50'}
                            />
                            <Text
                                style={[
                                    styles.stock_text,
                                    { color: isLowStock ? '#F44336' : '#4CAF50' },
                                ]}
                            >
                                Stock: {stock}
                            </Text>
                            {isLowStock && (
                                <Ionicons name="warning" size={14} color="#F44336" />
                            )}
                        </View>

                        <View
                            style={[
                                styles.status_badge,
                                { backgroundColor: item.is_active ? '#E8F5E9' : '#FFEBEE' },
                            ]}
                        >
                            <View
                                style={[
                                    styles.status_dot,
                                    { backgroundColor: item.is_active ? '#4CAF50' : '#F44336' },
                                ]}
                            />
                            <Text
                                style={[
                                    styles.status_text,
                                    { color: item.is_active ? '#4CAF50' : '#F44336' },
                                ]}
                            >
                                {item.is_active ? 'Activo' : 'Inactivo'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.actions_container}>
                    <TouchableOpacity
                        style={[styles.action_button, { backgroundColor: '#2196F3' }]}
                        onPress={() =>
                            navigation.navigate('AdminProductForm', { product: item })
                        }
                    >
                        <Ionicons name="create-outline" size={18} color={COLORS.white} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.action_button,
                            { backgroundColor: item.is_active ? '#FF9800' : '#4CAF50' },
                        ]}
                        onPress={() => toggle_product_status(item.product_id)}
                    >
                        <Ionicons
                            name={item.is_active ? 'pause' : 'play'}
                            size={18}
                            color={COLORS.white}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.action_button, { backgroundColor: '#F44336' }]}
                        onPress={() => handle_delete_product(item.product_id)}
                    >
                        <Ionicons name="trash-outline" size={18} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.header_title}>Productos</Text>
                </View>
                <View style={styles.loading_container}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loading_text}>Cargando productos...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.header_content}>
                    <Text style={styles.header_title}>Productos</Text>
                    <TouchableOpacity
                        style={styles.add_button}
                        onPress={() => navigation.navigate('AdminProductForm')}
                    >
                        <Ionicons name="add-circle" size={28} color={COLORS.white} />
                        <Text style={styles.add_button_text}>Nuevo</Text>
                    </TouchableOpacity>
                </View>

                {/* Barra de búsqueda */}
                <View style={styles.search_container}>
                    <Ionicons name="search" size={20} color="#999" style={styles.search_icon} />
                    <TextInput
                        style={styles.search_input}
                        placeholder="Buscar productos..."
                        placeholderTextColor="#999"
                        value={search_query}
                        onChangeText={set_search_query}
                    />
                    {search_query.length > 0 && (
                        <TouchableOpacity onPress={() => set_search_query('')}>
                            <Ionicons name="close-circle" size={20} color="#999" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filtros */}
                <View style={styles.filters_container}>
                    <TouchableOpacity
                        style={[
                            styles.filter_chip,
                            filter_status === 'all' && styles.filter_chip_active,
                        ]}
                        onPress={() => set_filter_status('all')}
                    >
                        <Text
                            style={[
                                styles.filter_text,
                                filter_status === 'all' && styles.filter_text_active,
                            ]}
                        >
                            Todos
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.filter_chip,
                            filter_status === 'active' && styles.filter_chip_active,
                        ]}
                        onPress={() => set_filter_status('active')}
                    >
                        <Text
                            style={[
                                styles.filter_text,
                                filter_status === 'active' && styles.filter_text_active,
                            ]}
                        >
                            Activos
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.filter_chip,
                            filter_status === 'inactive' && styles.filter_chip_active,
                        ]}
                        onPress={() => set_filter_status('inactive')}
                    >
                        <Text
                            style={[
                                styles.filter_text,
                                filter_status === 'inactive' && styles.filter_text_active,
                            ]}
                        >
                            Inactivos
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Lista de productos */}
            <FlatList
                data={filtered_products}
                renderItem={render_product}
                keyExtractor={(item) => item.product_id?.toString() || item.id?.toString()}
                contentContainerStyle={styles.list_container}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={on_refresh} />
                }
                ListEmptyComponent={
                    <View style={styles.empty_container}>
                        <Ionicons name="cube-outline" size={80} color="#ccc" />
                        <Text style={styles.empty_text}>No hay productos</Text>
                        <Text style={styles.empty_subtext}>
                            Toca el botón + para agregar uno
                        </Text>
                    </View>
                }
            />
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
    },
    header_content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
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
    search_container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        marginBottom: 15,
    },
    search_icon: {
        marginRight: 10,
    },
    search_input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    filters_container: {
        flexDirection: 'row',
        gap: 10,
    },
    filter_chip: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    filter_chip_active: {
        backgroundColor: COLORS.white,
    },
    filter_text: {
        fontSize: 14,
        color: COLORS.white,
        fontWeight: '600',
    },
    filter_text_active: {
        color: COLORS.primary,
    },
    list_container: {
        padding: 15,
    },
    product_card: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    product_image: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    product_info: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between',
    },
    product_name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    product_price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 8,
    },
    product_meta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stock_container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    stock_text: {
        fontSize: 13,
        fontWeight: '600',
    },
    status_badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    status_dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    status_text: {
        fontSize: 12,
        fontWeight: '600',
    },
    actions_container: {
        justifyContent: 'space-around',
        marginLeft: 8,
    },
    action_button: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
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
});

export default AdminProductsScreen;
