@echo off
REM Script de instalación de dependencias para Gracia Sublime (Windows)
REM Este script instala todas las dependencias necesarias para el proyecto

echo =============================================================
echo   Instalacion de dependencias para Gracia Sublime
echo =============================================================
echo.

REM Verificar si Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js no esta instalado.
    echo Por favor instala Node.js primero desde: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js version:
node --version
echo [OK] NPM version:
npm --version
echo.

REM Verificar si existe package.json
if not exist "package.json" (
    echo [ERROR] package.json no encontrado.
    echo Asegurate de estar en el directorio raiz del proyecto.
    pause
    exit /b 1
)

echo Instalando dependencias de NPM...
echo.
call npm install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo =============================================================
    echo   Dependencias instaladas correctamente!
    echo =============================================================
    echo.
    echo Dependencias principales instaladas:
    echo    - @stripe/stripe-react-native
    echo    - @supabase/supabase-js
    echo    - @react-navigation/*
    echo    - expo y modulos relacionados
    echo    - Y muchas mas...
    echo.
    echo =============================================================
    echo   Instalacion completada!
    echo =============================================================
    echo.
    echo Proximos pasos:
    echo    1. Configura tus claves de Stripe en src/config/stripe.js
    echo    2. Despliega la Edge Function de Stripe
    echo    3. Ejecuta la migracion SQL en Supabase
    echo    4. Inicia el proyecto: npm start
    echo.
) else (
    echo.
    echo [ERROR] Error durante la instalacion de dependencias.
    echo Por favor revisa los errores anteriores e intenta nuevamente.
    pause
    exit /b 1
)

pause
