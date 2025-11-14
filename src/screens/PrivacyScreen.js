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

const PrivacyScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacidad</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.introSection}>
                    <Ionicons name="shield-checkmark" size={60} color={COLORS.primary} />
                    <Text style={styles.introTitle}>Tu privacidad es importante</Text>
                    <Text style={styles.introText}>
                        En Gracia Sublime nos comprometemos a proteger tu información personal
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. Información que Recopilamos</Text>
                    <Text style={styles.text}>
                        Recopilamos información que nos proporcionas directamente, como:
                    </Text>
                    <Text style={styles.bulletPoint}>• Nombre completo</Text>
                    <Text style={styles.bulletPoint}>• Correo electrónico</Text>
                    <Text style={styles.bulletPoint}>• Número de teléfono</Text>
                    <Text style={styles.bulletPoint}>• Dirección de envío</Text>
                    <Text style={styles.bulletPoint}>• Imágenes para personalización</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. Cómo Usamos tu Información</Text>
                    <Text style={styles.text}>
                        Utilizamos tu información para:
                    </Text>
                    <Text style={styles.bulletPoint}>• Procesar y entregar tus pedidos</Text>
                    <Text style={styles.bulletPoint}>• Comunicarnos contigo sobre tu cuenta</Text>
                    <Text style={styles.bulletPoint}>• Mejorar nuestros servicios</Text>
                    <Text style={styles.bulletPoint}>• Enviar ofertas y promociones (con tu consentimiento)</Text>
                    <Text style={styles.bulletPoint}>• Personalizar tu experiencia</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3. Protección de Datos</Text>
                    <Text style={styles.text}>
                        Implementamos medidas de seguridad técnicas y organizativas para proteger tu
                        información contra acceso no autorizado, pérdida o alteración. Tus datos se
                        almacenan de forma segura en tu dispositivo y en servidores protegidos.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>4. Compartir Información</Text>
                    <Text style={styles.text}>
                        No vendemos ni compartimos tu información personal con terceros, excepto:
                    </Text>
                    <Text style={styles.bulletPoint}>
                        • Cuando sea necesario para procesar tu pedido (ej: servicios de envío)
                    </Text>
                    <Text style={styles.bulletPoint}>• Cuando la ley lo requiera</Text>
                    <Text style={styles.bulletPoint}>• Con tu consentimiento explícito</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>5. Imágenes Personalizadas</Text>
                    <Text style={styles.text}>
                        Las imágenes que cargas para personalizar productos se almacenan únicamente para
                        el propósito de crear tu pedido. No compartimos ni utilizamos estas imágenes para
                        ningún otro propósito sin tu autorización.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>6. Tus Derechos</Text>
                    <Text style={styles.text}>
                        Tienes derecho a:
                    </Text>
                    <Text style={styles.bulletPoint}>• Acceder a tu información personal</Text>
                    <Text style={styles.bulletPoint}>• Corregir datos inexactos</Text>
                    <Text style={styles.bulletPoint}>• Solicitar la eliminación de tus datos</Text>
                    <Text style={styles.bulletPoint}>• Oponerte al procesamiento de tus datos</Text>
                    <Text style={styles.bulletPoint}>• Revocar tu consentimiento en cualquier momento</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>7. Cookies y Tecnologías Similares</Text>
                    <Text style={styles.text}>
                        Utilizamos tecnologías de almacenamiento local para mejorar tu experiencia,
                        recordar tus preferencias y analizar el uso de la aplicación.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>8. Cambios a esta Política</Text>
                    <Text style={styles.text}>
                        Podemos actualizar esta política de privacidad ocasionalmente. Te notificaremos
                        sobre cambios significativos publicando la nueva política en la aplicación.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contáctanos</Text>
                    <Text style={styles.text}>
                        Si tienes preguntas sobre esta política de privacidad, contáctanos en:
                    </Text>
                    <Text style={styles.contactInfo}>contacto@graciasublime.com</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.lastUpdate}>
                        Última actualización: 5 de Noviembre de 2025
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
    introSection: {
        alignItems: 'center',
        padding: 30,
        backgroundColor: COLORS.primaryLight,
        marginBottom: 20,
    },
    introTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginTop: 15,
        marginBottom: 10,
    },
    introText: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginBottom: 10,
    },
    text: {
        fontSize: 15,
        color: '#666',
        lineHeight: 24,
        textAlign: 'justify',
        marginBottom: 8,
    },
    bulletPoint: {
        fontSize: 15,
        color: '#666',
        lineHeight: 24,
        marginLeft: 15,
        marginBottom: 4,
    },
    contactInfo: {
        fontSize: 15,
        color: COLORS.primary,
        fontWeight: '600',
        marginTop: 8,
    },
    lastUpdate: {
        fontSize: 13,
        color: '#999',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default PrivacyScreen;
