import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const LoyaltyContext = createContext();

export const useLoyalty = () => {
    const context = useContext(LoyaltyContext);
    if (!context) {
        throw new Error('useLoyalty debe ser usado dentro de LoyaltyProvider');
    }
    return context;
};

export const LoyaltyProvider = ({ children }) => {
    const { user } = useAuth();
    const [loyaltyPoints, setLoyaltyPoints] = useState(0);
    const [membershipTier, setMembershipTier] = useState('bronze');
    const [transactions, setTransactions] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [unlockedAchievements, setUnlockedAchievements] = useState([]);

    // Niveles de membresía
    const tiers = {
        bronze: {
            name: 'Bronce',
            minPoints: 0,
            maxPoints: 999,
            color: '#CD7F32',
            icon: 'medal',
            benefits: [
                'Acumula 1 punto por cada $10',
                'Acceso a ofertas exclusivas',
                'Notificaciones de nuevos productos',
            ],
            pointsMultiplier: 1,
        },
        silver: {
            name: 'Plata',
            minPoints: 1000,
            maxPoints: 2999,
            color: '#C0C0C0',
            icon: 'medal',
            benefits: [
                'Acumula 1.5 puntos por cada $10',
                'Descuento del 5% en cumpleaños',
                'Envío gratis en compras mayores a $500',
                'Acceso anticipado a ventas',
            ],
            pointsMultiplier: 1.5,
        },
        gold: {
            name: 'Oro',
            minPoints: 3000,
            maxPoints: 5999,
            color: '#FFD700',
            icon: 'trophy',
            benefits: [
                'Acumula 2 puntos por cada $10',
                'Descuento del 10% en cumpleaños',
                'Envío gratis en todas las compras',
                'Soporte prioritario',
                'Acceso a productos exclusivos',
            ],
            pointsMultiplier: 2,
        },
        platinum: {
            name: 'Platino',
            minPoints: 6000,
            maxPoints: 999999,
            color: '#E5E4E2',
            icon: 'star',
            benefits: [
                'Acumula 3 puntos por cada $10',
                'Descuento del 15% en cumpleaños',
                'Envío gratis express',
                'Soporte VIP 24/7',
                'Acceso a eventos exclusivos',
                'Regalos sorpresa',
            ],
            pointsMultiplier: 3,
        },
    };

    // Logros predefinidos
    const defaultAchievements = [
        {
            id: 'first_purchase',
            name: 'Primera Compra',
            description: 'Realiza tu primera compra',
            icon: 'cart',
            pointsReward: 50,
            requirementType: 'orders_count',
            requirementValue: 1,
            color: '#4ECDC4',
        },
        {
            id: 'loyal_customer',
            name: 'Cliente Leal',
            description: 'Realiza 5 compras',
            icon: 'heart',
            pointsReward: 150,
            requirementType: 'orders_count',
            requirementValue: 5,
            color: '#FF6B6B',
        },
        {
            id: 'big_spender',
            name: 'Gran Comprador',
            description: 'Gasta más de $2000 en total',
            icon: 'cash',
            pointsReward: 200,
            requirementType: 'total_spent',
            requirementValue: 2000,
            color: '#FDB913',
        },
        {
            id: 'reviewer',
            name: 'Crítico',
            description: 'Deja 3 reseñas',
            icon: 'star',
            pointsReward: 100,
            requirementType: 'reviews_count',
            requirementValue: 3,
            color: '#95E1D3',
        },
        {
            id: 'social_butterfly',
            name: 'Mariposa Social',
            description: 'Refiere a 3 amigos',
            icon: 'people',
            pointsReward: 300,
            requirementType: 'referrals',
            requirementValue: 3,
            color: '#F38181',
        },
        {
            id: 'customizer',
            name: 'Personalizador',
            description: 'Compra 5 productos personalizados',
            icon: 'brush',
            pointsReward: 150,
            requirementType: 'custom_orders',
            requirementValue: 5,
            color: '#A8E6CF',
        },
    ];

    // Cargar datos al iniciar
    useEffect(() => {
        if (user) {
            loadLoyaltyData();
        }
    }, [user]);

    const loadLoyaltyData = async () => {
        try {
            const savedPoints = await AsyncStorage.getItem(`loyalty_points_${user.email}`);
            const savedTier = await AsyncStorage.getItem(`membership_tier_${user.email}`);
            const savedTransactions = await AsyncStorage.getItem(`loyalty_transactions_${user.email}`);
            const savedAchievements = await AsyncStorage.getItem(`unlocked_achievements_${user.email}`);

            if (savedPoints) setLoyaltyPoints(parseInt(savedPoints));
            if (savedTier) setMembershipTier(savedTier);
            if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
            if (savedAchievements) setUnlockedAchievements(JSON.parse(savedAchievements));

            setAchievements(defaultAchievements);
        } catch (error) {
            console.error('Error al cargar datos de lealtad:', error);
        }
    };

    // Calcular nivel según puntos
    const calculateTier = (points) => {
        if (points >= tiers.platinum.minPoints) return 'platinum';
        if (points >= tiers.gold.minPoints) return 'gold';
        if (points >= tiers.silver.minPoints) return 'silver';
        return 'bronze';
    };

    // Ganar puntos por compra
    const earnPointsFromPurchase = async (orderTotal) => {
        const basePoints = Math.floor(orderTotal / 10);
        const multiplier = tiers[membershipTier].pointsMultiplier;
        const pointsEarned = Math.floor(basePoints * multiplier);

        const newTransaction = {
            id: Date.now().toString(),
            type: 'earned',
            points: pointsEarned,
            description: `Compra de $${orderTotal.toFixed(2)}`,
            date: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Expira en 1 año
        };

        const updatedTransactions = [newTransaction, ...transactions];
        const newTotalPoints = loyaltyPoints + pointsEarned;
        const newTier = calculateTier(newTotalPoints);

        setTransactions(updatedTransactions);
        setLoyaltyPoints(newTotalPoints);

        // Actualizar tier si cambió
        if (newTier !== membershipTier) {
            setMembershipTier(newTier);
            await AsyncStorage.setItem(`membership_tier_${user.email}`, newTier);

            // Notificación de upgrade
            return {
                success: true,
                pointsEarned,
                newTotalPoints,
                tierUpgrade: true,
                newTier: tiers[newTier].name,
            };
        }

        await AsyncStorage.setItem(`loyalty_points_${user.email}`, newTotalPoints.toString());
        await AsyncStorage.setItem(`loyalty_transactions_${user.email}`, JSON.stringify(updatedTransactions));

        return {
            success: true,
            pointsEarned,
            newTotalPoints,
            tierUpgrade: false,
        };
    };

    // Canjear puntos
    const redeemPoints = async (pointsToRedeem, orderId, discountApplied) => {
        if (pointsToRedeem > loyaltyPoints) {
            return {
                success: false,
                message: 'No tienes suficientes puntos',
            };
        }

        const newTransaction = {
            id: Date.now().toString(),
            type: 'redeemed',
            points: -pointsToRedeem,
            description: `Descuento de $${discountApplied.toFixed(2)} en orden`,
            orderId: orderId,
            date: new Date().toISOString(),
        };

        const updatedTransactions = [newTransaction, ...transactions];
        const newTotalPoints = loyaltyPoints - pointsToRedeem;
        const newTier = calculateTier(newTotalPoints);

        setTransactions(updatedTransactions);
        setLoyaltyPoints(newTotalPoints);

        if (newTier !== membershipTier) {
            setMembershipTier(newTier);
            await AsyncStorage.setItem(`membership_tier_${user.email}`, newTier);
        }

        await AsyncStorage.setItem(`loyalty_points_${user.email}`, newTotalPoints.toString());
        await AsyncStorage.setItem(`loyalty_transactions_${user.email}`, JSON.stringify(updatedTransactions));

        return {
            success: true,
            newTotalPoints,
            message: `Has canjeado ${pointsToRedeem} puntos`,
        };
    };

    // Calcular descuento por puntos
    const calculatePointsDiscount = (points) => {
        // 100 puntos = $10 de descuento
        return (points / 100) * 10;
    };

    // Puntos máximos que se pueden usar en una compra
    const getMaxRedeemablePoints = (cartTotal) => {
        // Se pueden usar hasta el 50% del total de la compra
        const maxDiscount = cartTotal * 0.5;
        const maxPoints = Math.floor((maxDiscount / 10) * 100);
        return Math.min(maxPoints, loyaltyPoints);
    };

    // Otorgar puntos bonus
    const grantBonusPoints = async (points, description) => {
        const newTransaction = {
            id: Date.now().toString(),
            type: 'bonus',
            points: points,
            description: description,
            date: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        };

        const updatedTransactions = [newTransaction, ...transactions];
        const newTotalPoints = loyaltyPoints + points;
        const newTier = calculateTier(newTotalPoints);

        setTransactions(updatedTransactions);
        setLoyaltyPoints(newTotalPoints);

        if (newTier !== membershipTier) {
            setMembershipTier(newTier);
            await AsyncStorage.setItem(`membership_tier_${user.email}`, newTier);
        }

        await AsyncStorage.setItem(`loyalty_points_${user.email}`, newTotalPoints.toString());
        await AsyncStorage.setItem(`loyalty_transactions_${user.email}`, JSON.stringify(updatedTransactions));

        return { success: true, newTotalPoints };
    };

    // Desbloquear logro
    const unlockAchievement = async (achievementId) => {
        // Verificar si ya está desbloqueado
        if (unlockedAchievements.find(a => a.achievementId === achievementId)) {
            return { success: false, message: 'Logro ya desbloqueado' };
        }

        const achievement = achievements.find(a => a.id === achievementId);
        if (!achievement) {
            return { success: false, message: 'Logro no encontrado' };
        }

        const newUnlockedAchievement = {
            achievementId: achievement.id,
            name: achievement.name,
            description: achievement.description,
            pointsReward: achievement.pointsReward,
            unlockedAt: new Date().toISOString(),
        };

        const updatedUnlockedAchievements = [...unlockedAchievements, newUnlockedAchievement];
        setUnlockedAchievements(updatedUnlockedAchievements);

        // Otorgar puntos del logro
        await grantBonusPoints(achievement.pointsReward, `Logro desbloqueado: ${achievement.name}`);

        await AsyncStorage.setItem(
            `unlocked_achievements_${user.email}`,
            JSON.stringify(updatedUnlockedAchievements)
        );

        return {
            success: true,
            achievement: newUnlockedAchievement,
            pointsEarned: achievement.pointsReward,
        };
    };

    // Verificar logros automáticamente
    const checkAchievements = async (stats) => {
        const newlyUnlocked = [];

        for (const achievement of achievements) {
            // Si ya está desbloqueado, continuar
            if (unlockedAchievements.find(a => a.achievementId === achievement.id)) {
                continue;
            }

            let shouldUnlock = false;

            switch (achievement.requirementType) {
                case 'orders_count':
                    shouldUnlock = (stats.ordersCount || 0) >= achievement.requirementValue;
                    break;
                case 'total_spent':
                    shouldUnlock = (stats.totalSpent || 0) >= achievement.requirementValue;
                    break;
                case 'reviews_count':
                    shouldUnlock = (stats.reviewsCount || 0) >= achievement.requirementValue;
                    break;
                case 'referrals':
                    shouldUnlock = (stats.referrals || 0) >= achievement.requirementValue;
                    break;
                case 'custom_orders':
                    shouldUnlock = (stats.customOrders || 0) >= achievement.requirementValue;
                    break;
            }

            if (shouldUnlock) {
                const result = await unlockAchievement(achievement.id);
                if (result.success) {
                    newlyUnlocked.push(result.achievement);
                }
            }
        }

        return newlyUnlocked;
    };

    // Obtener progreso hacia el siguiente tier
    const getProgressToNextTier = () => {
        const currentTier = tiers[membershipTier];
        const nextTierKey = Object.keys(tiers).find(
            key => tiers[key].minPoints > currentTier.maxPoints
        );

        if (!nextTierKey) {
            return {
                isMaxTier: true,
                progress: 100,
                pointsNeeded: 0,
                nextTier: null,
            };
        }

        const nextTier = tiers[nextTierKey];
        const pointsNeeded = nextTier.minPoints - loyaltyPoints;
        const progress = ((loyaltyPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100;

        return {
            isMaxTier: false,
            progress: Math.min(progress, 100),
            pointsNeeded: Math.max(pointsNeeded, 0),
            nextTier: nextTier,
        };
    };

    const value = {
        loyaltyPoints,
        membershipTier,
        transactions,
        achievements,
        unlockedAchievements,
        tiers,
        earnPointsFromPurchase,
        redeemPoints,
        calculatePointsDiscount,
        getMaxRedeemablePoints,
        grantBonusPoints,
        unlockAchievement,
        checkAchievements,
        getProgressToNextTier,
        getCurrentTier: () => tiers[membershipTier],
    };

    return (
        <LoyaltyContext.Provider value={value}>
            {children}
        </LoyaltyContext.Provider>
    );
};
