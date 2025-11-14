import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors.js';

const AboutScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Acerca de</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.logoContainer}>
                    <View style={styles.logo}>
                        <Ionicons name="cafe" size={60} color={COLORS.primary} />
                    </View>
                    <Text style={styles.brandName}>Gracia Sublime</Text>
                    <Text style={styles.slogan}>Tazas Personalizadas</Text>
                    <Text style={styles.version}>Versión 1.0.0</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Nuestra Historia</Text>
                    <Text style={styles.text}>
                        Gracia Sublime nació de la pasión por crear momentos especiales a través de productos
                        únicos y personalizados. Desde 2020, nos dedicamos a transformar tazas comunes en
                        piezas únicas que cuentan historias y guardan recuerdos.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Nuestra Misión</Text>
                    <Text style={styles.text}>
                        Ofrecer productos de la más alta calidad que permitan a nuestros clientes expresar
                        su creatividad y personalidad. Cada taza es elaborada con dedicación y atención al
                        detalle, porque creemos que los pequeños detalles hacen la diferencia.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>¿Qué nos hace especiales?</Text>
                    <View style={styles.feature}>
                        <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                        <Text style={styles.featureText}>
                            Personalización ilimitada con tus propias imágenes
                        </Text>
                    </View>
                    <View style={styles.feature}>
                        <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                        <Text style={styles.featureText}>
                            Materiales de alta calidad y durabilidad
                        </Text>
                    </View>
                    <View style={styles.feature}>
                        <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                        <Text style={styles.featureText}>
                            Proceso de impresión profesional
                        </Text>
                    </View>
                    <View style={styles.feature}>
                        <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                        <Text style={styles.featureText}>
                            Envíos rápidos y seguros a todo México
                        </Text>
                    </View>
                    <View style={styles.feature}>
                        <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                        <Text style={styles.featureText}>
                            Atención al cliente excepcional
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contacto</Text>
                    <View style={styles.contactItem}>
                        <Ionicons name="mail" size={20} color={COLORS.primary} />
                        <Text style={styles.contactText}>contacto@graciasublime.com</Text>
                    </View>
                    <View style={styles.contactItem}>
                        <Ionicons name="call" size={20} color={COLORS.primary} />
                        <Text style={styles.contactText}>+52 55 1234 5678</Text>
                    </View>
                    <View style={styles.contactItem}>
                        <Ionicons name="location" size={20} color={COLORS.primary} />
                        <Text style={styles.contactText}>Ciudad de México, México</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        © 2025 Gracia Sublime. Todos los derechos reservados.
                    </Text>
                </View>
            </ScrollView>
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
    placeholder: {
        width: 34,
    },
    content: {
        flex: 1,
    },
    logoContainer: {
        alignItems: 'center',
        paddingVertical: 40,
        backgroundColor: COLORS.primaryLight,
        marginBottom: 20,
    },
    logo: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    brandName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginBottom: 5,
    },
    slogan: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
    },
    version: {
        fontSize: 14,
        color: '#999',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginBottom: 12,
    },
    text: {
        fontSize: 15,
        color: '#666',
        lineHeight: 24,
        textAlign: 'justify',
    },
    feature: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    featureText: {
        fontSize: 15,
        color: '#666',
        marginLeft: 12,
        flex: 1,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    contactText: {
        fontSize: 15,
        color: '#666',
        marginLeft: 12,
    },
    footer: {
        padding: 20,
        alignItems: 'center',
        marginTop: 20,
    },
    footerText: {
        fontSize: 13,
        color: '#999',
        textAlign: 'center',
    },
});

export default AboutScreen;
