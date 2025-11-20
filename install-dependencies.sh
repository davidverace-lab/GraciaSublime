#!/bin/bash

# Script de instalación de dependencias para Gracia Sublime
# Este script instala todas las dependencias necesarias para el proyecto

echo "🚀 Iniciando instalación de dependencias para Gracia Sublime..."
echo ""

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js primero."
    echo "Descarga desde: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js versión: $(node --version)"
echo "✅ NPM versión: $(npm --version)"
echo ""

# Verificar si existe package.json
if [ ! -f "package.json" ]; then
    echo "❌ package.json no encontrado. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

echo "📦 Instalando dependencias de NPM..."
npm install

# Verificar si la instalación fue exitosa
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ¡Dependencias instaladas correctamente!"
    echo ""
    echo "📋 Dependencias principales instaladas:"
    echo "   - @stripe/stripe-react-native"
    echo "   - @supabase/supabase-js"
    echo "   - @react-navigation/*"
    echo "   - expo y módulos relacionados"
    echo "   - Y muchas más..."
    echo ""
    echo "🎉 ¡Instalación completada!"
    echo ""
    echo "📝 Próximos pasos:"
    echo "   1. Configura tus claves de Stripe en src/config/stripe.js"
    echo "   2. Despliega la Edge Function de Stripe: supabase functions deploy create-payment-intent"
    echo "   3. Ejecuta la migración SQL en Supabase: supabase/migrations/add_stripe_payment_id_to_orders.sql"
    echo "   4. Inicia el proyecto: npm start"
    echo ""
else
    echo ""
    echo "❌ Error durante la instalación de dependencias."
    echo "Por favor revisa los errores anteriores e intenta nuevamente."
    exit 1
fi
