import { PRODUCTS } from '../data/products';

// Datos de ejemplo de pedidos para el panel de admin
export const MOCK_ORDERS = [
    {
        id: '1001',
        customer_name: 'María González',
        delivery_address: 'Calle Principal #123, Col. Centro, Ciudad de México',
        date: new Date(2025, 10, 8, 10, 30).toISOString(),
        status: 'Pendiente',
        items: [
            {
                product: PRODUCTS[0],
                quantity: 2,
                custom_design: {
                    type: 'uploaded',
                    image: '../../img/t1.jpeg',
                    text: 'Feliz Cumpleaños María',
                },
            },
            {
                product: PRODUCTS[2],
                quantity: 1,
            },
        ],
        subtotal: 620,
        delivery_fee: 50,
        total: 670,
        payment_method: 'Tarjeta de crédito',
        notes: 'Entregar antes de las 3 PM',
    },
    {
        id: '1002',
        customer_name: 'Juan Pérez',
        delivery_address: 'Av. Reforma #456, Col. Juárez, Ciudad de México',
        date: new Date(2025, 10, 9, 14, 15).toISOString(),
        status: 'Procesando',
        items: [
            {
                product: PRODUCTS[3],
                quantity: 1,
                custom_design: {
                    type: 'template',
                    template_id: 'anniversary',
                    text: 'Feliz Aniversario',
                },
            },
        ],
        subtotal: 280,
        delivery_fee: 50,
        total: 330,
        payment_method: 'PayPal',
    },
    {
        id: '1003',
        customer_name: 'Ana Martínez',
        delivery_address: 'Calle Morelos #789, Col. Del Valle, Monterrey, N.L.',
        date: new Date(2025, 10, 10, 9, 45).toISOString(),
        status: 'En Tránsito',
        items: [
            {
                product: PRODUCTS[4],
                quantity: 3,
                custom_design: {
                    type: 'template',
                    template_id: 'love',
                    text: 'Te Amo',
                },
            },
            {
                product: PRODUCTS[1],
                quantity: 2,
            },
        ],
        subtotal: 1190,
        delivery_fee: 80,
        total: 1270,
        payment_method: 'Transferencia',
    },
    {
        id: '1004',
        customer_name: 'Carlos Rodríguez',
        delivery_address: 'Calle Hidalgo #321, Col. Centro, Guadalajara, Jal.',
        date: new Date(2025, 10, 7, 16, 20).toISOString(),
        status: 'Completado',
        items: [
            {
                product: PRODUCTS[5],
                quantity: 1,
                custom_design: {
                    type: 'uploaded',
                    image: '../../img/t6.jpeg',
                    text: 'Gracias por tu amistad',
                },
            },
        ],
        subtotal: 230,
        delivery_fee: 50,
        total: 280,
        payment_method: 'Efectivo',
    },
    {
        id: '1005',
        customer_name: 'Laura Sánchez',
        delivery_address: 'Av. Universidad #567, Col. Narvarte, Ciudad de México',
        date: new Date(2025, 10, 11, 11, 0).toISOString(),
        status: 'Pendiente',
        items: [
            {
                product: PRODUCTS[0],
                quantity: 5,
                custom_design: {
                    type: 'template',
                    template_id: 'corporate',
                    text: 'Empresa XYZ',
                },
            },
        ],
        subtotal: 1000,
        delivery_fee: 50,
        total: 1050,
        payment_method: 'Tarjeta de crédito',
        notes: 'Pedido corporativo - Factura requerida',
    },
];

// Función para inicializar datos de ejemplo en AsyncStorage
export const initializeMockOrders = async (AsyncStorage) => {
    try {
        const existingOrders = await AsyncStorage.getItem('orders');
        if (!existingOrders) {
            await AsyncStorage.setItem('orders', JSON.stringify(MOCK_ORDERS));
            console.log('Datos de ejemplo de pedidos inicializados');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error al inicializar datos de ejemplo:', error);
        return false;
    }
};
