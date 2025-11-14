import React from 'react';
import {
        View,
        Text,
        StyleSheet,
        SafeAreaView,
        FlatList,
} from 'react-native';
import { COLORS } from '../constants/colors.js';
import ProductCard from '../components/ProductCard.js';
import { useFavorites } from '../context/FavoritesContext.js';

const FavoritesScreen = ({ navigation }) => {
        const { favorites } = useFavorites();

        return (
                <SafeAreaView style={styles.container}>
                        {/* Header */}
                        <View style={styles.header}>
                                <Text style={styles.header_title}>MIS FAVORITOS</Text>
                        </View>

                        {/* Lista de favoritos */}
                        {favorites.length === 0 ? (
                                <View style={styles.empty_container}>
                                        <Text style={styles.empty_text}>No tienes favoritos</Text>
                                        <Text style={styles.empty_subtext}>
                                                Agrega productos a favoritos para verlos aquí
                                        </Text>
                                </View>
                        ) : (
                                <FlatList
                                        data={favorites}
                                        renderItem={({ item }) => (
                                                <View style={styles.card_wrapper}>
                                                        <ProductCard
                                                                product={item.products || item}
                                                                onPress={() => navigation.navigate('ProductDetail', { product: item.products || item })}
                                                        />
                                                </View>
                                        )}
                                        keyExtractor={(item) => (item.favorite_id || item.id || Math.random()).toString()}
                                        numColumns={2}
                                        contentContainerStyle={styles.list_content}
                                        columnWrapperStyle={styles.row}
                                        showsVerticalScrollIndicator={false}
                                />
                        )}
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
                paddingVertical: 20,
                alignItems: 'center',
        },
        header_title: {
                fontSize: 24,
                fontWeight: 'bold',
                color: COLORS.white,
        },
        list_content: {
                padding: 15,
        },
        row: {
                justifyContent: 'space-between',
        },
        card_wrapper: {
                width: '48%',
        },
        empty_container: {
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 40,
        },
        empty_text: {
                fontSize: 24,
                fontWeight: 'bold',
                color: COLORS.textDark,
                marginBottom: 10,
        },
        empty_subtext: {
                fontSize: 16,
                color: '#666',
                textAlign: 'center',
        },
});

export default FavoritesScreen;
