import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    TextInput,
    Image,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors.js';
import { useProducts } from '../context/ProductsContext.js';
import { useCategories } from '../context/CategoriesContext.js';
import ProductCard from '../components/ProductCard.js';

const CategoriesScreen = ({ navigation, route }) => {
    const [selectedCategory, setSelectedCategory] = useState(route.params?.selectedCategory || null);
    const [searchQuery, setSearchQuery] = useState('');

    // Obtener productos y categorías desde Supabase
    const { products: PRODUCTS, loading: productsLoading } = useProducts();
    const { categories: CATEGORIES, loading: categoriesLoading } = useCategories();

    useEffect(() => {
        if (route.params?.selectedCategory) {
            setSelectedCategory(route.params.selectedCategory);
        }
    }, [route.params?.selectedCategory]);

    // Usar CATEGORIES desde Supabase
    const mainCategories = CATEGORIES;

    // Crear subcategorías dinámicamente basadas en las categorías de Supabase
    const subCategories = CATEGORIES.map(cat => ({
        id: cat.category_id.toString(),
        name: cat.name,
        icon: 'cafe', // Puedes personalizar esto después
        count: PRODUCTS.filter(p => p.category_id === cat.category_id).length,
        category_id: cat.category_id
    }));

    const handleCategoryPress = (category) => {
        setSelectedCategory(category);
    };

    const handleBackToCategories = () => {
        setSelectedCategory(null);
        setSearchQuery('');
    };

    const handleProductPress = (product) => {
        navigation.navigate('ProductDetail', { product });
    };

    // Filtrar productos
    const getFilteredProducts = () => {
        let filtered = PRODUCTS.filter(p => p.category_id === selectedCategory);

        if (searchQuery) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered;
    };

    // Si hay una categoría seleccionada, mostrar productos
    if (selectedCategory) {
        const filteredProducts = getFilteredProducts();
        const categoryName = subCategories.find(c => c.category_id === selectedCategory)?.name || 'Productos';

        return (
            <SafeAreaView style={styles.container}>
                {/* Header con búsqueda */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={handleBackToCategories}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{categoryName}</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Barra de búsqueda */}
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar productos..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Grid de productos */}
                <FlatList
                    data={filteredProducts}
                    renderItem={({ item }) => (
                        <View style={styles.cardWrapper}>
                            <ProductCard
                                product={item}
                                onPress={() => handleProductPress(item)}
                            />
                        </View>
                    )}
                    keyExtractor={(item) => (item.product_id || item.id)?.toString()}
                    numColumns={2}
                    contentContainerStyle={styles.listContent}
                    columnWrapperStyle={styles.row}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="sad-outline" size={60} color="#ccc" />
                            <Text style={styles.emptyText}>No se encontraron productos</Text>
                        </View>
                    }
                />
            </SafeAreaView>
        );
    }

    // Vista por defecto: lista de categorías principales con imágenes
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.headerCentered}>
                <Text style={styles.headerTitleCentered}>CATEGORÍAS</Text>
            </View>

            {/* Grid de categorías principales con imágenes */}
            <FlatList
                data={mainCategories}
                renderItem={({ item, index }) => (
                    <CategoryCardWithImage
                        category={item}
                        index={index}
                        onPress={() => {
                            // Navegar a los productos de esa categoría
                            handleCategoryPress(item.category_id);
                        }}
                    />
                )}
                keyExtractor={(item) => (item.category_id || item.id)?.toString()}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={styles.categoryRow}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

// Componente de categoría con imagen
const CategoryCardWithImage = ({ category, index, onPress }) => {
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const pressAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                delay: index * 100,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                delay: index * 100,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 8,
                delay: index * 100,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handlePressIn = () => {
        Animated.spring(pressAnim, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(pressAnim, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
        }).start();
    };

    const handlePress = () => {
        onPress();
    };

    return (
        <TouchableOpacity
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            activeOpacity={0.8}
            delayPressIn={0}
            style={styles.categoryCardContainer}
        >
            <Animated.View
                style={[
                    styles.categoryImageCard,
                    {
                        opacity: fadeAnim,
                        transform: [
                            { scale: Animated.multiply(scaleAnim, pressAnim) },
                            { translateY: slideAnim },
                        ],
                    },
                ]}
            >
                {/* Imagen de fondo */}
                <Image
                    source={category.image_url ? { uri: category.image_url } : category.image}
                    style={styles.categoryBackgroundImage}
                    resizeMode="cover"
                />

                {/* Gradiente overlay */}
                <LinearGradient
                    colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.65)']}
                    style={styles.categoryGradient}
                >
                    {/* Contenido */}
                    <View style={styles.categoryContent}>
                        <Text style={styles.categoryImageName}>{category.name}</Text>
                        <Text style={styles.categoryImageDescription}>{category.description}</Text>
                    </View>

                    {/* Flecha */}
                    <View style={styles.categoryArrow}>
                        <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
                    </View>
                </LinearGradient>
            </Animated.View>
        </TouchableOpacity>
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
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    headerCentered: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingVertical: 20,
        alignItems: 'center',
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.white,
        flex: 1,
        textAlign: 'center',
    },
    headerTitleCentered: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    placeholder: {
        width: 34,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.inputGray,
        marginHorizontal: 15,
        marginVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 12,
        height: 45,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: COLORS.textDark,
    },
    listContent: {
        padding: 15,
    },
    row: {
        justifyContent: 'space-between',
    },
    cardWrapper: {
        width: '48%',
    },
    categoryCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 6,
        borderWidth: 1,
        borderColor: COLORS.inputGray,
    },
    iconContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: COLORS.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    categoryInfo: {
        flex: 1,
    },
    categoryName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginBottom: 5,
    },
    categoryCount: {
        fontSize: 14,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 15,
    },
    categoryRow: {
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    categoryCardContainer: {
        width: '48%',
    },
    categoryImageCard: {
        width: '100%',
        height: 200,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 10,
    },
    categoryBackgroundImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    categoryGradient: {
        width: '100%',
        height: '100%',
        padding: 18,
        justifyContent: 'flex-end',
    },
    categoryContent: {
        marginBottom: 5,
    },
    categoryImageName: {
        fontSize: 22,
        fontWeight: '800',
        color: COLORS.white,
        marginBottom: 6,
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.7)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    categoryImageDescription: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.98)',
        lineHeight: 18,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    categoryArrow: {
        position: 'absolute',
        top: 15,
        right: 15,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CategoriesScreen;
