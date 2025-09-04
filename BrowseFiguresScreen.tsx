import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, TextInput, ScrollView } from 'react-native';
import { colors, spacing, fontSizes, shadows } from './designSystem';
import { ALL_LABUBU_FIGURES } from './labubu_blind_box_data.js';
import { LabubuFigure } from './LabubuFiguresData';

export default function BrowseFiguresScreen({ onBack, owned, wishlist, addToOwned, addToWishlist }: {
    onBack: () => void;
    owned: string[];
    wishlist: string[];
    addToOwned: (id: string) => void;
    addToWishlist: (id: string) => void;
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [filterValue, setFilterValue] = useState('');

    // Get all unique series and rarities for filter chips
    const allSeries = useMemo(() => {
        const series = [...new Set(ALL_LABUBU_FIGURES.map(f => f.series))];
        return series.sort();
    }, []);

    const allRarities = useMemo(() => {
        const rarities = [...new Set(ALL_LABUBU_FIGURES.map(f => f.rarity))];
        return rarities.sort((a, b) => {
            const rarityOrder = { 'Common': 1, 'Uncommon': 2, 'Rare': 3, 'Very Rare': 4, 'Ultra Rare': 5 };
            return rarityOrder[a as keyof typeof rarityOrder] - rarityOrder[b as keyof typeof rarityOrder];
        });
    }, []);

    // Filter figures based on search and active filter
    const filteredFigures = useMemo(() => {
        let filtered = ALL_LABUBU_FIGURES;
        if (activeFilter === 'pendant') {
            filtered = filtered.filter(f => f.size === 'Standard' || f.size === 'Large');
        } else if (activeFilter === 'blindbox') {
            filtered = filtered.filter(f => f.size === 'Mini');
        } else if (activeFilter === 'series') {
            filtered = filtered.filter(f => f.series === filterValue);
        } else if (activeFilter === 'rarity') {
            filtered = filtered.filter(f => f.rarity === filterValue);
        }
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(f =>
                f.name.toLowerCase().includes(query) ||
                f.series.toLowerCase().includes(query) ||
                f.description.toLowerCase().includes(query)
            );
        }
        return filtered;
    }, [searchQuery, activeFilter, filterValue]);

    const handleFilterPress = (filterType: string, value: string = '') => {
        if (activeFilter === filterType && filterValue === value) {
            setActiveFilter('all');
            setFilterValue('');
        } else {
            setActiveFilter(filterType);
            setFilterValue(value);
        }
    };

    const clearFilters = () => {
        setActiveFilter('all');
        setFilterValue('');
    };

    const isFilterActive = activeFilter !== 'all';

    // Filter chips data
    const filterChips = [
        { id: 'all', label: 'All Figures', type: 'all', value: '' },
        { id: 'pendant', label: 'Pendants', type: 'pendant', value: '' },
        { id: 'blindbox', label: 'Blind Box', type: 'blindbox', value: '' },
        ...allSeries.map(series => ({ id: `series-${series}`, label: series, type: 'series', value: series })),
        ...allRarities.map(rarity => ({ id: `rarity-${rarity}`, label: rarity, type: 'rarity', value: rarity })),
    ];

    const renderFilterChip = ({ item }: { item: any }) => {
        const isActive = activeFilter === item.type && filterValue === item.value;
        return (
            <View key={item.id}>
                <TouchableOpacity
                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                    onPress={() => handleFilterPress(item.type, item.value)}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                        {item.label}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderFigure = ({ item }: { item: LabubuFigure }) => {
        const isOwned = owned.includes(item.id.toString());
        const isWishlisted = wishlist.includes(item.id.toString());
        const getRarityColor = (rarity: string) => {
            switch (rarity) {
                case 'Common': return '#8BC34A';
                case 'Uncommon': return '#2196F3';
                case 'Rare': return '#9C27B0';
                case 'Very Rare': return '#FF9800';
                case 'Ultra Rare': return '#F44336';
                default: return '#757575';
            }
        };
        return (
            <View style={styles.figureCard}>
                <View style={styles.figureHeader}>
                    <View style={styles.figureInfo}>
                        <Text style={styles.figureName}>{item.name}</Text>
                        <Text style={styles.figureSeries}>{item.series}</Text>
                        <View style={styles.figureMeta}>
                            <Text style={styles.figureSize}>{item.size}</Text>
                            <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(item.rarity) }]}>
                                <Text style={styles.rarityText}>{item.rarity}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.figureActions}>
                        <TouchableOpacity
                            style={[styles.actionButton, isOwned && styles.actionButtonActive]}
                            onPress={() => addToOwned(item.id.toString())}
                        >
                            <Text style={[styles.actionButtonText, isOwned && styles.actionButtonTextActive]}>
                                {isOwned ? '✓' : 'Own'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, isWishlisted && styles.actionButtonActive]}
                            onPress={() => addToWishlist(item.id.toString())}
                        >
                            <Text style={[styles.actionButtonText, isWishlisted && styles.actionButtonTextActive]}>
                                {isWishlisted ? '♥' : 'Wish'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <Text style={styles.figureDescription}>{item.description}</Text>
                <View style={styles.figureDetails}>
                    <Text style={styles.figureDetail}>Release: {item.releaseDate}</Text>
                    <Text style={styles.figureDetail}>Price: ${item.originalPrice}</Text>
                    <Text style={styles.figureDetail}>Value: ${item.estimatedValue.min}-{item.estimatedValue.max}</Text>
                    <Text style={styles.figureDetail}>Size: {item.dimensions}</Text>
                </View>
                {item.features.length > 0 && (
                    <View style={styles.featuresContainer}>
                        <Text style={styles.featuresTitle}>Features:</Text>
                        <View style={styles.featuresList}>
                            {item.features.map((feature, index) => (
                                <Text key={index} style={styles.featureItem}>• {feature}</Text>
                            ))}
                        </View>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={styles.headerRow}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backButtonText}>← Back to Home</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Browse Figures</Text>
            </View>
            {/* Filter Chips */}
            <View style={styles.filterContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterChipsContainer}
                >
                    {filterChips.map(chip => renderFilterChip({ item: chip }))}
                    {isFilterActive && (
                        <TouchableOpacity
                            style={styles.clearFilterChip}
                            onPress={clearFilters}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.clearFilterChipText}>Clear</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </View>
            {/* Search Bar */}
            <View style={styles.searchFilterRow}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search figures..."
                    placeholderTextColor={colors.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
            {/* Filter Count */}
            <View style={styles.filterCountContainer}>
                <Text style={styles.filterCountText}>
                    Showing {filteredFigures.length} of {ALL_LABUBU_FIGURES.length} figures
                </Text>
            </View>
            {/* Figures List */}
            <FlatList
                data={filteredFigures as any}
                renderItem={renderFigure}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.figuresList}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingTop: spacing.lg,
        marginBottom: spacing.sm,
    },
    backButton: {
        marginRight: spacing.sm,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        borderRadius: 12,
        backgroundColor: colors.accent,
    },
    backButtonText: {
        color: colors.text,
        fontSize: fontSizes.sm,
        fontWeight: 'bold',
    },
    title: {
        fontSize: fontSizes.xl,
        fontWeight: 'bold',
        color: colors.primary,
        flex: 1,
        textAlign: 'center',
        marginRight: 32,
    },
    searchFilterRow: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.sm,
        paddingTop: spacing.xs,
        backgroundColor: colors.background,
    },
    searchInput: {
        backgroundColor: colors.card,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        fontSize: fontSizes.md,
        marginBottom: spacing.sm,
        color: colors.text,
    },
    filterContainer: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
    },
    filterChipsContainer: {
        paddingRight: spacing.lg,
    },
    filterChip: {
        backgroundColor: colors.card,
        borderRadius: 20,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        marginRight: spacing.sm,
        borderWidth: 2,
        borderColor: colors.border,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    filterChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    filterChipText: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    filterChipTextActive: {
        color: colors.card,
        fontWeight: '700',
    },
    clearFilterChip: {
        backgroundColor: '#FFE5E5',
        borderRadius: 20,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        marginRight: spacing.sm,
        borderWidth: 2,
        borderColor: '#FFB3B3',
    },
    clearFilterChipText: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: '#D32F2F',
    },
    filterCountContainer: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.sm,
    },
    filterCountText: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    figuresList: {
        padding: spacing.md,
        paddingBottom: spacing.xl,
    },
    figureCard: {
        backgroundColor: colors.card,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.lg,
        marginBottom: spacing.md,
        ...shadows.card,
    },
    figureHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    figureInfo: {
        flex: 1,
    },
    figureName: {
        fontSize: fontSizes.lg,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    figureSeries: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    figureMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    figureSize: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginRight: spacing.xs,
    },
    rarityBadge: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rarityText: {
        color: colors.text,
        fontSize: fontSizes.xs,
        fontWeight: 'bold',
    },
    figureActions: {
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        backgroundColor: colors.accent,
        borderRadius: 12,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.card,
    },
    actionButtonActive: {
        backgroundColor: colors.primary,
    },
    actionButtonText: {
        color: colors.text,
        fontWeight: 'bold',
        fontSize: fontSizes.md,
    },
    actionButtonTextActive: {
        color: colors.card,
    },
    figureDescription: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
        marginBottom: spacing.sm,
    },
    figureDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: spacing.xs,
    },
    figureDetail: {
        fontSize: fontSizes.xs,
        color: colors.textSecondary,
        marginRight: spacing.sm,
        marginBottom: spacing.xs,
    },
    featuresContainer: {
        marginTop: spacing.xs,
        marginBottom: spacing.sm,
    },
    featuresTitle: {
        fontSize: fontSizes.sm,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    featuresList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    featureItem: {
        fontSize: fontSizes.xs,
        color: colors.textSecondary,
        marginRight: spacing.xs,
        marginBottom: spacing.xs,
    },
    figurePrice: {
        fontSize: fontSizes.md,
        fontWeight: 'bold',
        color: colors.primary,
        marginTop: spacing.xs,
    },
    secretRarity: {
        color: '#A259F7',
    },
    superSecretRarity: {
        color: '#FFD700',
    },
    commonRarity: {
        color: colors.primary,
    },
    actionRow: {
        flexDirection: 'row',
        marginTop: spacing.sm,
        gap: 10,
    },
    addOwnedBtn: {
        flex: 1,
        backgroundColor: colors.green,
        borderRadius: 12,
        paddingVertical: spacing.sm,
        alignItems: 'center',
        marginRight: 6,
        ...shadows.card,
    },
    addOwnedBtnText: {
        color: colors.text,
        fontWeight: 'bold',
        fontSize: fontSizes.md,
    },
    addWishlistBtn: {
        flex: 1,
        backgroundColor: colors.accent,
        borderRadius: 12,
        paddingVertical: spacing.sm,
        alignItems: 'center',
        marginLeft: 6,
        ...shadows.card,
    },
    addWishlistBtnText: {
        color: colors.text,
        fontWeight: 'bold',
        fontSize: fontSizes.md,
    },
    disabledBtn: {
        backgroundColor: colors.border,
    },
    disabledBtnText: {
        color: colors.textSecondary,
    },
    emptyMsg: {
        textAlign: 'center',
        color: colors.textSecondary,
        fontSize: fontSizes.md,
        marginTop: spacing.xl,
    },
    figureDesc: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
        marginBottom: spacing.sm,
    },
}); 