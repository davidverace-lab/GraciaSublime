import React, { useState, useRef, useEffect } from 'react';
import {
        View,
        Text,
        StyleSheet,
        Modal,
        TouchableOpacity,
        Dimensions,
        ScrollView,
        Animated,
        Alert,
} from 'react-native';
import { GestureHandlerRootView, PinchGestureHandler, PanGestureHandler, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import { COLORS } from '../constants/colors.js';

const { width, height } = Dimensions.get('window');

const ImageEditorModal = ({ visible, imageUri, onClose, onSave }) => {
        const [zoom, setZoom] = useState(1);
        const [rotation, setRotation] = useState(0);
        const [flipHorizontal, setFlipHorizontal] = useState(false);
        const [flipVertical, setFlipVertical] = useState(false);
        const [isProcessing, setIsProcessing] = useState(false);

        const scale = useRef(new Animated.Value(1)).current;
        const rotateAnim = useRef(new Animated.Value(0)).current;
        const translateX = useRef(new Animated.Value(0)).current;
        const translateY = useRef(new Animated.Value(0)).current;

        // Referencias para el estado base de los gestos
        const baseScale = useRef(1);
        const lastScale = useRef(1);
        const baseTranslateX = useRef(0);
        const baseTranslateY = useRef(0);

        // Resetear valores cuando se abre el modal
        useEffect(() => {
                if (visible) {
                        setZoom(1);
                        setRotation(0);
                        setFlipHorizontal(false);
                        setFlipVertical(false);
                        scale.setValue(1);
                        rotateAnim.setValue(0);
                        translateX.setValue(0);
                        translateY.setValue(0);
                        baseScale.current = 1;
                        lastScale.current = 1;
                        baseTranslateX.current = 0;
                        baseTranslateY.current = 0;
                }
        }, [visible]);

        // Manejar gesto de pinch (zoom)
        const onPinchEvent = Animated.event(
                [{ nativeEvent: { scale: scale } }],
                { useNativeDriver: true }
        );

        const onPinchStateChange = (event) => {
                if (event.nativeEvent.oldState === State.ACTIVE) {
                        // Cuando termina el gesto, actualizar el zoom base
                        const newScale = event.nativeEvent.scale * baseScale.current;
                        const clampedScale = Math.max(0.5, Math.min(3, newScale));

                        baseScale.current = clampedScale;
                        lastScale.current = clampedScale;
                        setZoom(clampedScale);

                        // Resetear la escala de animación
                        scale.setValue(1);
                }
        };

        // Manejar gesto de pan (arrastre)
        const onPanEvent = Animated.event(
                [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
                { useNativeDriver: true }
        );

        const onPanStateChange = (event) => {
                if (event.nativeEvent.oldState === State.ACTIVE) {
                        // Guardar la posición final
                        baseTranslateX.current += event.nativeEvent.translationX;
                        baseTranslateY.current += event.nativeEvent.translationY;

                        // Resetear las animaciones de traslación
                        translateX.setOffset(baseTranslateX.current);
                        translateY.setOffset(baseTranslateY.current);
                        translateX.setValue(0);
                        translateY.setValue(0);
                }
        };

        const handleZoomIn = () => {
                if (zoom < 3) {
                        const newZoom = zoom + 0.25;
                        setZoom(newZoom);
                        baseScale.current = newZoom;
                        scale.setValue(1);
                }
        };

        const handleZoomOut = () => {
                if (zoom > 0.5) {
                        const newZoom = zoom - 0.25;
                        setZoom(newZoom);
                        baseScale.current = newZoom;
                        scale.setValue(1);
                }
        };

        const handleRotate = () => {
                const newRotation = (rotation + 90) % 360;
                setRotation(newRotation);
                Animated.spring(rotateAnim, {
                        toValue: newRotation / 360,
                        tension: 50,
                        friction: 7,
                        useNativeDriver: true,
                }).start();
        };

        const handleFlipHorizontal = () => {
                setFlipHorizontal(!flipHorizontal);
        };

        const handleFlipVertical = () => {
                setFlipVertical(!flipVertical);
        };

        const handleReset = () => {
                setZoom(1);
                setRotation(0);
                setFlipHorizontal(false);
                setFlipVertical(false);
                scale.setValue(1);
                rotateAnim.setValue(0);
                translateX.setValue(0);
                translateY.setValue(0);
                baseScale.current = 1;
                lastScale.current = 1;
                baseTranslateX.current = 0;
                baseTranslateY.current = 0;
        };

        const handleSave = async () => {
                if (!imageUri) return;

                setIsProcessing(true);

                try {
                        const actions = [];

                        // Aplicar rotación primero
                        if (rotation !== 0) {
                                actions.push({ rotate: rotation });
                        }

                        // Aplicar flip
                        if (flipHorizontal) {
                                actions.push({ flip: ImageManipulator.FlipType.Horizontal });
                        }
                        if (flipVertical) {
                                actions.push({ flip: ImageManipulator.FlipType.Vertical });
                        }

                        // Si hay zoom, recortar la imagen desde el centro
                        if (zoom !== 1) {
                                // Calcular el área a recortar basado en el zoom
                                const cropWidth = 800 / zoom;
                                const cropHeight = 800 / zoom;
                                const originX = (800 - cropWidth) / 2;
                                const originY = (800 - cropHeight) / 2;

                                actions.push({
                                        crop: {
                                                originX: Math.max(0, originX),
                                                originY: Math.max(0, originY),
                                                width: cropWidth,
                                                height: cropHeight,
                                        },
                                });

                                // Redimensionar de vuelta al tamaño original
                                actions.push({
                                        resize: {
                                                width: 800,
                                                height: 800,
                                        },
                                });
                        }

                        // Procesar imagen (si no hay acciones, solo re-comprimir)
                        const result = await ImageManipulator.manipulateAsync(
                                imageUri,
                                actions.length > 0 ? actions : [],
                                {
                                        compress: 0.9,
                                        format: ImageManipulator.SaveFormat.JPEG,
                                }
                        );

                        console.log('Imagen procesada:', result.uri);
                        onSave(result.uri);
                        handleReset();
                } catch (error) {
                        console.error('Error al procesar imagen:', error);
                        Alert.alert('Error', 'No se pudo procesar la imagen. Intenta nuevamente.');
                } finally {
                        setIsProcessing(false);
                }
        };

        const handleClose = () => {
                handleReset();
                onClose();
        };

        const rotateInterpolate = rotateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
        });

        return (
                <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
                        <GestureHandlerRootView style={styles.container}>
                                {/* Header */}
                                <View style={styles.header}>
                                        <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
                                                <Ionicons name="close" size={28} color={COLORS.white} />
                                        </TouchableOpacity>
                                        <Text style={styles.headerTitle}>Editar Imagen</Text>
                                        <TouchableOpacity
                                                onPress={handleSave}
                                                style={[styles.headerButton, isProcessing && styles.disabledButton]}
                                                disabled={isProcessing}
                                        >
                                                <Ionicons name="checkmark" size={28} color={COLORS.white} />
                                        </TouchableOpacity>
                                </View>

                                {/* Preview Area */}
                                <PanGestureHandler
                                        onGestureEvent={onPanEvent}
                                        onHandlerStateChange={onPanStateChange}
                                        minPointers={1}
                                        maxPointers={1}
                                >
                                        <Animated.View style={styles.previewContainer}>
                                                <PinchGestureHandler
                                                        onGestureEvent={onPinchEvent}
                                                        onHandlerStateChange={onPinchStateChange}
                                                >
                                                        <Animated.View style={styles.imageWrapper}>
                                                                <Animated.Image
                                                                        source={{ uri: imageUri }}
                                                                        style={[
                                                                                styles.previewImage,
                                                                                {
                                                                                        transform: [
                                                                                                { scale: Animated.multiply(scale, baseScale.current) },
                                                                                                { translateX: translateX },
                                                                                                { translateY: translateY },
                                                                                                { rotate: rotateInterpolate },
                                                                                                { scaleX: flipHorizontal ? -1 : 1 },
                                                                                                { scaleY: flipVertical ? -1 : 1 },
                                                                                        ],
                                                                                },
                                                                        ]}
                                                                        resizeMode="contain"
                                                                />
                                                        </Animated.View>
                                                </PinchGestureHandler>

                                                {/* Grid overlay */}
                                                <View style={styles.gridOverlay} pointerEvents="none">
                                                        <View style={styles.gridLine} />
                                                        <View style={[styles.gridLine, styles.gridLineVertical]} />
                                                </View>
                                        </Animated.View>
                                </PanGestureHandler>

                                {/* Info Panel */}
                                <View style={styles.infoPanel}>
                                        <View style={styles.infoItem}>
                                                <Ionicons name="resize" size={20} color={COLORS.primary} />
                                                <Text style={styles.infoText}>Zoom: {(zoom * 100).toFixed(0)}%</Text>
                                        </View>
                                        <View style={styles.infoItem}>
                                                <Ionicons name="sync" size={20} color={COLORS.primary} />
                                                <Text style={styles.infoText}>Rotación: {rotation}°</Text>
                                        </View>
                                </View>

                                {/* Controls */}
                                <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        style={styles.controlsScroll}
                                        contentContainerStyle={styles.controlsContainer}
                                >
                                        {/* Zoom Controls */}
                                        <View style={styles.controlGroup}>
                                                <Text style={styles.controlLabel}>Zoom</Text>
                                                <View style={styles.buttonRow}>
                                                        <TouchableOpacity
                                                                style={[styles.controlButton, zoom <= 0.5 && styles.disabledButton]}
                                                                onPress={handleZoomOut}
                                                                disabled={zoom <= 0.5}
                                                        >
                                                                <Ionicons name="remove" size={24} color={COLORS.white} />
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                                style={[styles.controlButton, zoom >= 3 && styles.disabledButton]}
                                                                onPress={handleZoomIn}
                                                                disabled={zoom >= 3}
                                                        >
                                                                <Ionicons name="add" size={24} color={COLORS.white} />
                                                        </TouchableOpacity>
                                                </View>
                                        </View>

                                        {/* Rotation Control */}
                                        <View style={styles.controlGroup}>
                                                <Text style={styles.controlLabel}>Rotar</Text>
                                                <TouchableOpacity style={styles.controlButton} onPress={handleRotate}>
                                                        <Ionicons name="sync" size={24} color={COLORS.white} />
                                                </TouchableOpacity>
                                        </View>

                                        {/* Flip Controls */}
                                        <View style={styles.controlGroup}>
                                                <Text style={styles.controlLabel}>Voltear</Text>
                                                <View style={styles.buttonRow}>
                                                        <TouchableOpacity
                                                                style={[
                                                                        styles.controlButton,
                                                                        flipHorizontal && styles.activeButton,
                                                                ]}
                                                                onPress={handleFlipHorizontal}
                                                        >
                                                                <Ionicons name="swap-horizontal" size={24} color={COLORS.white} />
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                                style={[
                                                                        styles.controlButton,
                                                                        flipVertical && styles.activeButton,
                                                                ]}
                                                                onPress={handleFlipVertical}
                                                        >
                                                                <Ionicons name="swap-vertical" size={24} color={COLORS.white} />
                                                        </TouchableOpacity>
                                                </View>
                                        </View>

                                        {/* Reset Button */}
                                        <View style={styles.controlGroup}>
                                                <Text style={styles.controlLabel}>Restablecer</Text>
                                                <TouchableOpacity
                                                        style={[styles.controlButton, styles.resetButton]}
                                                        onPress={handleReset}
                                                >
                                                        <Ionicons name="refresh" size={24} color={COLORS.white} />
                                                </TouchableOpacity>
                                        </View>
                                </ScrollView>

                                {/* Tips */}
                                <View style={styles.tipsContainer}>
                                        <Ionicons name="information-circle" size={20} color={COLORS.primary} />
                                        <Text style={styles.tipsText}>
                                                Usa dos dedos para hacer zoom. Arrastra para mover la imagen. Presiona ✓ para guardar
                                        </Text>
                                </View>
                        </GestureHandlerRootView>
                </Modal>
        );
};

const styles = StyleSheet.create({
        container: {
                flex: 1,
                backgroundColor: '#000',
        },
        imageWrapper: {
                flex: 1,
                width: '100%',
                height: '100%',
        },
        header: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingTop: 50,
                paddingBottom: 15,
                backgroundColor: COLORS.primary,
        },
        headerButton: {
                padding: 8,
        },
        headerTitle: {
                fontSize: 20,
                fontWeight: 'bold',
                color: COLORS.white,
        },
        disabledButton: {
                opacity: 0.5,
        },
        previewContainer: {
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#1a1a1a',
                margin: 10,
                borderRadius: 15,
                overflow: 'hidden',
        },
        previewImage: {
                width: width - 40,
                height: height * 0.4,
        },
        gridOverlay: {
                position: 'absolute',
                width: '100%',
                height: '100%',
        },
        gridLine: {
                position: 'absolute',
                width: '100%',
                height: 1,
                backgroundColor: 'rgba(255,255,255,0.2)',
                top: '50%',
        },
        gridLineVertical: {
                width: 1,
                height: '100%',
                left: '50%',
        },
        infoPanel: {
                flexDirection: 'row',
                justifyContent: 'space-around',
                paddingVertical: 15,
                backgroundColor: '#1a1a1a',
                marginHorizontal: 10,
                borderRadius: 10,
                marginBottom: 10,
        },
        infoItem: {
                flexDirection: 'row',
                alignItems: 'center',
        },
        infoText: {
                color: COLORS.white,
                fontSize: 14,
                fontWeight: '600',
                marginLeft: 8,
        },
        controlsScroll: {
                maxHeight: 140,
        },
        controlsContainer: {
                paddingHorizontal: 15,
                paddingVertical: 10,
        },
        controlGroup: {
                alignItems: 'center',
                marginRight: 20,
        },
        controlLabel: {
                color: COLORS.white,
                fontSize: 13,
                fontWeight: '600',
                marginBottom: 8,
        },
        buttonRow: {
                flexDirection: 'row',
                gap: 8,
        },
        controlButton: {
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: COLORS.primary,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 5,
        },
        activeButton: {
                backgroundColor: '#4CAF50',
        },
        resetButton: {
                backgroundColor: '#E03C3C',
        },
        tipsContainer: {
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.primaryLight,
                padding: 15,
                marginHorizontal: 10,
                marginBottom: 20,
                borderRadius: 10,
        },
        tipsText: {
                flex: 1,
                color: COLORS.textDark,
                fontSize: 13,
                marginLeft: 10,
        },
});

export default ImageEditorModal;
