import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Alert,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors.js';
import CustomButton from '../components/CustomButton.js';

const ContactScreen = ({ navigation }) => {
    const [email, set_email] = useState('');
    const [subject, set_subject] = useState('');
    const [message, set_message] = useState('');

    const handle_phone = () => {
        Alert.alert('Llamar', `Próximamente podrás llamar al: 229-247-6948`);
    };

    const handle_whats_app = () => {
        Alert.alert('WhatsApp', `Próximamente podrás chatear al: 229-247-6948`);
    };

    const handle_instagram = () => {
        Alert.alert('Instagram', `Próximamente podrás seguirnos en Instagram`);
    };

    const handle_facebook = () => {
        Alert.alert('Facebook', `Próximamente podrás seguirnos en Facebook`);
    };

    const handle_submit = () => {
        if (!email || !subject || !message) {
            Alert.alert('Error', 'Por favor completa todos los campos');
            return;
        }

        const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email_regex.test(email)) {
            Alert.alert('Error', 'Por favor ingresa un email válido');
            return;
        }

        Alert.alert(
            'Mensaje Enviado',
            'Gracias por contactarnos. Responderemos pronto.',
            [
                {
                    text: 'OK',
                    onPress: () => {
                        set_email('');
                        set_subject('');
                        set_message('');
                    },
                },
            ]
        );
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
                <Text style={styles.headerTitle}>Contáctanos</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Formulario de contacto */}
                <View style={styles.formSection}>
                    <View style={styles.formHeader}>
                        <Ionicons name="mail" size={32} color={COLORS.primary} />
                        <Text style={styles.formTitle}>Envíanos un mensaje</Text>
                    </View>
                    <Text style={styles.formSubtitle}>
                        Completa el formulario y nos pondremos en contacto contigo pronto
                    </Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Tu correo electrónico</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons
                                name="mail-outline"
                                size={20}
                                color="#999"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="correo@ejemplo.com"
                                placeholderTextColor="#999"
                                value={email}
                                onChangeText={set_email}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Asunto</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons
                                name="text-outline"
                                size={20}
                                color="#999"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="¿En qué podemos ayudarte?"
                                placeholderTextColor="#999"
                                value={subject}
                                onChangeText={set_subject}
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Mensaje</Text>
                        <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Describe tu situación..."
                                placeholderTextColor="#999"
                                value={message}
                                onChangeText={set_message}
                                multiline
                                numberOfLines={5}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>

                    <CustomButton title="Enviar Mensaje" on_press={handle_submit} />
                </View>

                {/* Otros medios de contacto */}
                <View style={styles.dividerSection}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>O contáctanos por</Text>
                    <View style={styles.dividerLine} />
                </View>

                <View style={styles.contactsContainer}>
                    <TouchableOpacity style={styles.contactCard} onPress={handle_phone}>
                        <View style={[styles.iconCircle, { backgroundColor: '#34A853' }]}>
                            <Ionicons name="call" size={24} color={COLORS.white} />
                        </View>
                        <View style={styles.contactInfo}>
                            <Text style={styles.contactLabel}>Teléfono</Text>
                            <Text style={styles.contactValue}>229-247-6948</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.contactCard} onPress={handle_whats_app}>
                        <View style={[styles.iconCircle, { backgroundColor: '#25D366' }]}>
                            <Ionicons name="logo-whatsapp" size={24} color={COLORS.white} />
                        </View>
                        <View style={styles.contactInfo}>
                            <Text style={styles.contactLabel}>WhatsApp</Text>
                            <Text style={styles.contactValue}>229-247-6948</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>
                </View>

                {/* Redes Sociales */}
                <View style={styles.socialSection}>
                    <Text style={styles.sectionTitle}>Síguenos</Text>
                    <View style={styles.socialButtons}>
                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={handle_instagram}
                        >
                            <Ionicons name="logo-instagram" size={28} color="#E4405F" />
                            <Text style={styles.socialText}>Instagram</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={handle_facebook}
                        >
                            <Ionicons name="logo-facebook" size={28} color="#1877F2" />
                            <Text style={styles.socialText}>Facebook</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Horario de atención */}
                <View style={styles.scheduleSection}>
                    <Text style={styles.sectionTitle}>Horario de Atención</Text>
                    <View style={styles.scheduleCard}>
                        <Ionicons name="time" size={24} color={COLORS.primary} />
                        <View style={styles.scheduleInfo}>
                            <Text style={styles.scheduleText}>
                                Lunes a Viernes: 9:00 AM - 6:00 PM
                            </Text>
                            <Text style={styles.scheduleText}>
                                Sábados: 10:00 AM - 2:00 PM
                            </Text>
                            <Text style={styles.scheduleText}>Domingos: Cerrado</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
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
    formSection: {
        backgroundColor: COLORS.white,
        margin: 15,
        padding: 20,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    formHeader: {
        alignItems: 'center',
        marginBottom: 10,
    },
    formTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginTop: 10,
    },
    formSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 25,
    },
    inputContainer: {
        marginBottom: 18,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textDark,
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.inputGray,
        borderRadius: 15,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    textAreaWrapper: {
        alignItems: 'flex-start',
        paddingVertical: 12,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: COLORS.textDark,
        paddingVertical: 12,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    dividerSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
        paddingHorizontal: 15,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e0e0e0',
    },
    dividerText: {
        marginHorizontal: 15,
        fontSize: 14,
        color: '#999',
    },
    contactsContainer: {
        paddingHorizontal: 15,
    },
    contactCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 15,
        padding: 15,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    iconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    contactInfo: {
        flex: 1,
    },
    contactLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 3,
    },
    contactValue: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.textDark,
    },
    socialSection: {
        paddingHorizontal: 15,
        marginTop: 10,
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textDark,
        marginBottom: 15,
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    socialButton: {
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: 18,
        borderRadius: 15,
        width: '48%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    socialText: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textDark,
    },
    scheduleSection: {
        paddingHorizontal: 15,
        marginBottom: 30,
    },
    scheduleCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    scheduleInfo: {
        flex: 1,
        marginLeft: 15,
    },
    scheduleText: {
        fontSize: 15,
        lineHeight: 24,
        color: COLORS.textDark,
    },
});

export default ContactScreen;
