import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/colors.js';
import CustomButton from '../components/CustomButton.js';
import { useAuth } from '../context/AuthContext.js';

const SplashScreen = ({ navigation }) => {
        const { is_authenticated, loading, view_mode } = useAuth();

        useEffect(() => {
                // Esperar a que termine de cargar la sesión
                if (!loading) {
                        if (is_authenticated) {
                                // Si el usuario está autenticado, redirigir según su rol
                                if (view_mode === 'admin') {
                                        navigation.replace('AdminDrawer');
                                } else {
                                        navigation.replace('MainDrawer');
                                }
                        }
                }
        }, [loading, is_authenticated, view_mode, navigation]);

        // Mientras carga, mostrar spinner
        if (loading) {
                return (
                        <SafeAreaView style={styles.container}>
                                <View style={styles.top_circle} />
                                <View style={styles.content}>
                                        <Text style={styles.title}>Gracia{'\n'}Sublime</Text>
                                        <Text style={styles.subtitle}>Tazas Personalizadas</Text>
                                        <ActivityIndicator
                                                size="large"
                                                color={COLORS.primary}
                                                style={styles.loader}
                                        />
                                </View>
                                <View style={styles.bottom_circle} />
                        </SafeAreaView>
                );
        }

        return (
                <SafeAreaView style={styles.container}>
                        {/* Círculo amarillo superior izquierdo */}
                        <View style={styles.top_circle} />

                        {/* Contenido central */}
                        <View style={styles.content}>
                                <Text style={styles.title}>Gracia{'\n'}Sublime</Text>
                                <Text style={styles.subtitle}>Tazas Personalizadas</Text>
                        </View>

                        {/* Círculo amarillo inferior */}
                        <View style={styles.bottom_circle} />

                        {/* Botón LOGIN */}
                        <View style={styles.button_container}>
                                <CustomButton
                                        title="LOGIN"
                                        on_press={() => navigation.navigate('Login')}
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
        top_circle: {
                position: 'absolute',
                top: -100,
                left: -50,
                width: 200,
                height: 200,
                borderRadius: 100,
                backgroundColor: COLORS.primary,
                opacity: 0.3,
        },
        bottom_circle: {
                position: 'absolute',
                bottom: -150,
                left: -50,
                right: -50,
                height: 300,
                borderTopLeftRadius: 200,
                borderTopRightRadius: 200,
                backgroundColor: COLORS.primary,
                opacity: 0.3,
        },
        content: {
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
        },
        title: {
                fontSize: 56,
                fontWeight: 'bold',
                color: COLORS.textDark,
                textAlign: 'center',
                lineHeight: 64,
                fontFamily: 'serif',
        },
        subtitle: {
                fontSize: 18,
                color: COLORS.textDark,
                marginTop: 10,
                fontWeight: '300',
        },
        button_container: {
                paddingHorizontal: 40,
                paddingBottom: 60,
                zIndex: 10,
        },
        loader: {
                marginTop: 30,
        },
});

export default SplashScreen;
