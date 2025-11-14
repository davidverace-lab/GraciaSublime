import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const StatCard = ({
    title,
    value,
    icon,
    gradient = [COLORS.primary, COLORS.secondary],
    subtitle,
    trend,
    onPress,
}) => {
    const CardWrapper = onPress ? TouchableOpacity : View;

    return (
        <CardWrapper onPress={onPress} activeOpacity={0.8}>
            <View style={[styles.card, { backgroundColor: gradient[0] }]}>
                <View style={styles.header}>
                    <View style={styles.icon_container}>
                        <Ionicons name={icon} size={24} color={COLORS.white} />
                    </View>
                    {trend && (
                        <View
                            style={[
                                styles.trend,
                                { backgroundColor: trend > 0 ? '#4CAF50' : '#F44336' },
                            ]}
                        >
                            <Ionicons
                                name={trend > 0 ? 'trending-up' : 'trending-down'}
                                size={12}
                                color={COLORS.white}
                            />
                            <Text style={styles.trend_text}>{Math.abs(trend)}%</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.value}>{value}</Text>
                <Text style={styles.title}>{title}</Text>

                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
        </CardWrapper>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    icon_container: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    trend: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    trend_text: {
        color: COLORS.white,
        fontSize: 11,
        fontWeight: 'bold',
        marginLeft: 2,
    },
    value: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 5,
    },
    title: {
        fontSize: 14,
        color: COLORS.white,
        opacity: 0.9,
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 12,
        color: COLORS.white,
        opacity: 0.7,
    },
});

export default StatCard;
