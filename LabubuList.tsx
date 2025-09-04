// React Native component (Expo)
import React from 'react';
import { FlatList, Linking, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { labubuFigures, LabubuFigure } from './LabubuFiguresData'; // Import your dataset
import { colors, spacing, fontSizes, shadows } from './designSystem';

const LabubuList = () => {
    const openBuyLink = (url: string) => {
        Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
    };

    const renderItem = ({ item }: { item: LabubuFigure }) => (
        <View style={styles.itemContainer}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.series}>{item.series}</Text>
            <Text style={styles.details}>Size: {item.size} | Rarity: {item.rarity}</Text>
            <Text style={styles.price}>Est. Value: ${item.estimatedValue.min} - ${item.estimatedValue.max}</Text>
            <TouchableOpacity
                style={styles.button}
                onPress={() => openBuyLink(item.buyLink)}
            >
                <Text style={styles.buttonText}>Click to Buy</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <FlatList
            data={labubuFigures}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            style={styles.list}
        />
    );
};

const styles = StyleSheet.create({
    list: {
        flex: 1,
        backgroundColor: colors.background
    },
    itemContainer: {
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.card,
        marginHorizontal: spacing.md,
        marginVertical: spacing.xs,
        borderRadius: 12,
        ...shadows.card,
    },
    name: {
        fontSize: fontSizes.lg,
        fontWeight: 'bold',
        color: colors.text
    },
    series: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs
    },
    details: {
        fontSize: fontSizes.xs,
        color: colors.textSecondary,
        marginTop: spacing.xs
    },
    price: {
        fontSize: fontSizes.xs,
        color: colors.textSecondary,
        marginTop: spacing.xs
    },
    button: {
        backgroundColor: colors.accent,
        padding: spacing.sm,
        borderRadius: 8,
        marginTop: spacing.sm,
        alignItems: 'center'
    },
    buttonText: {
        color: colors.text,
        fontSize: fontSizes.sm,
        fontWeight: 'bold'
    }
});

export default LabubuList;
