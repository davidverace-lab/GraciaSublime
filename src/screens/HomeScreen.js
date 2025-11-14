import React, { useState, useEffect, useRef } from 'react';
import {
        View,
        Text,
        StyleSheet,
        ScrollView,
        TextInput,
        TouchableOpacity,
        Modal,
        Image,
        Animated,
        Dimensions,
        FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/colors.js';
import { useNotifications } from '../context/NotificationsContext.js';
import { useLocation } from '../context/LocationContext.js';
import { useProducts } from '../context/ProductsContext.js';
import { useCategories } from '../context/CategoriesContext.js';
import CustomInput from '../components/CustomInput.js';
import CategoryCard from '../components/CategoryCard.js';
import ProductCard from '../components/ProductCard.js';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
        const navigation = useNavigation();
        const [search_query, set_search_query] = useState('');
        const [show_location_modal, set_show_location_modal] = useState(false);
        const [show_search_results, set_show_search_results] = useState(false);
        const { get_unread_count } = useNotifications();
        const { address, update_address } = useLocation();
        const [temp_zip_code, set_temp_zip_code] = useState(address.zip_code);

        // Obtener productos y categorías desde Supabase
        const { products: PRODUCTS, loading: productsLoading } = useProducts();
        const { categories: CATEGORIES, loading: categoriesLoading } = useCategories();

        const scrollY = useRef(new Animated.Value(0)).current;

        const handle_save_location = () => {
                update_address({ zip_code: temp_zip_code });
                set_show_location_modal(false);
        };

        // Filtrar productos según búsqueda
        const getSearchResults = () => {
                if (!search_query.trim()) return [];

                const query = search_query.toLowerCase().trim();
                return PRODUCTS.filter(product =>
                        product.name.toLowerCase().includes(query) ||
                        product.description.toLowerCase().includes(query)
                );
        };

        const handleSearch = (text) => {
                set_search_query(text);
                set_show_search_results(text.trim().length > 0);
        };

        const clearSearch = () => {
                set_search_query('');
                set_show_search_results(false);
        };

        // Mostrar loading mientras se cargan los datos
        if (productsLoading || categoriesLoading) {
                return (
                        <SafeAreaView style={styles.container}>
                                <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
                                        <Text style={{ fontSize: 18, color: COLORS.textDark }}>Cargando productos...</Text>
                                </View>
                        </SafeAreaView>
                );
        }

        return (
                <SafeAreaView style={styles.container}>
                        {/* Header amarillo */}
                        <View style={styles.header}>
                                <TouchableOpacity
                                        style={styles.menu_button}
                                        onPress={() => navigation.openDrawer()}
                                >
                                        <Ionicons name="menu" size={28} color={COLORS.white} />
                                </TouchableOpacity>

                                {/* Barra de búsqueda */}
                                <View style={styles.search_container}>
                                        <Ionicons name="search" size={20} color="#999" style={styles.search_icon} />
                                        <TextInput
                                                style={styles.search_input}
                                                placeholder="Buscar tazas..."
                                                placeholderTextColor="#999"
                                                value={search_query}
                                                onChangeText={handleSearch}
                                        />
                                        {search_query.length > 0 && (
                                                <TouchableOpacity onPress={clearSearch} style={styles.clear_button}>
                                                        <Ionicons name="close-circle" size={20} color="#999" />
                                                </TouchableOpacity>
                                        )}
                                </View>

                                <TouchableOpacity
                                        style={styles.notification_button}
                                        onPress={() => navigation.navigate('Notifications')}
                                >
                                        <Ionicons name="notifications" size={28} color={COLORS.white} />
                                        {get_unread_count() > 0 && (
                                                <View style={styles.badge}>
                                                        <Text style={styles.badge_text}>{get_unread_count()}</Text>
                                                </View>
                                        )}
                                </TouchableOpacity>
                        </View>

                        {/* Selector de ubicación */}
                        <TouchableOpacity
                                style={styles.location_bar}
                                onPress={() => set_show_location_modal(true)}
                        >
                                <Ionicons name="location" size={20} color={COLORS.primary} />
                                <Text style={styles.location_text}>
                                        {address.zip_code ? `CP: ${address.zip_code}` : 'Agrega tu código postal'}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color={COLORS.primary} />
                        </TouchableOpacity>

                        {/* Contenido principal */}
                        {show_search_results ? (
                                <View style={styles.content}>
                                        {/* Resultados de búsqueda */}
                                        <View style={styles.searchResultsContainer}>
                                                <View style={styles.searchHeader}>
                                                        <Text style={styles.searchResultsTitle}>
                                                                Resultados de búsqueda
                                                        </Text>
                                                        <Text style={styles.searchResultsCount}>
                                                                {getSearchResults().length} productos encontrados
                                                        </Text>
                                                </View>

                                                {getSearchResults().length > 0 ? (
                                                        <FlatList
                                                                data={getSearchResults()}
                                                                renderItem={({ item }) => (
                                                                        <View style={styles.productWrapper}>
                                                                                <ProductCard
                                                                                        product={item}
                                                                                        onPress={() => {
                                                                                                clearSearch();
                                                                                                navigation.navigate('ProductDetail', { product: item });
                                                                                        }}
                                                                                />
                                                                        </View>
                                                                )}
                                                                keyExtractor={(item) => (item.product_id || item.id)?.toString()}
                                                                numColumns={2}
                                                                contentContainerStyle={styles.searchResultsList}
                                                                columnWrapperStyle={styles.searchResultsRow}
                                                                showsVerticalScrollIndicator={false}
                                                        />
                                                ) : (
                                                        <View style={styles.noResultsContainer}>
                                                                <Ionicons name="search-outline" size={80} color="#ccc" />
                                                                <Text style={styles.noResultsTitle}>No encontramos resultados</Text>
                                                                <Text style={styles.noResultsText}>
                                                                        Intenta con otras palabras clave
                                                                </Text>
                                                        </View>
                                                )}
                                        </View>
                                </View>
                        ) : (
                                <Animated.ScrollView
                                        style={styles.content}
                                        showsVerticalScrollIndicator={false}
                                        onScroll={Animated.event(
                                                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                                                { useNativeDriver: true }
                                        )}
                                        scrollEventThrottle={16}
                                >
                                        {/* Sección de Categorías */}
                                        <View style={styles.section}>
                                                <View style={styles.sectionHeader}>
                                                        <Text style={styles.sectionTitle}>Categorías</Text>
                                                        <Text style={styles.sectionSubtitle}>Explora nuestros productos</Text>
                                                </View>

                                                <View style={styles.categoriesGrid}>
                                                        {CATEGORIES.map((category, index) => (
                                                                <CategoryCard
                                                                        key={category.category_id || category.id}
                                                                        category={category}
                                                                        index={index}
                                                                        onPress={() => {
                                                                                // Navegar a categorías con la categoría seleccionada
                                                                                navigation.navigate('Categories', {
                                                                                        selectedCategory: category.category_id
                                                                                });
                                                                        }}
                                                                />
                                                        ))}
                                                </View>
                                        </View>

                                        {/* Banner de Diseños Prediseñados */}
                                        <TouchableOpacity
                                                style={styles.designsBanner}
                                                onPress={() => navigation.navigate('PredesignedTemplates')}
                                        >
                                                <View style={styles.bannerContent}>
                                                        <View style={styles.bannerIcon}>
                                                                <Ionicons name="color-palette" size={32} color={COLORS.white} />
                                                        </View>
                                                        <View style={styles.bannerTextContainer}>
                                                                <Text style={styles.bannerTitle}>Diseños Prediseñados</Text>
                                                                <Text style={styles.bannerSubtitle}>
                                                                        Listos para personalizar tu taza
                                                                </Text>
                                                        </View>
                                                        <Ionicons name="arrow-forward" size={24} color={COLORS.white} />
                                                </View>
                                        </TouchableOpacity>

                                        {/* Productos Destacados */}
                                        <View style={styles.section}>
                                                <View style={styles.sectionHeader}>
                                                        <Text style={styles.sectionTitle}>Productos Destacados</Text>
                                                        <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
                                                                <Text style={styles.seeAllText}>Ver todo</Text>
                                                        </TouchableOpacity>
                                                </View>

                                                <View style={styles.productsContainer}>
                                                        {PRODUCTS.slice(0, 4).map((product) => (
                                                                <View key={product.product_id || product.id} style={styles.productWrapper}>
                                                                        <ProductCard
                                                                                product={product}
                                                                                onPress={() =>
                                                                                        navigation.navigate('ProductDetail', { product })
                                                                                }
                                                                        />
                                                                </View>
                                                        ))}
                                                </View>
                                        </View>

                                        {/* Espaciado final */}
                                        <View style={{ height: 30 }} />
                                </Animated.ScrollView>
                        )}

                        {/* Modal de ubicación */}
                        <Modal
                                visible={show_location_modal}
                                transparent
                                animationType="slide"
                                onRequestClose={() => set_show_location_modal(false)}
                        >
                                <View style={styles.modal_overlay}>
                                        <View style={styles.modal_content}>
                                                <View style={styles.modal_header}>
                                                        <Ionicons name="location" size={32} color={COLORS.primary} />
                                                        <Text style={styles.modal_title}>Tu Ubicación</Text>
                                                </View>
                                                <Text style={styles.modal_subtitle}>
                                                        Ingresa tu código postal para calcular costos de envío
                                                </Text>

                                                <View style={styles.input_container}>
                                                        <CustomInput
                                                                placeholder="Código Postal (ej: 01000)"
                                                                value={temp_zip_code}
                                                                on_change_text={set_temp_zip_code}
                                                                keyboard_type="numeric"
                                                                maxLength={5}
                                                        />
                                                </View>

                                                <View style={styles.modal_buttons}>
                                                        <TouchableOpacity
                                                                style={[styles.modal_button, styles.cancel_button]}
                                                                onPress={() => {
                                                                        set_temp_zip_code(address.zip_code);
                                                                        set_show_location_modal(false);
                                                                }}
                                                        >
                                                                <Text style={styles.cancel_button_text}>Cancelar</Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                                style={[styles.modal_button, styles.save_button]}
                                                                onPress={handle_save_location}
                                                        >
                                                                <Text style={styles.save_button_text}>Guardar</Text>
                                                        </TouchableOpacity>
                                                </View>
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
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 5,
        },
        menu_button: {
                padding: 5,
        },
        notification_button: {
                padding: 5,
                position: 'relative',
        },
        badge: {
                position: 'absolute',
                top: 2,
                right: 2,
                backgroundColor: '#E03C3C',
                borderRadius: 10,
                minWidth: 20,
                height: 20,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 4,
        },
        badge_text: {
                color: COLORS.white,
                fontSize: 11,
                fontWeight: 'bold',
        },
        search_container: {
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.white,
                borderRadius: 12,
                paddingHorizontal: 15,
                marginHorizontal: 15,
                height: 45,
        },
        search_icon: {
                marginRight: 10,
        },
        search_input: {
                flex: 1,
                fontSize: 15,
                color: COLORS.textDark,
        },
        location_bar: {
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.primaryLight,
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderBottomWidth: 1,
                borderBottomColor: '#f0f0f0',
        },
        location_text: {
                flex: 1,
                marginLeft: 10,
                fontSize: 14,
                color: COLORS.textDark,
                fontWeight: '500',
        },
        content: {
                flex: 1,
        },
        section: {
                paddingHorizontal: 20,
                marginBottom: 30,
                marginTop: 20,
        },
        sectionHeader: {
                marginBottom: 20,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
        },
        sectionTitle: {
                fontSize: 24,
                fontWeight: '800',
                color: COLORS.textDark,
                marginBottom: 4,
        },
        sectionSubtitle: {
                fontSize: 14,
                color: '#666',
        },
        seeAllText: {
                fontSize: 14,
                fontWeight: '600',
                color: COLORS.primary,
        },
        categoriesGrid: {
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
        },
        productsContainer: {
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
        },
        productWrapper: {
                width: '48%',
                marginBottom: 15,
        },
        designsBanner: {
                marginHorizontal: 20,
                marginBottom: 20,
                borderRadius: 20,
                backgroundColor: COLORS.primary,
                overflow: 'hidden',
                elevation: 5,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
        },
        bannerContent: {
                flexDirection: 'row',
                alignItems: 'center',
                padding: 20,
        },
        bannerIcon: {
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: 'rgba(255,255,255,0.2)',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 15,
        },
        bannerTextContainer: {
                flex: 1,
        },
        bannerTitle: {
                fontSize: 18,
                fontWeight: 'bold',
                color: COLORS.white,
                marginBottom: 4,
        },
        bannerSubtitle: {
                fontSize: 13,
                color: 'rgba(255,255,255,0.9)',
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
                alignItems: 'center',
                marginBottom: 10,
        },
        modal_title: {
                fontSize: 24,
                fontWeight: 'bold',
                color: COLORS.textDark,
                marginTop: 10,
        },
        modal_subtitle: {
                fontSize: 14,
                color: '#666',
                textAlign: 'center',
                marginBottom: 25,
        },
        input_container: {
                marginBottom: 20,
        },
        modal_buttons: {
                flexDirection: 'row',
                justifyContent: 'space-between',
        },
        modal_button: {
                flex: 1,
                paddingVertical: 15,
                borderRadius: 15,
                alignItems: 'center',
                marginHorizontal: 5,
        },
        cancel_button: {
                backgroundColor: '#f0f0f0',
        },
        cancel_button_text: {
                fontSize: 16,
                fontWeight: '600',
                color: '#666',
        },
        save_button: {
                backgroundColor: COLORS.primary,
        },
        save_button_text: {
                fontSize: 16,
                fontWeight: '600',
                color: COLORS.white,
        },
        clear_button: {
                padding: 5,
        },
        searchResultsContainer: {
                flex: 1,
                padding: 15,
        },
        searchHeader: {
                marginBottom: 20,
        },
        searchResultsTitle: {
                fontSize: 22,
                fontWeight: '800',
                color: COLORS.textDark,
                marginBottom: 5,
        },
        searchResultsCount: {
                fontSize: 14,
                color: '#666',
        },
        searchResultsList: {
                paddingBottom: 20,
        },
        searchResultsRow: {
                justifyContent: 'space-between',
                marginBottom: 15,
        },
        noResultsContainer: {
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingTop: 100,
        },
        noResultsTitle: {
                fontSize: 20,
                fontWeight: '700',
                color: '#666',
                marginTop: 20,
                marginBottom: 10,
        },
        noResultsText: {
                fontSize: 14,
                color: '#999',
                textAlign: 'center',
        },
});

export default HomeScreen;
