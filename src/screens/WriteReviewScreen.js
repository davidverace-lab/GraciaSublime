import React, { useState } from 'react';
import {
        View,
        Text,
        StyleSheet,
        SafeAreaView,
        ScrollView,
        TouchableOpacity,
        TextInput,
        Alert,
        ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors.js';
import CustomButton from '../components/CustomButton.js';
import { createReview } from '../services/reviewsService.js';
import { useAuth } from '../context/AuthContext.js';

const WriteReviewScreen = ({ navigation, route }) => {
        const { order } = route.params;
        const { user } = useAuth();
        const [rating, setRating] = useState(0);
        const [comment, setComment] = useState('');
        const [loading, setLoading] = useState(false);

        const handleSubmit = async () => {
                if (rating === 0) {
                        Alert.alert('Error', 'Por favor selecciona una calificación');
                        return;
                }

                if (comment.trim().length < 10) {
                        Alert.alert('Error', 'Por favor escribe un comentario de al menos 10 caracteres');
                        return;
                }

                setLoading(true);

                try {
                        // Crear reseña para cada producto del pedido
                        const reviewPromises = order.order_items.map(item =>
                                createReview(
                                        user.id,
                                        order.order_id,
                                        item.product_id,
                                        rating,
                                        comment
                                )
                        );

                        const results = await Promise.all(reviewPromises);

                        const hasError = results.some(result => result.error);

                        if (hasError) {
                                throw new Error('Error al guardar algunas reseñas');
                        }

                        Alert.alert(
                                '¡Gracias!',
                                'Tu reseña ha sido publicada exitosamente',
                                [
                                        {
                                                text: 'OK',
                                                onPress: () => navigation.goBack()
                                        }
                                ]
                        );
                } catch (error) {
                        console.error('Error guardando reseña:', error);
                        Alert.alert('Error', 'No se pudo guardar tu reseña. Intenta de nuevo.');
                } finally {
                        setLoading(false);
                }
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
                                <Text style={styles.headerTitle}>Escribir Reseña</Text>
                                <View style={styles.placeholder} />
                        </View>

                        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                                {/* Información del pedido */}
                                <View style={styles.orderInfo}>
                                        <Text style={styles.orderLabel}>Pedido #{order.order_id}</Text>
                                        <Text style={styles.orderDate}>
                                                {new Date(order.order_date).toLocaleDateString('es-MX', {
                                                        day: '2-digit',
                                                        month: 'long',
                                                        year: 'numeric'
                                                })}
                                        </Text>
                                </View>

                                {/* Productos del pedido */}
                                <View style={styles.productsSection}>
                                        <Text style={styles.sectionTitle}>Productos:</Text>
                                        {order.order_items.map((item, index) => (
                                                <View key={index} style={styles.productItem}>
                                                        <Text style={styles.productName}>
                                                                • {item.products?.name || 'Producto'}
                                                        </Text>
                                                </View>
                                        ))}
                                </View>

                                {/* Calificación */}
                                <View style={styles.ratingSection}>
                                        <Text style={styles.sectionTitle}>Calificación:</Text>
                                        <View style={styles.starsContainer}>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                        <TouchableOpacity
                                                                key={star}
                                                                onPress={() => setRating(star)}
                                                                activeOpacity={0.7}
                                                                style={styles.starButton}
                                                        >
                                                                <Ionicons
                                                                        name={star <= rating ? 'star' : 'star-outline'}
                                                                        size={48}
                                                                        color={star <= rating ? '#FFD700' : '#DDD'}
                                                                />
                                                        </TouchableOpacity>
                                                ))}
                                        </View>
                                        {rating > 0 && (
                                                <Text style={styles.ratingText}>
                                                        {rating === 1 && 'Muy malo'}
                                                        {rating === 2 && 'Malo'}
                                                        {rating === 3 && 'Regular'}
                                                        {rating === 4 && 'Bueno'}
                                                        {rating === 5 && 'Excelente'}
                                                </Text>
                                        )}
                                </View>

                                {/* Comentario */}
                                <View style={styles.commentSection}>
                                        <Text style={styles.sectionTitle}>Tu opinión:</Text>
                                        <TextInput
                                                style={styles.commentInput}
                                                placeholder="Cuéntanos tu experiencia con este pedido..."
                                                placeholderTextColor="#999"
                                                value={comment}
                                                onChangeText={setComment}
                                                multiline
                                                numberOfLines={6}
                                                maxLength={500}
                                                textAlignVertical="top"
                                        />
                                        <Text style={styles.characterCount}>
                                                {comment.length}/500 caracteres
                                        </Text>
                                </View>

                                {/* Consejos */}
                                <View style={styles.tipsSection}>
                                        <Text style={styles.tipsTitle}>💡 Consejos para una buena reseña:</Text>
                                        <Text style={styles.tipText}>
                                                • Sé específico sobre lo que te gustó o no{'\n'}
                                                • Menciona la calidad del producto{'\n'}
                                                • Comenta sobre el tiempo de entrega{'\n'}
                                                • Sé honesto pero respetuoso
                                        </Text>
                                </View>

                                <View style={{ height: 20 }} />
                        </ScrollView>

                        {/* Footer con botón */}
                        <View style={styles.footer}>
                                <CustomButton
                                        title={loading ? 'Publicando...' : 'Publicar Reseña'}
                                        on_press={handleSubmit}
                                        disabled={loading || rating === 0}
                                        icon={loading ? null : (
                                                <ActivityIndicator size="small" color={COLORS.white} />
                                        )}
                                />
                        </View>
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
        },
        backButton: {
                padding: 5,
        },
        headerTitle: {
                fontSize: 18,
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
                padding: 20,
        },
        orderInfo: {
                backgroundColor: COLORS.primaryLight,
                padding: 15,
                borderRadius: 12,
                marginBottom: 20,
        },
        orderLabel: {
                fontSize: 18,
                fontWeight: 'bold',
                color: COLORS.primary,
        },
        orderDate: {
                fontSize: 14,
                color: '#666',
                marginTop: 5,
        },
        productsSection: {
                marginBottom: 30,
        },
        sectionTitle: {
                fontSize: 18,
                fontWeight: 'bold',
                color: COLORS.textDark,
                marginBottom: 15,
        },
        productItem: {
                paddingVertical: 5,
        },
        productName: {
                fontSize: 15,
                color: COLORS.textDark,
        },
        ratingSection: {
                marginBottom: 30,
        },
        starsContainer: {
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 20,
        },
        starButton: {
                padding: 5,
        },
        ratingText: {
                fontSize: 16,
                fontWeight: '600',
                color: COLORS.primary,
                textAlign: 'center',
                marginTop: 10,
        },
        commentSection: {
                marginBottom: 20,
        },
        commentInput: {
                backgroundColor: '#F5F5F5',
                borderRadius: 12,
                padding: 15,
                fontSize: 15,
                color: COLORS.textDark,
                minHeight: 150,
                borderWidth: 1,
                borderColor: '#E0E0E0',
        },
        characterCount: {
                fontSize: 12,
                color: '#999',
                textAlign: 'right',
                marginTop: 5,
        },
        tipsSection: {
                backgroundColor: '#FFF9E6',
                padding: 15,
                borderRadius: 12,
                borderLeftWidth: 4,
                borderLeftColor: '#FFB020',
        },
        tipsTitle: {
                fontSize: 14,
                fontWeight: 'bold',
                color: '#856404',
                marginBottom: 10,
        },
        tipText: {
                fontSize: 13,
                color: '#856404',
                lineHeight: 22,
        },
        footer: {
                padding: 20,
                backgroundColor: COLORS.white,
                borderTopWidth: 1,
                borderTopColor: '#F0F0F0',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -3 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 10,
        },
});

export default WriteReviewScreen;
