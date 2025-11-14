import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors.js';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

const CategoryCard = ({ category, onPress, index }) => {
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
        onPress();
    };

    return (
        <TouchableOpacity
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
        >
            <Animated.View
                style={[
                    styles.card,
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
                    source={category.image}
                    style={styles.backgroundImage}
                    resizeMode="cover"
                />

                {/* Gradiente overlay */}
                <LinearGradient
                    colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
                    style={styles.gradient}
                >
                    {/* Contenido */}
                    <View style={styles.content}>
                        <Text style={styles.name}>{category.name}</Text>
                        <Text style={styles.description}>{category.description}</Text>
                    </View>

                    {/* Flecha */}
                    <View style={styles.arrow}>
                        <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
                    </View>
                </LinearGradient>
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        height: 180,
        borderRadius: 25,
        overflow: 'hidden',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 10,
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    gradient: {
        width: '100%',
        height: '100%',
        padding: 15,
        justifyContent: 'space-between',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
    },
    content: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    name: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.white,
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    description: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 16,
    },
    arrow: {
        position: 'absolute',
        top: 15,
        right: 15,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CategoryCard;
