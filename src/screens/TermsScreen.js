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

const TermsScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Términos y Condiciones</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. Aceptación de Términos</Text>
                    <Text style={styles.text}>
                        Al acceder y utilizar la aplicación de Gracia Sublime, aceptas cumplir con estos
                        términos y condiciones de uso. Si no estás de acuerdo con alguno de estos términos,
                        por favor no utilices nuestra aplicación.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. Uso de la Aplicación</Text>
                    <Text style={styles.text}>
                        La aplicación Gracia Sublime te permite explorar, personalizar y comprar tazas
                        personalizadas. Te comprometes a usar la aplicación de manera responsable y conforme
                        a las leyes aplicables.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3. Cuenta de Usuario</Text>
                    <Text style={styles.text}>
                        Para realizar compras, deberás crear una cuenta proporcionando información precisa
                        y actualizada. Eres responsable de mantener la confidencialidad de tu contraseña
                        y de todas las actividades realizadas bajo tu cuenta.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>4. Pedidos y Pagos</Text>
                    <Text style={styles.text}>
                        Todos los pedidos están sujetos a disponibilidad y confirmación del precio. Nos
                        reservamos el derecho de rechazar cualquier pedido. Los precios mostrados incluyen
                        impuestos aplicables. El pago debe realizarse al momento de la compra.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>5. Personalización de Productos</Text>
                    <Text style={styles.text}>
                        Al cargar imágenes para personalizar productos, garantizas que tienes los derechos
                        necesarios sobre dichas imágenes y que no infringen derechos de terceros. No nos
                        hacemos responsables por el contenido de las imágenes proporcionadas.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>6. Envíos y Entregas</Text>
                    <Text style={styles.text}>
                        Los tiempos de envío son estimados y pueden variar. No nos hacemos responsables por
                        retrasos causados por circunstancias fuera de nuestro control. Es tu responsabilidad
                        proporcionar una dirección de envío correcta.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>7. Devoluciones y Reembolsos</Text>
                    <Text style={styles.text}>
                        Aceptamos devoluciones dentro de los 15 días posteriores a la recepción del producto,
                        siempre que el producto no haya sido personalizado y esté en su estado original.
                        Los productos personalizados no son elegibles para devolución.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>8. Modificaciones</Text>
                    <Text style={styles.text}>
                        Nos reservamos el derecho de modificar estos términos en cualquier momento. Los
                        cambios entrarán en vigor inmediatamente después de su publicación en la aplicación.
                    </Text>
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
    section: {
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
    },
    lastUpdate: {
        fontSize: 13,
        color: '#999',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default TermsScreen;
