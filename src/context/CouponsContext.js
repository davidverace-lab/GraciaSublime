import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CouponsContext = createContext();

export const useCoupons = () => {
    const context = useContext(CouponsContext);
    if (!context) {
        throw new Error('useCoupons debe ser usado dentro de CouponsProvider');
    }
    return context;
};

export const CouponsProvider = ({ children }) => {
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [userCoupons, setUserCoupons] = useState([]);

    // Cupones predeterminados del sistema
    const defaultCoupons = [
        {
            id: 'WELCOME10',
            code: 'WELCOME10',
            name: 'Bienvenida',
            description: '10% de descuento en tu primera compra',
            discountType: 'percentage',
            discountValue: 10,
            minimumPurchase: 0,
            maximumDiscount: 100,
            validFrom: new Date('2025-01-01'),
            validUntil: new Date('2025-12-31'),
            isActive: true,
            usageLimit: 100,
            usageCount: 0,
            userUsageLimit: 1,
            icon: 'gift',
            color: '#FF6B6B',
        },
        {
            id: 'SUMMER25',
            code: 'SUMMER25',
            name: 'Verano 2025',
            description: '25% de descuento en compras mayores a $500',
            discountType: 'percentage',
            discountValue: 25,
            minimumPurchase: 500,
            maximumDiscount: 200,
            validFrom: new Date('2025-01-01'),
            validUntil: new Date('2025-12-31'),
            isActive: true,
            usageLimit: 200,
            usageCount: 0,
            userUsageLimit: 1,
            icon: 'sunny',
            color: '#FDB913',
        },
        {
            id: 'FREESHIP',
            code: 'FREESHIP',
            name: 'Envío Gratis',
            description: 'Envío gratis en compras mayores a $300',
            discountType: 'free_shipping',
            discountValue: 0,
            minimumPurchase: 300,
            maximumDiscount: null,
            validFrom: new Date('2025-01-01'),
            validUntil: new Date('2025-12-31'),
            isActive: true,
            usageLimit: null,
            usageCount: 0,
            userUsageLimit: 5,
            icon: 'car',
            color: '#4ECDC4',
        },
        {
            id: 'SAVE50',
            code: 'SAVE50',
            name: 'Ahorra $50',
            description: '$50 de descuento en compras mayores a $400',
            discountType: 'fixed_amount',
            discountValue: 50,
            minimumPurchase: 400,
            maximumDiscount: null,
            validFrom: new Date('2025-01-01'),
            validUntil: new Date('2025-12-31'),
            isActive: true,
            usageLimit: 150,
            usageCount: 0,
            userUsageLimit: 2,
            icon: 'pricetag',
            color: '#95E1D3',
        },
        {
            id: 'MEGASALE',
            code: 'MEGASALE',
            name: 'Mega Sale',
            description: '35% de descuento en compras mayores a $800',
            discountType: 'percentage',
            discountValue: 35,
            minimumPurchase: 800,
            maximumDiscount: 300,
            validFrom: new Date('2025-01-01'),
            validUntil: new Date('2025-12-31'),
            isActive: true,
            usageLimit: 50,
            usageCount: 0,
            userUsageLimit: 1,
            icon: 'sparkles',
            color: '#F38181',
        },
    ];

    // Cargar cupones al iniciar
    useEffect(() => {
        loadCouponsData();
    }, []);

    const loadCouponsData = async () => {
        try {
            const savedCoupons = await AsyncStorage.getItem('available_coupons');
            const savedUserCoupons = await AsyncStorage.getItem('user_coupons');

            if (savedCoupons) {
                setAvailableCoupons(JSON.parse(savedCoupons));
            } else {
                setAvailableCoupons(defaultCoupons);
                await AsyncStorage.setItem('available_coupons', JSON.stringify(defaultCoupons));
            }

            if (savedUserCoupons) {
                setUserCoupons(JSON.parse(savedUserCoupons));
            }
        } catch (error) {
            console.error('Error al cargar cupones:', error);
            setAvailableCoupons(defaultCoupons);
        }
    };

    // Validar cupón
    const validateCoupon = (couponCode, cartTotal) => {
        const coupon = availableCoupons.find(
            c => c.code.toUpperCase() === couponCode.toUpperCase() && c.isActive
        );

        if (!coupon) {
            return {
                isValid: false,
                message: 'Cupón no válido o expirado',
            };
        }

        // Verificar fechas de validez
        const now = new Date();
        if (now < new Date(coupon.validFrom) || now > new Date(coupon.validUntil)) {
            return {
                isValid: false,
                message: 'Este cupón ha expirado',
            };
        }

        // Verificar monto mínimo
        if (cartTotal < coupon.minimumPurchase) {
            return {
                isValid: false,
                message: `Compra mínima de $${coupon.minimumPurchase} requerida`,
            };
        }

        // Verificar límite de uso del usuario
        const userUsageCount = userCoupons.filter(uc => uc.couponId === coupon.id).length;
        if (userUsageCount >= coupon.userUsageLimit) {
            return {
                isValid: false,
                message: 'Ya has usado este cupón el máximo de veces permitido',
            };
        }

        // Verificar límite de uso total
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            return {
                isValid: false,
                message: 'Este cupón ha alcanzado el límite de usos',
            };
        }

        return {
            isValid: true,
            coupon: coupon,
            message: 'Cupón aplicado exitosamente',
        };
    };

    // Calcular descuento
    const calculateDiscount = (coupon, cartTotal, shippingCost = 0) => {
        if (!coupon) return { discount: 0, finalTotal: cartTotal + shippingCost, freeShipping: false };

        let discount = 0;
        let freeShipping = false;

        if (coupon.discountType === 'percentage') {
            discount = (cartTotal * coupon.discountValue) / 100;
            if (coupon.maximumDiscount) {
                discount = Math.min(discount, coupon.maximumDiscount);
            }
        } else if (coupon.discountType === 'fixed_amount') {
            discount = Math.min(coupon.discountValue, cartTotal);
        } else if (coupon.discountType === 'free_shipping') {
            freeShipping = true;
            discount = 0; // El descuento se aplicará en el costo de envío
        }

        const finalShippingCost = freeShipping ? 0 : shippingCost;
        const finalTotal = Math.max(0, cartTotal - discount + finalShippingCost);

        return {
            discount: discount,
            finalTotal: finalTotal,
            freeShipping: freeShipping,
            savedAmount: discount + (freeShipping ? shippingCost : 0),
        };
    };

    // Aplicar cupón
    const applyCoupon = async (couponCode, cartTotal) => {
        const validation = validateCoupon(couponCode, cartTotal);

        if (!validation.isValid) {
            return {
                success: false,
                message: validation.message,
            };
        }

        setAppliedCoupon(validation.coupon);

        return {
            success: true,
            message: validation.message,
            coupon: validation.coupon,
        };
    };

    // Remover cupón aplicado
    const removeCoupon = () => {
        setAppliedCoupon(null);
    };

    // Registrar uso de cupón
    const registerCouponUsage = async (couponId, orderId, discountApplied) => {
        try {
            // Incrementar contador de uso del cupón
            const updatedCoupons = availableCoupons.map(coupon => {
                if (coupon.id === couponId) {
                    return {
                        ...coupon,
                        usageCount: coupon.usageCount + 1,
                    };
                }
                return coupon;
            });

            setAvailableCoupons(updatedCoupons);
            await AsyncStorage.setItem('available_coupons', JSON.stringify(updatedCoupons));

            // Registrar uso del usuario
            const newUserCoupon = {
                id: Date.now().toString(),
                couponId: couponId,
                orderId: orderId,
                discountApplied: discountApplied,
                usedAt: new Date().toISOString(),
            };

            const updatedUserCoupons = [...userCoupons, newUserCoupon];
            setUserCoupons(updatedUserCoupons);
            await AsyncStorage.setItem('user_coupons', JSON.stringify(updatedUserCoupons));

            // Limpiar cupón aplicado
            setAppliedCoupon(null);

            return { success: true };
        } catch (error) {
            console.error('Error al registrar uso de cupón:', error);
            return { success: false, error };
        }
    };

    // Obtener cupones disponibles para el usuario
    const getAvailableCouponsForUser = (cartTotal) => {
        const now = new Date();
        return availableCoupons.filter(coupon => {
            if (!coupon.isActive) return false;
            if (now < new Date(coupon.validFrom) || now > new Date(coupon.validUntil)) return false;
            if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return false;

            const userUsageCount = userCoupons.filter(uc => uc.couponId === coupon.id).length;
            if (userUsageCount >= coupon.userUsageLimit) return false;

            // Mostrar todos los cupones, incluso si no cumplen el mínimo
            // (pero se indicará en la UI si está disponible o no)
            return true;
        });
    };

    // Verificar si un cupón está disponible para el usuario
    const isCouponAvailableForUser = (couponId, cartTotal) => {
        const coupon = availableCoupons.find(c => c.id === couponId);
        if (!coupon) return false;

        const userUsageCount = userCoupons.filter(uc => uc.couponId === couponId).length;
        const meetsMinimum = cartTotal >= coupon.minimumPurchase;
        const hasUsageLeft = userUsageCount < coupon.userUsageLimit;

        return meetsMinimum && hasUsageLeft;
    };

    const value = {
        availableCoupons,
        appliedCoupon,
        userCoupons,
        validateCoupon,
        calculateDiscount,
        applyCoupon,
        removeCoupon,
        registerCouponUsage,
        getAvailableCouponsForUser,
        isCouponAvailableForUser,
    };

    return (
        <CouponsContext.Provider value={value}>
            {children}
        </CouponsContext.Provider>
    );
};
