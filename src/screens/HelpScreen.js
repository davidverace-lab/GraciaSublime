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

const HelpScreen = ({ navigation }) => {
    const faqs = [
        {
            category: 'Sublimación',
            icon: 'print-outline',
            questions: [
                {
                    question: '¿Qué es la sublimación?',
                    answer:
                        'La sublimación es un proceso de impresión donde la tinta se convierte en gas y se fusiona con el material, creando un diseño permanente, resistente al lavado y de alta calidad.',
                },
                {
                    question: '¿Qué tipo de imágenes puedo sublimar?',
                    answer:
                        'Puedes sublimar fotografías, logotipos, textos, diseños personalizados y cualquier imagen digital. Recomendamos imágenes de alta resolución (300 DPI) para mejores resultados.',
                },
                {
                    question: '¿Los diseños se decoloran o se borran?',
                    answer:
                        'No. La sublimación es permanente. La tinta se fusiona con la cerámica a nivel molecular, por lo que no se desvanece, pela ni desgasta con el uso normal.',
                },
                {
                    question: '¿Puedo lavar mi taza sublimada en lavavajillas?',
                    answer:
                        'Sí, nuestras tazas sublimadas son aptas para lavavajillas. La imagen resistirá lavados repetidos sin perder calidad.',
                },
            ],
        },
        {
            category: 'Envíos',
            icon: 'car-outline',
            questions: [
                {
                    question: '¿Cuánto tiempo tarda el envío?',
                    answer:
                        'El tiempo de entrega es de 5-7 días hábiles para envíos nacionales después de confirmar tu pedido. Para envíos foráneos puede tomar 7-10 días hábiles.',
                },
                {
                    question: '¿Cuál es el costo de envío?',
                    answer:
                        'El costo de envío varía según tu ubicación. Al ingresar tu código postal podrás ver el costo exacto antes de finalizar tu compra. Envío gratis en compras mayores a $1000.',
                },
                {
                    question: '¿Hacen envíos a toda la República?',
                    answer:
                        'Sí, realizamos envíos a toda la República Mexicana a través de paqueterías confiables como DHL, Fedex y Estafeta.',
                },
                {
                    question: '¿Cómo puedo rastrear mi pedido?',
                    answer:
                        'Una vez que tu pedido sea enviado, recibirás un número de guía por correo electrónico. También puedes consultar el estado de tu pedido en la sección "Historial de Compras".',
                },
                {
                    question: '¿Qué hago si mi paquete llega dañado?',
                    answer:
                        'Si tu paquete llega dañado, contáctanos inmediatamente con fotos del daño. Reemplazaremos tu producto sin costo adicional.',
                },
            ],
        },
        {
            category: 'Pedidos',
            icon: 'bag-handle-outline',
            questions: [
                {
                    question: '¿Cuál es el pedido mínimo?',
                    answer:
                        'No hay pedido mínimo. Puedes comprar desde una taza personalizada.',
                },
                {
                    question: '¿Puedo cancelar mi pedido?',
                    answer:
                        'Sí, puedes cancelar tu pedido dentro de las primeras 24 horas después de haberlo realizado. Una vez que el producto entra a producción, no es posible cancelarlo.',
                },
                {
                    question: '¿Hacen pedidos al mayoreo?',
                    answer:
                        'Sí, manejamos pedidos al mayoreo con precios especiales. Contáctanos para cotizaciones de 50 piezas o más.',
                },
            ],
        },
    ];

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
                <Text style={styles.headerTitle}>Ayuda</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.welcomeSection}>
                    <Ionicons name="help-circle" size={60} color={COLORS.primary} />
                    <Text style={styles.welcomeTitle}>¿En qué podemos ayudarte?</Text>
                    <Text style={styles.welcomeText}>
                        Aquí encontrarás respuestas a las preguntas más frecuentes
                    </Text>
                </View>

                {faqs.map((category, catIndex) => (
                    <View key={catIndex} style={styles.categorySection}>
                        <View style={styles.categoryHeader}>
                            <Ionicons
                                name={category.icon}
                                size={24}
                                color={COLORS.primary}
                            />
                            <Text style={styles.categoryTitle}>{category.category}</Text>
                        </View>

                        {category.questions.map((faq, index) => (
                            <View key={index} style={styles.faqCard}>
                                <View style={styles.questionRow}>
                                    <Ionicons
                                        name="help-circle-outline"
                                        size={20}
                                        color={COLORS.primary}
                                    />
                                    <Text style={styles.question}>{faq.question}</Text>
                                </View>
                                <Text style={styles.answer}>{faq.answer}</Text>
                            </View>
                        ))}
                    </View>
                ))}

                <View style={styles.contactSection}>
                    <Text style={styles.sectionTitle}>¿No encontraste tu respuesta?</Text>
                    <Text style={styles.contactText}>
                        Nuestro equipo está listo para ayudarte
                    </Text>
                    <TouchableOpacity
                        style={styles.contactButton}
                        onPress={() => navigation.navigate('Contact')}
                    >
                        <Ionicons name="mail" size={20} color={COLORS.white} />
                        <Text style={styles.contactButtonText}>Contáctanos</Text>
                    </TouchableOpacity>
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
    welcomeSection: {
        alignItems: 'center',
        padding: 30,
        backgroundColor: COLORS.primaryLight,
        margin: 20,
        borderRadius: 20,
    },
    welcomeTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginTop: 15,
        marginBottom: 10,
    },
    welcomeText: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
    },
    categorySection: {
        paddingHorizontal: 20,
        marginBottom: 25,
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 2,
        borderBottomColor: COLORS.primary,
    },
    categoryTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginLeft: 10,
    },
    faqCard: {
        backgroundColor: COLORS.white,
        borderRadius: 15,
        padding: 18,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: COLORS.inputGray,
    },
    questionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    question: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginLeft: 10,
        flex: 1,
    },
    answer: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginLeft: 30,
    },
    contactSection: {
        padding: 20,
        marginTop: 20,
        marginBottom: 30,
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginBottom: 10,
    },
    contactText: {
        fontSize: 15,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    contactButton: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary,
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 5,
    },
    contactButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
});

export default HelpScreen;
