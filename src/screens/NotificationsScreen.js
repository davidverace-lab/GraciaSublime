import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors.js';
import { useNotifications } from '../context/NotificationsContext.js';

const NotificationsScreen = ({ navigation }) => {
    const { notifications, mark_as_read, mark_all_as_read, delete_notification } = useNotifications();

    const handleNotificationPress = (notification) => {
        if (!notification.read) {
            mark_as_read(notification.id);
        }

        // Si la notificación tiene una acción, ejecutarla
        if (notification.action) {
            if (notification.action.type === 'navigate') {
                navigation.navigate(notification.action.screen, notification.action.params);
            }
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'offer':
                return 'pricetag';
            case 'news':
                return 'newspaper';
            default:
                return 'information-circle';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (hours < 1) return 'Hace unos momentos';
        if (hours < 24) return `Hace ${hours}h`;
        if (days === 1) return 'Ayer';
        return `Hace ${days} días`;
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notificaciones</Text>
                {notifications.some(n => !n.read) && (
                    <TouchableOpacity onPress={mark_all_as_read}>
                        <Text style={styles.markAllText}>Leer todo</Text>
                    </TouchableOpacity>
                )}
                {!notifications.some(n => !n.read) && <View style={styles.placeholder} />}
            </View>

            {/* Lista de notificaciones */}
            {notifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="notifications-off-outline" size={80} color="#ccc" />
                    <Text style={styles.emptyText}>No tienes notificaciones</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.notificationCard, !item.read && styles.unreadCard]}
                            onPress={() => handleNotificationPress(item)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.iconCircle}>
                                <Ionicons name={getIcon(item.type)} size={24} color={COLORS.primary} />
                            </View>
                            <View style={styles.notificationContent}>
                                <View style={styles.titleRow}>
                                    <Text style={styles.notificationTitle}>{item.title}</Text>
                                    {item.action && (
                                        <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
                                    )}
                                </View>
                                <Text style={styles.notificationMessage}>{item.message}</Text>
                                {item.action && (
                                    <Text style={styles.actionHint}>Toca para abrir</Text>
                                )}
                                <Text style={styles.notificationDate}>{formatDate(item.date)}</Text>
                            </View>
                            {!item.read && <View style={styles.unreadDot} />}
                            <TouchableOpacity
                                onPress={(e) => {
                                    e.stopPropagation();
                                    delete_notification(item.id);
                                }}
                                style={styles.deleteButton}
                            >
                                <Ionicons name="trash-outline" size={20} color="#999" />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
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
    markAllText: {
        fontSize: 14,
        color: COLORS.white,
        fontWeight: '600',
    },
    placeholder: {
        width: 60,
    },
    listContent: {
        padding: 15,
    },
    notificationCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 15,
        padding: 15,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    unreadCard: {
        backgroundColor: '#fffef0',
        borderColor: COLORS.primary,
    },
    iconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    notificationContent: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textDark,
        flex: 1,
    },
    notificationMessage: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    actionHint: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '600',
        marginBottom: 4,
        fontStyle: 'italic',
    },
    notificationDate: {
        fontSize: 12,
        color: '#999',
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
        marginRight: 10,
    },
    deleteButton: {
        padding: 5,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: '#999',
        marginTop: 15,
    },
});

export default NotificationsScreen;
