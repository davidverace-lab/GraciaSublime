import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Modal,
    FlatList,
    Image,
    Animated,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../constants/colors.js';
import CustomButton from '../components/CustomButton.js';
import QuantityCounter from '../components/QuantityCounter.js';
import { useCart } from '../context/CartContext.js';
import { useFavorites } from '../context/FavoritesContext.js';
import { PRODUCTS } from '../data/products.js';
import ProductCard from '../components/ProductCard.js';
import { PREDESIGNED_TEMPLATES, DESIGN_CATEGORIES } from '../data/predesignedTemplates.js';
import { getVariantsByGender, findVariant } from '../services/productVariantsService.js';

const TAZA_DESIGNS = [
    { id: 1, name: 'Clásica Blanca', icon: 'cafe', color: '#FFFFFF' },
    { id: 2, name: 'Corazón Rosa', icon: 'heart', color: '#FFB6C1' },
    { id: 3, name: 'Estrella Dorada', icon: 'star', color: '#FFD700' },
    { id: 4, name: 'Luna Azul', icon: 'moon', color: '#87CEEB' },
    { id: 5, name: 'Sol Amarillo', icon: 'sunny', color: '#FDB913' },
    { id: 6, name: 'Flor Verde', icon: 'flower', color: '#90EE90' },
    { id: 7, name: 'Diamante Púrpura', icon: 'diamond', color: '#DDA0DD' },
    { id: 8, name: 'Regalo Rojo', icon: 'gift', color: '#FF6B6B' },
];

// Reseñas de ejemplo
const MOCK_REVIEWS = [
    {
        id: 1,
        userName: 'María González',
        rating: 5,
        date: '2025-01-05',
        comment: 'Excelente calidad! La impresión quedó perfecta y el acabado es muy profesional. Totalmente recomendado.',
    },
    {
        id: 2,
        userName: 'Carlos Ramírez',
        rating: 4,
        date: '2025-01-03',
        comment: 'Muy buena taza, la personalización es hermosa. Solo le resto una estrella porque tardó un poco en llegar.',
    },
    {
        id: 3,
        userName: 'Ana Martínez',
        rating: 5,
        date: '2024-12-28',
        comment: 'Me encantó! Compré varias para regalar en Navidad y todos quedaron fascinados. La calidad es increíble.',
    },
    {
        id: 4,
        userName: 'Jorge López',
        rating: 5,
        date: '2024-12-20',
        comment: 'Producto de primera calidad. La taza es resistente y el diseño no se desvanece con los lavados.',
    },
    {
        id: 5,
        userName: 'Laura Hernández',
        rating: 4,
        date: '2024-12-15',
        comment: 'Muy linda taza, el tamaño es perfecto para mi café mañanero. Buena relación calidad-precio.',
    },
];

const ProductDetailScreen = ({ navigation, route }) => {
    const { product } = route.params;
    const { add_to_cart, get_item_count } = useCart();
    const { is_favorite, toggle_favorite } = useFavorites();
    const [quantity, set_quantity] = useState(1);
    const [selected_design, set_selected_design] = useState(null);
    const [show_design_modal, set_show_design_modal] = useState(false);
    const [show_reviews_modal, set_show_reviews_modal] = useState(false);
    const [custom_image, set_custom_image] = useState(null);
    const [search_query, set_search_query] = useState('');
    const [selected_template, set_selected_template] = useState(null);
    const [template_category, set_template_category] = useState('all');

    // Estados para tallas y variantes
    const [variants, set_variants] = useState({ male: [], female: [], unisex: [] });
    const [selected_size, set_selected_size] = useState(null);
    const [selected_gender, set_selected_gender] = useState(null);
    const [selected_variant, set_selected_variant] = useState(null);
    const [loading_variants, set_loading_variants] = useState(false);

    // Animaciones
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Animación de entrada
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();

        // Animación de pulso para botón flotante
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    // Log cuando cambia la imagen personalizada
    useEffect(() => {
        if (custom_image) {
            console.log('custom_image actualizado:', custom_image);
        }
    }, [custom_image]);

    // Cargar variantes del producto
    useEffect(() => {
        const load_variants = async () => {
            // Solo cargar variantes si el producto es camisa (category_id: 3) o gorra (category_id: 2)
            const category_id = product.category_id || product.categories?.category_id;

            if (!category_id || (category_id !== 2 && category_id !== 3)) {
                // No es camisa ni gorra, no necesita tallas
                return;
            }

            set_loading_variants(true);
            try {
                const { data, error } = await getVariantsByGender(product.product_id);

                if (error) {
                    console.error('Error cargando variantes:', error);
                    return;
                }

                set_variants(data);

                // Si solo hay un tipo (unisex para gorras), auto-seleccionar
                if (data.unisex.length > 0 && data.male.length === 0 && data.female.length === 0) {
                    set_selected_gender('unisex');
                }
            } catch (error) {
                console.error('Error en load_variants:', error);
            } finally {
                set_loading_variants(false);
            }
        };

        load_variants();
    }, [product]);

    // Actualizar variante seleccionada cuando cambian género o talla
    useEffect(() => {
        const update_selected_variant = async () => {
            if (!selected_size) {
                set_selected_variant(null);
                return;
            }

            try {
                const { data, error } = await findVariant(
                    product.product_id,
                    selected_size,
                    selected_gender === 'unisex' ? null : selected_gender
                );

                if (error) {
                    console.error('Error buscando variante:', error);
                    set_selected_variant(null);
                    return;
                }

                set_selected_variant(data);
            } catch (error) {
                console.error('Error en update_selected_variant:', error);
                set_selected_variant(null);
            }
        };

        update_selected_variant();
    }, [selected_size, selected_gender, product]);

    // Calcular rating promedio
    const average_rating = MOCK_REVIEWS.reduce((acc, review) => acc + review.rating, 0) / MOCK_REVIEWS.length;

    // Obtener productos relacionados de la misma categoría
    const related_products = PRODUCTS.filter(
        p => p.category === product.category && p.id !== product.id
    ).slice(0, 4);

    const handle_increment = () => {
        set_quantity(quantity + 1);
    };

    const handle_decrement = () => {
        if (quantity > 1) {
            set_quantity(quantity - 1);
        }
    };

    const handle_select_design = (design) => {
        set_selected_design(design);
        set_selected_template(null);
        set_custom_image(null);
        set_show_design_modal(false);
        Alert.alert(
            'Diseño seleccionado',
            `Has seleccionado el diseño ${design.name}`
        );
    };

    const handle_select_template = (template) => {
        set_selected_template(template);
        set_selected_design(null);
        set_custom_image(null);
        set_show_design_modal(false);
        Alert.alert(
            '✓ Diseño Cargado',
            `Has seleccionado "${template.name}". Precio adicional: +$${template.price} MXN`,
            [{ text: 'OK' }]
        );
    };

    const get_filtered_templates = () => {
        if (template_category === 'all') return PREDESIGNED_TEMPLATES;
        return PREDESIGNED_TEMPLATES.filter((t) => t.category === template_category);
    };

    const handle_add_to_cart = async () => {
        try {
            // Verificar si el producto requiere talla (camisas o gorras)
            const category_id = product.category_id || product.categories?.category_id;
            const requires_size = category_id === 2 || category_id === 3; // Gorras o Camisas

            if (requires_size && !selected_variant) {
                Alert.alert(
                    'Selecciona una talla',
                    category_id === 3
                        ? 'Por favor selecciona el género y la talla antes de agregar al carrito'
                        : 'Por favor selecciona una talla antes de agregar al carrito'
                );
                return;
            }

            // Verificar stock de la variante
            if (requires_size && selected_variant) {
                if (!selected_variant.is_available || selected_variant.stock < quantity) {
                    Alert.alert(
                        'Sin stock suficiente',
                        `Solo hay ${selected_variant.stock} unidades disponibles de esta talla`
                    );
                    return;
                }
            }

            const final_price = selected_template
                ? product.price + selected_template.price
                : product.price;

            // Preparar objeto de personalización
            const customization = {
                custom_image: custom_image || null,
                custom_design: selected_design || null,
                design_name: selected_design?.name || selected_template?.name || null,
            };

            console.log('📦 Agregando al carrito con personalización:', customization);
            console.log('🖼️ Imagen personalizada:', custom_image);
            console.log('🎨 Diseño seleccionado:', selected_design);

            // Agregar al carrito con personalización
            const result = await add_to_cart({
                ...product,
                price: final_price,
                variant_id: selected_variant?.variant_id,
                selected_size,
                selected_gender: selected_gender === 'unisex' ? null : selected_gender,
            }, quantity, customization);

            console.log('✅ Resultado de agregar al carrito:', result);

            if (result.success) {
                Alert.alert(
                    'Agregado al Carrito',
                    `${quantity} ${product.name}(s) agregado(s) al carrito`,
                    [
                        { text: 'Seguir comprando', style: 'cancel' },
                        {
                            text: 'Ir al carrito',
                            onPress: () =>
                                navigation.navigate('MainDrawer', {
                                    screen: 'MainTabs',
                                    params: { screen: 'Cart' },
                                }),
                        },
                    ]
                );
            } else {
                Alert.alert('Error', result.error || 'No se pudo agregar al carrito');
            }
        } catch (error) {
            console.error('Error agregando al carrito:', error);
            Alert.alert('Error', 'Ocurrió un error al agregar al carrito');
        }
    };

    const handle_toggle_favorite = async () => {
        try {
            const result = await toggle_favorite(product);
            if (result && !result.success) {
                Alert.alert('Error', result.error || 'No se pudo actualizar favoritos');
            }
        } catch (error) {
            console.error('Error con favoritos:', error);
            Alert.alert('Error', 'Ocurrió un error al actualizar favoritos');
        }
    };

    const render_stars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name={i <= rating ? 'star' : 'star-outline'}
                    size={16}
                    color="#FFD700"
                    style={{ marginRight: 2 }}
                />
            );
        }
        return stars;
    };

    const pick_image = async () => {
        // Solicitar permisos
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert(
                'Permisos Necesarios',
                'Necesitamos permisos para acceder a tu galería de fotos'
            );
            return;
        }

        // Abrir selector de imágenes con filtro para solo JPG y PNG
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 1,
            // Nota: En web también se filtrarán los tipos de archivo
        });

        if (!result.canceled) {
            const imageUri = result.assets[0].uri;
            const fileName = imageUri.split('/').pop().toLowerCase();

            // Verificar que sea JPG o PNG
            if (!fileName.endsWith('.jpg') && !fileName.endsWith('.jpeg') && !fileName.endsWith('.png')) {
                Alert.alert(
                    'Formato no válido',
                    'Por favor selecciona solo imágenes en formato JPG o PNG'
                );
                return;
            }

            // Guardar la imagen directamente sin editor
            console.log('📸 Imagen seleccionada:', imageUri);
            set_custom_image(imageUri);
            set_selected_design(null);
            set_selected_template(null);

            console.log('✅ custom_image actualizado a:', imageUri);
        }
    };

    // Funciones para manejar selección de tallas
    const handle_select_gender = (gender) => {
        set_selected_gender(gender);
        set_selected_size(null); // Resetear talla al cambiar género
        set_selected_variant(null);
    };

    const handle_select_size = (size) => {
        set_selected_size(size);
    };

    // Verificar si el producto requiere tallas
    const requires_size_selection = () => {
        const category_id = product.category_id || product.categories?.category_id;
        return category_id === 2 || category_id === 3; // Gorras o Camisas
    };

    const is_shirt = () => {
        const category_id = product.category_id || product.categories?.category_id;
        return category_id === 3; // Camisas
    };

    const is_cap = () => {
        const category_id = product.category_id || product.categories?.category_id;
        return category_id === 2; // Gorras
    };

    // Función para verificar si un texto coincide con la búsqueda
    const matches_search = (text) => {
        if (!search_query.trim()) return true;
        return text.toLowerCase().includes(search_query.toLowerCase());
    };

    // Filtrar contenido basado en búsqueda
    const should_show_section = (section_content) => {
        if (!search_query.trim()) return true;
        return section_content.some(text => matches_search(text));
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Detalle del Producto</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('MainDrawer', {
                        screen: 'MainTabs',
                        params: { screen: 'Cart' }
                    })}
                    style={styles.cartButton}
                >
                    <Ionicons name="cart-outline" size={26} color={COLORS.white} />
                    {get_item_count() > 0 && (
                        <View style={styles.cartBadge}>
                            <Text style={styles.cartBadgeText}>
                                {get_item_count() > 99 ? '99+' : get_item_count()}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Barra de búsqueda */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar en este producto..."
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
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Imagen del producto */}
                <View style={styles.previewContainer}>
                    {product.image_url ? (
                        <Image
                            source={{ uri: product.image_url }}
                            style={styles.productImage}
                            resizeMode="cover"
                        />
                    ) : product.image ? (
                        <Image
                            source={product.image}
                            style={styles.productImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <Ionicons name="image-outline" size={60} color="#ccc" />
                        </View>
                    )}
                </View>

                {/* Mostrar imagen personalizada si existe */}
                {custom_image && (
                    <View style={styles.customImageContainer}>
                        <View style={styles.customImageHeader}>
                            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                            <Text style={styles.customImageTitle}>Imagen Personalizada</Text>
                            <TouchableOpacity
                                onPress={() => set_custom_image(null)}
                                style={styles.removeImageButton}
                            >
                                <Ionicons name="close-circle" size={20} color="#FF3B30" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.customImagePreview}>
                            <Image
                                source={{ uri: custom_image }}
                                style={styles.customImagePreviewImg}
                                resizeMode="cover"
                            />
                        </View>
                        <Text style={styles.customImageInfo}>
                            Esta imagen se aplicará a tu producto
                        </Text>
                    </View>
                )}

                {/* Información del producto */}
                <View style={styles.infoContainer}>
                    <View style={styles.titleRow}>
                        <View style={styles.titleWithStar}>
                            <Text style={styles.productName}>{product.name}</Text>
                            <TouchableOpacity
                                onPress={() => set_show_reviews_modal(true)}
                                style={styles.starButton}
                            >
                                <Ionicons name="star" size={24} color="#FFD700" />
                                <Text style={styles.ratingTextSmall}>{average_rating.toFixed(1)}</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.price}>${product.price}</Text>
                    </View>

                    {selected_design && (
                        <View style={styles.customBadge}>
                            <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                            <Text style={styles.customBadgeText}>
                                Diseño: {selected_design.name}
                            </Text>
                        </View>
                    )}

                    {selected_template && (
                        <View style={styles.customBadge}>
                            <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                            <Text style={styles.customBadgeText}>
                                Diseño Prediseñado: {selected_template.name} (+${selected_template.price})
                            </Text>
                        </View>
                    )}

                    {/* Botón para abrir modal de diseños */}
                    <TouchableOpacity
                        style={styles.selectDesignButton}
                        onPress={() => set_show_design_modal(true)}
                    >
                        <Ionicons name="color-palette-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.selectDesignText}>
                            {selected_design || selected_template ? 'Cambiar Diseño' : 'Elegir Diseño'}
                        </Text>
                    </TouchableOpacity>

                    {/* Sección de selección de tallas (solo para camisas y gorras) */}
                    {requires_size_selection() && (
                        <View style={styles.sizeSection}>
                            {/* Selección de género (solo para camisas) */}
                            {is_shirt() && variants && (variants.male.length > 0 || variants.female.length > 0) && (
                                <View style={styles.genderSelection}>
                                    <Text style={styles.sizeLabel}>Género:</Text>
                                    <View style={styles.genderButtons}>
                                        {variants.male.length > 0 && (
                                            <TouchableOpacity
                                                style={[
                                                    styles.genderButton,
                                                    selected_gender === 'male' && styles.genderButtonSelected
                                                ]}
                                                onPress={() => handle_select_gender('male')}
                                            >
                                                <Ionicons
                                                    name="male"
                                                    size={20}
                                                    color={selected_gender === 'male' ? COLORS.white : COLORS.primary}
                                                />
                                                <Text style={[
                                                    styles.genderButtonText,
                                                    selected_gender === 'male' && styles.genderButtonTextSelected
                                                ]}>
                                                    Hombre
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                        {variants.female.length > 0 && (
                                            <TouchableOpacity
                                                style={[
                                                    styles.genderButton,
                                                    selected_gender === 'female' && styles.genderButtonSelected
                                                ]}
                                                onPress={() => handle_select_gender('female')}
                                            >
                                                <Ionicons
                                                    name="female"
                                                    size={20}
                                                    color={selected_gender === 'female' ? COLORS.white : COLORS.primary}
                                                />
                                                <Text style={[
                                                    styles.genderButtonText,
                                                    selected_gender === 'female' && styles.genderButtonTextSelected
                                                ]}>
                                                    Mujer
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            )}

                            {/* Selección de talla */}
                            {((is_cap() && variants.unisex.length > 0) ||
                              (is_shirt() && selected_gender && variants[selected_gender]?.length > 0)) && (
                                <View style={styles.sizeSelection}>
                                    <Text style={styles.sizeLabel}>
                                        Talla: {selected_size && `(${selected_size.toUpperCase()})`}
                                    </Text>
                                    <View style={styles.sizeButtons}>
                                        {(is_cap() ? variants.unisex : variants[selected_gender] || []).map((variant) => (
                                            <TouchableOpacity
                                                key={variant.variant_id}
                                                style={[
                                                    styles.sizeButton,
                                                    selected_size === variant.size && styles.sizeButtonSelected,
                                                    !variant.is_available && styles.sizeButtonDisabled
                                                ]}
                                                onPress={() => handle_select_size(variant.size)}
                                                disabled={!variant.is_available}
                                            >
                                                <Text style={[
                                                    styles.sizeButtonText,
                                                    selected_size === variant.size && styles.sizeButtonTextSelected,
                                                    !variant.is_available && styles.sizeButtonTextDisabled
                                                ]}>
                                                    {variant.size.toUpperCase()}
                                                </Text>
                                                {!variant.is_available && (
                                                    <View style={styles.unavailableLine} />
                                                )}
                                                {variant.stock < 5 && variant.stock > 0 && (
                                                    <Text style={styles.lowStockText}>
                                                        ¡{variant.stock} left!
                                                    </Text>
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                    {selected_variant && (
                                        <View style={styles.stockInfo}>
                                            <Ionicons
                                                name={selected_variant.stock > 10 ? 'checkmark-circle' : 'alert-circle'}
                                                size={16}
                                                color={selected_variant.stock > 10 ? '#4CAF50' : '#FF9800'}
                                            />
                                            <Text style={styles.stockInfoText}>
                                                {selected_variant.stock > 10
                                                    ? 'En stock'
                                                    : `Solo ${selected_variant.stock} disponibles`}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            )}

                            {loading_variants && (
                                <Text style={styles.loadingText}>Cargando tallas...</Text>
                            )}
                        </View>
                    )}

                    {/* Contador de cantidad y botón de agregar al carrito */}
                    <View style={styles.cartSection}>
                        <View style={styles.quantityRow}>
                            <Text style={styles.quantityLabel}>Cantidad:</Text>
                            <QuantityCounter
                                quantity={quantity}
                                on_increment={handle_increment}
                                on_decrement={handle_decrement}
                            />
                        </View>
                        <View style={styles.addToCartButtonContainer}>
                            <CustomButton title="Añadir al Carrito" on_press={handle_add_to_cart} />
                        </View>
                    </View>

                    {/* Descripción */}
                    {should_show_section([product.description, 'descripción']) && (
                        <>
                            <Text style={styles.sectionTitle}>Descripción</Text>
                            <Text style={styles.description}>{product.description}</Text>
                        </>
                    )}

                    {/* Dimensiones */}
                    {should_show_section(['dimensiones', 'alto', 'diámetro', 'capacidad', 'peso']) && (
                        <>
                            <Text style={styles.sectionTitle}>Dimensiones</Text>
                            <View style={styles.dimensionsBox}>
                                <View style={styles.dimensionRow}>
                                    <Text style={styles.dimensionLabel}>Alto:</Text>
                                    <Text style={styles.dimensionValue}>10 cm</Text>
                                </View>
                                <View style={styles.dimensionRow}>
                                    <Text style={styles.dimensionLabel}>Diámetro:</Text>
                                    <Text style={styles.dimensionValue}>8 cm</Text>
                                </View>
                                <View style={styles.dimensionRow}>
                                    <Text style={styles.dimensionLabel}>Capacidad:</Text>
                                    <Text style={styles.dimensionValue}>350 ml</Text>
                                </View>
                                <View style={styles.dimensionRow}>
                                    <Text style={styles.dimensionLabel}>Peso:</Text>
                                    <Text style={styles.dimensionValue}>280 g</Text>
                                </View>
                            </View>
                        </>
                    )}

                    {/* Detalles del Producto */}
                    {should_show_section(['detalles', 'material', 'cerámica', 'lavavajillas', 'microondas', 'sublimación', 'colores', 'acabado']) && (
                        <>
                            <Text style={styles.sectionTitle}>Detalles del Producto</Text>
                            <View style={styles.detailsBox}>
                                <View style={styles.featureRow}>
                                    <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} />
                                    <Text style={styles.featureText}>Material: Cerámica de alta calidad</Text>
                                </View>
                                <View style={styles.featureRow}>
                                    <Ionicons name="water-outline" size={20} color={COLORS.primary} />
                                    <Text style={styles.featureText}>Apto para lavavajillas y microondas</Text>
                                </View>
                                <View style={styles.featureRow}>
                                    <Ionicons name="print-outline" size={20} color={COLORS.primary} />
                                    <Text style={styles.featureText}>Técnica: Sublimación profesional</Text>
                                </View>
                                <View style={styles.featureRow}>
                                    <Ionicons name="color-palette-outline" size={20} color={COLORS.primary} />
                                    <Text style={styles.featureText}>Colores vibrantes y duraderos</Text>
                                </View>
                                <View style={styles.featureRow}>
                                    <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.primary} />
                                    <Text style={styles.featureText}>Acabado brillante profesional</Text>
                                </View>
                            </View>
                        </>
                    )}

                    {/* Calificación y Reseñas */}
                    {should_show_section(['calificación', 'reseñas', 'opiniones', ...MOCK_REVIEWS.map(r => r.comment)]) && (
                        <View style={styles.ratingSection}>
                            <Text style={styles.sectionTitle}>Calificación y Reseñas</Text>
                        <View style={styles.ratingContainer}>
                            <View style={styles.ratingLeft}>
                                <Text style={styles.ratingNumber}>{average_rating.toFixed(1)}</Text>
                                <View style={styles.starsRow}>{render_stars(Math.round(average_rating))}</View>
                                <Text style={styles.reviewCount}>{MOCK_REVIEWS.length} reseñas</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.viewReviewsButton}
                                onPress={() => set_show_reviews_modal(true)}
                            >
                                <Text style={styles.viewReviewsText}>Ver todas</Text>
                                <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                        {/* Preview de primeras 2 reseñas */}
                        {MOCK_REVIEWS.slice(0, 2).map((review) => (
                            <View key={review.id} style={styles.reviewPreview}>
                                <View style={styles.reviewHeader}>
                                    <Text style={styles.reviewUserName}>{review.userName}</Text>
                                    <Text style={styles.reviewDate}>{review.date}</Text>
                                </View>
                                <View style={styles.starsRow}>{render_stars(review.rating)}</View>
                                <Text style={styles.reviewComment} numberOfLines={2}>
                                    {review.comment}
                                </Text>
                            </View>
                        ))}
                        </View>
                    )}

                    {/* También te puede interesar - Productos similares */}
                    {related_products.length > 0 && (
                        <>
                            <Text style={styles.sectionTitle}>También te puede interesar</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.relatedProductsScroll}
                            >
                                {related_products.map((related_product) => (
                                    <View key={related_product.id} style={styles.relatedProductCard}>
                                        <ProductCard
                                            product={related_product}
                                            onPress={() =>
                                                navigation.push('ProductDetail', {
                                                    product: related_product,
                                                })
                                            }
                                        />
                                    </View>
                                ))}
                            </ScrollView>
                        </>
                    )}

                    {/* Espacio extra para scroll */}
                    <View style={{ height: 20 }} />
                </View>
            </ScrollView>

            {/* Botón flotante de personalización */}
            <Animated.View
                style={[
                    styles.floatingButton,
                    { transform: [{ scale: pulseAnim }] }
                ]}
            >
                <TouchableOpacity
                    style={styles.floatingButtonInner}
                    onPress={pick_image}
                    activeOpacity={0.8}
                >
                    <Ionicons name="image" size={28} color={COLORS.white} />
                </TouchableOpacity>
            </Animated.View>

            {/* Botón flotante de favoritos */}
            <TouchableOpacity
                style={[
                    styles.favoriteFloatingButton,
                    is_favorite(product.id) && styles.favoriteButtonActive,
                ]}
                onPress={handle_toggle_favorite}
                activeOpacity={0.8}
            >
                <Ionicons
                    name={is_favorite(product.id) ? 'heart' : 'heart-outline'}
                    size={24}
                    color={COLORS.white}
                />
            </TouchableOpacity>

            {/* Modal de selección de diseño */}
            <Modal
                visible={show_design_modal}
                transparent
                animationType="slide"
                onRequestClose={() => set_show_design_modal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Elige tu Diseño</Text>
                            <TouchableOpacity onPress={() => set_show_design_modal(false)}>
                                <Ionicons name="close" size={28} color={COLORS.textDark} />
                            </TouchableOpacity>
                        </View>

                        {/* Contenido de diseños prediseñados */}
                        <View style={styles.predesignedContainer}>
                                {/* Categorías de diseños prediseñados */}
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.templateCategoriesScroll}
                                >
                                    {DESIGN_CATEGORIES.map((cat) => (
                                        <TouchableOpacity
                                            key={cat.id}
                                            style={[
                                                styles.templateCategoryChip,
                                                template_category === cat.id &&
                                                    styles.templateCategoryChipActive,
                                            ]}
                                            onPress={() => set_template_category(cat.id)}
                                        >
                                            <Ionicons
                                                name={cat.icon}
                                                size={16}
                                                color={
                                                    template_category === cat.id
                                                        ? COLORS.primary
                                                        : '#666'
                                                }
                                            />
                                            <Text
                                                style={[
                                                    styles.templateCategoryText,
                                                    template_category === cat.id &&
                                                        styles.templateCategoryTextActive,
                                                ]}
                                            >
                                                {cat.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                {/* Grid de templates */}
                                <FlatList
                                    data={get_filtered_templates()}
                                    numColumns={2}
                                    keyExtractor={(item) => item.id.toString()}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={[
                                                styles.templateCard,
                                                selected_template?.id === item.id &&
                                                    styles.selectedTemplateCard,
                                            ]}
                                            onPress={() => handle_select_template(item)}
                                        >
                                            <Image
                                                source={item.preview}
                                                style={styles.templateImage}
                                            />
                                            <View style={styles.templateOverlay}>
                                                <Text style={styles.templateName}>
                                                    {item.name}
                                                </Text>
                                                <Text style={styles.templatePrice}>
                                                    +${item.price}
                                                </Text>
                                            </View>
                                            {selected_template?.id === item.id && (
                                                <View style={styles.selectedTemplateBadge}>
                                                    <Ionicons
                                                        name="checkmark-circle"
                                                        size={28}
                                                        color="#4CAF50"
                                                    />
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    )}
                                    contentContainerStyle={styles.templateList}
                                    showsVerticalScrollIndicator={false}
                                />
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal de todas las reseñas */}
            <Modal
                visible={show_reviews_modal}
                transparent
                animationType="slide"
                onRequestClose={() => set_show_reviews_modal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Reseñas de Clientes</Text>
                            <TouchableOpacity onPress={() => set_show_reviews_modal(false)}>
                                <Ionicons name="close" size={28} color={COLORS.textDark} />
                            </TouchableOpacity>
                        </View>

                        {/* Rating general */}
                        <View style={styles.overallRating}>
                            <Text style={styles.overallRatingNumber}>{average_rating.toFixed(1)}</Text>
                            <View>
                                <View style={styles.starsRow}>
                                    {render_stars(Math.round(average_rating))}
                                </View>
                                <Text style={styles.overallReviewCount}>
                                    Basado en {MOCK_REVIEWS.length} reseñas
                                </Text>
                            </View>
                        </View>

                        <FlatList
                            data={MOCK_REVIEWS}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.fullReviewCard}>
                                    <View style={styles.reviewHeader}>
                                        <View style={styles.reviewUserInfo}>
                                            <View style={styles.userAvatar}>
                                                <Text style={styles.userAvatarText}>
                                                    {item.userName.charAt(0)}
                                                </Text>
                                            </View>
                                            <View>
                                                <Text style={styles.reviewUserName}>{item.userName}</Text>
                                                <Text style={styles.reviewDate}>{item.date}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.starsRow}>{render_stars(item.rating)}</View>
                                    </View>
                                    <Text style={styles.fullReviewComment}>{item.comment}</Text>
                                </View>
                            )}
                            contentContainerStyle={styles.reviewsList}
                            showsVerticalScrollIndicator={false}
                        />
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
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    cartButton: {
        padding: 5,
        position: 'relative',
    },
    cartBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#FF3B30',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    cartBadgeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    searchContainer: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 15,
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.textDark,
    },
    content: {
        flex: 1,
    },
    previewContainer: {
        backgroundColor: COLORS.primaryLight,
        width: '100%',
        height: 300,
        position: 'relative',
        overflow: 'hidden',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    customImageIndicator: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    customImageText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.primary,
        marginTop: 10,
        textAlign: 'center',
    },
    designPreview: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderDesign: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderText: {
        fontSize: 12,
        color: '#999',
        marginTop: 10,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    // Estilos para confirmación de guardado
    saveConfirmationOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
    },
    saveConfirmationCard: {
        backgroundColor: COLORS.white,
        borderRadius: 25,
        padding: 30,
        alignItems: 'center',
        width: 300,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 15,
    },
    checkmarkCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    saveConfirmationTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginBottom: 8,
    },
    saveConfirmationSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    // Preview con modelo de taza en confirmación
    savedPreviewContainer: {
        width: 200,
        height: 200,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    savedMugModel: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    savedCustomArea: {
        position: 'absolute',
        width: 110,
        height: 130,
        justifyContent: 'center',
        alignItems: 'center',
        top: 50,
        left: 25,
    },
    savedCustomImage: {
        width: '90%',
        height: '90%',
    },
    infoContainer: {
        padding: 20,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    titleWithStar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    productName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.textDark,
        flex: 1,
    },
    starButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primaryLight,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        marginLeft: 10,
    },
    ratingTextSmall: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginLeft: 4,
    },
    price: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginLeft: 10,
    },
    customBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginBottom: 15,
    },
    customBadgeText: {
        fontSize: 13,
        color: '#4CAF50',
        fontWeight: '600',
        marginLeft: 6,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginTop: 20,
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    featureText: {
        fontSize: 15,
        color: '#666',
        marginLeft: 12,
    },
    cartSection: {
        marginTop: 10,
        marginBottom: 20,
    },
    quantityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    quantityLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textDark,
    },
    addToCartButtonContainer: {
        marginBottom: 10,
    },
    floatingButton: {
        position: 'absolute',
        right: 20,
        bottom: 20,
    },
    floatingButtonInner: {
        width: 65,
        height: 65,
        borderRadius: 32.5,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 12,
    },
    favoriteFloatingButton: {
        position: 'absolute',
        right: 20,
        bottom: 95,
        width: 55,
        height: 55,
        borderRadius: 27.5,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 6,
    },
    favoriteButtonActive: {
        backgroundColor: '#E03C3C',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 20,
        maxHeight: '75%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textDark,
    },
    designList: {
        paddingBottom: 20,
    },
    designCard: {
        flex: 1,
        margin: 8,
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedDesignCard: {
        borderColor: '#4CAF50',
        backgroundColor: '#F0FFF4',
    },
    designIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    designName: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textDark,
        textAlign: 'center',
    },
    selectedBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    // Estilos de Rating y Reseñas
    ratingSection: {
        marginTop: 10,
    },
    ratingContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.primaryLight,
        padding: 15,
        borderRadius: 15,
        marginBottom: 15,
    },
    ratingLeft: {
        alignItems: 'center',
    },
    ratingNumber: {
        fontSize: 42,
        fontWeight: 'bold',
        color: COLORS.textDark,
    },
    starsRow: {
        flexDirection: 'row',
        marginVertical: 5,
    },
    reviewCount: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    viewReviewsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 20,
    },
    viewReviewsText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '600',
        marginRight: 5,
    },
    reviewPreview: {
        backgroundColor: COLORS.white,
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    reviewUserName: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textDark,
    },
    reviewDate: {
        fontSize: 12,
        color: '#999',
    },
    reviewComment: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginTop: 5,
    },
    // Estilos de Dimensiones
    dimensionsBox: {
        backgroundColor: COLORS.primaryLight,
        padding: 15,
        borderRadius: 15,
        marginBottom: 10,
    },
    dimensionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    dimensionLabel: {
        fontSize: 15,
        color: '#666',
        fontWeight: '500',
    },
    dimensionValue: {
        fontSize: 15,
        color: COLORS.textDark,
        fontWeight: '600',
    },
    // Estilos de Detalles
    detailsBox: {
        backgroundColor: COLORS.white,
        borderRadius: 15,
        padding: 5,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    // Estilos de Productos Relacionados
    relatedProductsScroll: {
        marginBottom: 10,
    },
    relatedProductCard: {
        width: 160,
        marginRight: 15,
    },
    // Estilos del Modal de Reseñas
    overallRating: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primaryLight,
        padding: 20,
        borderRadius: 15,
        marginBottom: 15,
    },
    overallRatingNumber: {
        fontSize: 56,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginRight: 20,
    },
    overallReviewCount: {
        fontSize: 13,
        color: '#666',
        marginTop: 5,
    },
    reviewsList: {
        paddingBottom: 20,
    },
    fullReviewCard: {
        backgroundColor: COLORS.white,
        padding: 15,
        borderRadius: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    reviewUserInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    userAvatarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    fullReviewComment: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginTop: 10,
    },
    selectDesignButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primaryLight,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginVertical: 15,
        borderWidth: 1,
        borderColor: COLORS.primary,
        gap: 8,
    },
    selectDesignText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.primary,
    },
    tabs: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        marginBottom: 15,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: COLORS.primary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#999',
    },
    activeTabText: {
        color: COLORS.primary,
    },
    predesignedContainer: {
        flex: 1,
    },
    templateCategoriesScroll: {
        marginBottom: 15,
    },
    templateCategoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#f5f5f5',
        marginRight: 8,
        gap: 4,
    },
    templateCategoryChipActive: {
        backgroundColor: COLORS.primaryLight,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    templateCategoryText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
    },
    templateCategoryTextActive: {
        color: COLORS.primary,
    },
    templateList: {
        paddingBottom: 20,
    },
    templateCard: {
        flex: 1,
        margin: 6,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: COLORS.white,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        position: 'relative',
    },
    selectedTemplateCard: {
        borderWidth: 3,
        borderColor: '#4CAF50',
    },
    templateImage: {
        width: '100%',
        height: 140,
        backgroundColor: '#f0f0f0',
    },
    templateOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 8,
    },
    templateName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 2,
    },
    templatePrice: {
        fontSize: 10,
        fontWeight: '600',
        color: '#FFD700',
    },
    selectedTemplateBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'white',
        borderRadius: 14,
    },
    // Estilos para selección de tallas
    sizeSection: {
        marginTop: 15,
        marginBottom: 10,
        padding: 15,
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    genderSelection: {
        marginBottom: 15,
    },
    sizeLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textDark,
        marginBottom: 10,
    },
    genderButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    genderButton: {
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
    genderButtonSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    genderButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.primary,
    },
    genderButtonTextSelected: {
        color: COLORS.white,
    },
    sizeSelection: {
        marginTop: 5,
    },
    sizeButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 10,
    },
    sizeButton: {
        minWidth: 50,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#ddd',
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    sizeButtonSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    sizeButtonDisabled: {
        backgroundColor: '#f0f0f0',
        borderColor: '#ccc',
        opacity: 0.5,
    },
    sizeButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textDark,
    },
    sizeButtonTextSelected: {
        color: COLORS.white,
    },
    sizeButtonTextDisabled: {
        color: '#999',
    },
    unavailableLine: {
        position: 'absolute',
        width: '100%',
        height: 2,
        backgroundColor: '#ff0000',
        transform: [{ rotate: '-45deg' }],
    },
    lowStockText: {
        fontSize: 9,
        color: '#FF9800',
        fontWeight: '600',
        marginTop: 2,
    },
    stockInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        backgroundColor: '#fff',
        borderRadius: 8,
        gap: 6,
    },
    stockInfoText: {
        fontSize: 13,
        color: COLORS.textDark,
        fontWeight: '500',
    },
    loadingText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        padding: 10,
    },
    customImageContainer: {
        backgroundColor: COLORS.white,
        marginHorizontal: 20,
        marginTop: 15,
        borderRadius: 15,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    customImageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    customImageTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginLeft: 8,
        flex: 1,
    },
    removeImageButton: {
        padding: 4,
    },
    customImagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        marginBottom: 10,
    },
    customImagePreviewImg: {
        width: '100%',
        height: '100%',
    },
    customImageInfo: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
    },
});

export default ProductDetailScreen;
