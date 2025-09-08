import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, ActivityIndicator, Animated, Image, Alert, Modal } from 'react-native';
import { ALL_LABUBU_FIGURES } from './labubu_blind_box_data.js';
import { colors, spacing, fontSizes, shadows, COLLECTION_LIMITS } from './designSystem';
import PhotoPicker from './PhotoPicker';
import { CollectionService } from './collectionService';
import CollectionAnalyticsScreen from './CollectionAnalyticsScreen';
import AchievementScreen from './AchievementScreen';

// Collection item type with user photo support
interface CollectionItem {
    figureId: string;
    owned: boolean;
    wishlist: boolean;
    userPhoto?: string;
    dateAdded?: string;
    notes?: string;
}

function EmptyCollection({ type }: { type: 'owned' | 'wishlist' }) {
    const [fadeAnim] = useState(new Animated.Value(0));
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);
    return (
        <Animated.View style={{
            opacity: fadeAnim,
            alignItems: 'center',
            marginTop: spacing.xl,
            backgroundColor: '#FFF6FB',
            borderRadius: 24,
            borderWidth: 2,
            borderColor: '#F7B2E6',
            padding: spacing.lg,
            shadowColor: '#F7B2E6',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 16,
            elevation: 4,
        }}>
            <Text style={{ fontSize: 48, marginBottom: spacing.sm, opacity: 0.7, textAlign: 'center' }}>🐰💖</Text>
            <Text style={{ color: colors.textSecondary, fontSize: fontSizes.lg, fontWeight: '700', textAlign: 'center' }}>
                {type === 'owned' ? 'No Labubus in your magical stash yet!' : 'No wishes in your Labubu dream list!'}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: fontSizes.md, marginTop: spacing.xs, textAlign: 'center' }}>
                {type === 'owned' ? 'Add your first Labubu and start your legendary collection! ✨' : 'Browse the parade and add Labubus to your wishlist! 🌈'}
            </Text>
        </Animated.View>
    );
}

export default function CollectionScreen({ onBack, onBrowse, owned, wishlist, collectionItems, moveToOwned, moveToWishlist, removeCompletely, onUpdatePhoto, onUpdateCollectionItems }: {
    onBack: () => void;
    onBrowse: () => void;
    owned: string[];
    wishlist: string[];
    collectionItems: CollectionItem[];
    moveToOwned: (id: string) => void;
    moveToWishlist: (id: string) => void;
    removeCompletely: (id: string) => void;
    onUpdatePhoto: (figureId: string) => void;
    onUpdateCollectionItems: (items: CollectionItem[]) => void;
}) {
    const [tab, setTab] = useState<'owned' | 'wishlist'>('owned');
    const [loading, setLoading] = useState(true);
    const [showPhotoPicker, setShowPhotoPicker] = useState(false);
    const [selectedFigureId, setSelectedFigureId] = useState<string | null>(null);
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [showAchievements, setShowAchievements] = useState(false);
    const [sortBy, setSortBy] = useState<'series' | 'name' | 'rarity' | 'date'>('series');
    // Sort figures based on selected sort option
    const sortFigures = (figures: any[]) => {
        return figures.sort((a, b) => {
            switch (sortBy) {
                case 'series':
                    return a.series.localeCompare(b.series) || a.name.localeCompare(b.name);
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'rarity':
                    const rarityOrder = ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Ultra Rare', 'Secret'];
                    const aRarityIndex = rarityOrder.indexOf(a.rarity);
                    const bRarityIndex = rarityOrder.indexOf(b.rarity);
                    return aRarityIndex - bRarityIndex || a.name.localeCompare(b.name);
                case 'date':
                    // Sort by date added (most recent first)
                    const aItem = collectionItems.find(item => item.figureId === a.id.toString());
                    const bItem = collectionItems.find(item => item.figureId === b.id.toString());
                    const aDate = aItem?.dateAdded || '';
                    const bDate = bItem?.dateAdded || '';
                    return bDate.localeCompare(aDate);
                default:
                    return 0;
            }
        });
    };

    const ownedFigures = sortFigures(ALL_LABUBU_FIGURES.filter(f => owned.includes(f.id.toString())));
    const wishlistFigures = sortFigures(ALL_LABUBU_FIGURES.filter(f => wishlist.includes(f.id.toString())));
    const ownedCount = ownedFigures.length;
    const wishlistCount = wishlistFigures.length;
    const collectionValue = ownedFigures.reduce((sum, f) => sum + f.estimatedValue.max, 0);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 700);
        return () => clearTimeout(timer);
    }, []);

    const handleUpdatePhoto = (figureId: string) => {
        console.log('CollectionScreen handleUpdatePhoto called with:', figureId);
        setSelectedFigureId(figureId);
        setShowPhotoPicker(true);
    };

    const handlePhotoSelected = (photoUri: string) => {
        console.log('CollectionScreen handlePhotoSelected called with:', photoUri, 'for figure:', selectedFigureId);

        if (selectedFigureId) {
            try {
                const existingItemIndex = collectionItems.findIndex(item => item.figureId === selectedFigureId);

                if (existingItemIndex >= 0) {
                    // Update existing collection item
                    const updatedItems = [...collectionItems];
                    updatedItems[existingItemIndex] = {
                        ...updatedItems[existingItemIndex],
                        userPhoto: photoUri !== 'skip' ? photoUri : undefined,
                    };
                    console.log('Updating existing item:', updatedItems[existingItemIndex]);
                    onUpdateCollectionItems(updatedItems);
                } else {
                    // Create new collection item
                    const newItem: CollectionItem = {
                        figureId: selectedFigureId,
                        owned: true,
                        wishlist: false,
                        userPhoto: photoUri !== 'skip' ? photoUri : undefined,
                        dateAdded: new Date().toISOString(),
                    };
                    const updatedItems = [...collectionItems, newItem];
                    console.log('Creating new item:', newItem);
                    onUpdateCollectionItems(updatedItems);
                }
            } catch (error) {
                console.error('Error in handlePhotoSelected:', error);
                Alert.alert('Error', 'Failed to save collection item');
            }
        }
        setShowPhotoPicker(false);
        setSelectedFigureId(null);
    };

    const handlePhotoPickerClose = () => {
        setShowPhotoPicker(false);
        setSelectedFigureId(null);
    };

    const renderFigure = (item: any, inOwned: boolean) => {
        // Find collection item with user photo
        const collectionItem = collectionItems.find(ci => ci.figureId === item.id.toString());

        return (
            <View style={styles.figureCard}>
                {/* User photo or placeholder */}
                {inOwned && collectionItem?.userPhoto ? (
                    <TouchableOpacity
                        style={styles.photoContainer}
                        onPress={() => handleUpdatePhoto(item.id.toString())}
                        activeOpacity={0.7}
                    >
                        <Image
                            source={{ uri: collectionItem.userPhoto }}
                            style={styles.userPhoto}
                            resizeMode="cover"
                        />
                        <Text style={styles.photoLabel}>Tap to Update Photo 📸</Text>
                    </TouchableOpacity>
                ) : inOwned ? (
                    <TouchableOpacity
                        style={styles.photoContainer}
                        onPress={() => handleUpdatePhoto(item.id.toString())}
                        activeOpacity={0.7}
                    >
                        <View style={styles.placeholderPhoto}>
                            <Text style={styles.placeholderText}>📷</Text>
                        </View>
                        <Text style={styles.photoLabel}>Tap to Add Photo</Text>
                    </TouchableOpacity>
                ) : null}

                <Text style={styles.figureName}>{item.name}</Text>
                <Text style={styles.figureSeries}>{item.series}</Text>
                <View style={styles.figureMeta}>
                    <Text style={styles.figureSize}>{item.size}</Text>
                    <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(item.rarity) }]}>
                        <Text style={styles.rarityText}>{item.rarity}</Text>
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
                            {item.features.map((feature: string, index: number) => (
                                <Text key={index} style={styles.featureItem}>• {feature}</Text>
                            ))}
                        </View>
                    </View>
                )}
                <View style={styles.actionRow}>
                    {inOwned ? (
                        <>
                            <TouchableOpacity
                                style={styles.moveBtn}
                                onPress={() => { moveToWishlist(item.id.toString()); }}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.moveBtnText}>Move to Wishlist</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.removeBtn}
                                onPress={() => { removeCompletely(item.id.toString()); }}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.removeBtnText}>Remove</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity
                                style={styles.moveBtn}
                                onPress={() => { moveToOwned(item.id.toString()); }}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.moveBtnText}>Move to Owned</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.removeBtn}
                                onPress={() => { removeCompletely(item.id.toString()); }}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.removeBtnText}>Remove</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        );
    };

    function getRarityColor(rarity: string) {
        switch (rarity) {
            case 'Common': return '#8BC34A';
            case 'Uncommon': return '#2196F3';
            case 'Rare': return '#9C27B0';
            case 'Very Rare': return '#FF9800';
            case 'Ultra Rare': return '#F44336';
            default: return '#757575';
        }
    }

    // Collection Limit Modal Component
    const CollectionLimitModal = () => (
        <Modal
            visible={showLimitModal}
            animationType="fade"
            transparent
            onRequestClose={() => setShowLimitModal(false)}
        >
            <View style={styles.limitModalOverlay}>
                <View style={styles.limitModalBox}>
                    <Text style={styles.limitModalTitle}>Beta Collection Limit Reached! 🚫</Text>
                    <Text style={styles.limitModalMessage}>
                        You've reached the maximum of {COLLECTION_LIMITS.BETA_MAX_FIGURES} figures for the beta version.
                    </Text>
                    <Text style={styles.limitModalSubMessage}>
                        Upgrade to premium for unlimited tracking.
                    </Text>
                    <Text style={styles.limitModalComingSoon}>
                        Coming soon! ✨
                    </Text>
                    <TouchableOpacity
                        style={styles.limitModalButton}
                        onPress={() => setShowLimitModal(false)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.limitModalButtonText}>Got it!</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={styles.headerRow}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backButtonText}>← Back to Home</Text>
                </TouchableOpacity>
                <Text style={styles.title}>My Collection</Text>
                <View style={styles.headerButtons}>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() => setShowAchievements(true)}
                    >
                        <Text style={styles.headerButtonText}>🏆</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() => setShowAnalytics(true)}
                    >
                        <Text style={styles.headerButtonText}>📊</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.tabRow}>
                <TouchableOpacity
                    style={[styles.tabBtn, tab === 'owned' && styles.tabBtnActive]}
                    onPress={() => setTab('owned')}
                >
                    <Text style={[styles.tabBtnText, tab === 'owned' && styles.tabBtnTextActive]}>Owned Labubus 🐰</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabBtn, tab === 'wishlist' && styles.tabBtnActive]}
                    onPress={() => setTab('wishlist')}
                >
                    <Text style={[styles.tabBtnText, tab === 'wishlist' && styles.tabBtnTextActive]}>Wishlist Dreams 🌈</Text>
                </TouchableOpacity>
            </View>

            {/* Sorting Options */}
            <View style={styles.sortRow}>
                <Text style={styles.sortLabel}>Sort by:</Text>
                <View style={styles.sortButtons}>
                    <TouchableOpacity
                        style={[styles.sortButton, sortBy === 'series' && styles.sortButtonActive]}
                        onPress={() => setSortBy('series')}
                    >
                        <Text style={[styles.sortButtonText, sortBy === 'series' && styles.sortButtonTextActive]}>Series</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.sortButton, sortBy === 'name' && styles.sortButtonActive]}
                        onPress={() => setSortBy('name')}
                    >
                        <Text style={[styles.sortButtonText, sortBy === 'name' && styles.sortButtonTextActive]}>Name</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.sortButton, sortBy === 'rarity' && styles.sortButtonActive]}
                        onPress={() => setSortBy('rarity')}
                    >
                        <Text style={[styles.sortButtonText, sortBy === 'rarity' && styles.sortButtonTextActive]}>Rarity</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.sortButton, sortBy === 'date' && styles.sortButtonActive]}
                        onPress={() => setSortBy('date')}
                    >
                        <Text style={[styles.sortButtonText, sortBy === 'date' && styles.sortButtonTextActive]}>Date</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.statsBox}>
                <Text style={styles.stat}>Collection: <Text style={styles.statValue}>{ownedCount}/{COLLECTION_LIMITS.BETA_MAX_FIGURES}</Text> figures</Text>
                <Text style={styles.stat}>Owned: <Text style={styles.statValue}>{ownedCount}</Text> figures</Text>
                <Text style={styles.stat}>Wishlist: <Text style={styles.statValue}>{wishlistCount}</Text> figures</Text>
                <Text style={styles.stat}>Collection Value: <Text style={styles.statValue}>${collectionValue}</Text></Text>
            </View>

            {/* Naming Note */}
            <View style={styles.namingNote}>
                <Text style={styles.namingNoteText}>
                    💡 Note: Some figures may have community nicknames (e.g., "Cozy Chair" is sometimes called "Sit Pretty")
                </Text>
            </View>
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : tab === 'owned' ? (
                ownedCount === 0 ? (
                    <EmptyCollection type="owned" />
                ) : (
                    <FlatList
                        data={ownedFigures}
                        keyExtractor={item => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                        renderItem={({ item, index }) => {
                            const showSeriesHeader = sortBy === 'series' &&
                                (index === 0 || ownedFigures[index - 1].series !== item.series);

                            return (
                                <View>
                                    {showSeriesHeader && (
                                        <View style={styles.seriesHeader}>
                                            <Text style={styles.seriesHeaderText}>{item.series}</Text>
                                        </View>
                                    )}
                                    {renderFigure(item, true)}
                                </View>
                            );
                        }}
                    />
                )
            ) : (
                wishlistCount === 0 ? (
                    <EmptyCollection type="wishlist" />
                ) : (
                    <FlatList
                        data={wishlistFigures}
                        keyExtractor={item => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                        renderItem={({ item, index }) => {
                            const showSeriesHeader = sortBy === 'series' &&
                                (index === 0 || wishlistFigures[index - 1].series !== item.series);

                            return (
                                <View>
                                    {showSeriesHeader && (
                                        <View style={styles.seriesHeader}>
                                            <Text style={styles.seriesHeaderText}>{item.series}</Text>
                                        </View>
                                    )}
                                    {renderFigure(item, false)}
                                </View>
                            );
                        }}
                    />
                )
            )}
            <TouchableOpacity style={styles.browseButton} onPress={onBrowse}>
                <Text style={styles.browseButtonText}>Browse Figures to Add</Text>
            </TouchableOpacity>
            <PhotoPicker
                visible={showPhotoPicker}
                figureId={selectedFigureId || ''}
                userId={CollectionService.getUserId()}
                onPhotoSelected={handlePhotoSelected}
                onClose={handlePhotoPickerClose}
            />
            <CollectionLimitModal />

            {/* Analytics Modal */}
            <Modal
                visible={showAnalytics}
                animationType="slide"
                presentationStyle="fullScreen"
            >
                <CollectionAnalyticsScreen
                    onBack={() => setShowAnalytics(false)}
                    collectionItems={collectionItems}
                />
            </Modal>

            {/* Achievement Modal */}
            <Modal
                visible={showAchievements}
                animationType="slide"
                presentationStyle="fullScreen"
            >
                <AchievementScreen
                    onBack={() => setShowAchievements(false)}
                    collectionItems={collectionItems}
                    analytics={{
                        totalFigures: ALL_LABUBU_FIGURES.length,
                        ownedCount: ownedCount,
                        wishlistCount: wishlistCount,
                        completionPercentage: Math.round((ownedCount / ALL_LABUBU_FIGURES.length) * 100),
                        totalValue: { min: collectionValue, max: collectionValue, average: collectionValue },
                        ownedValue: { min: collectionValue, max: collectionValue, average: collectionValue },
                        wishlistValue: { min: 0, max: 0, average: 0 },
                        seriesStats: [],
                        rarityStats: [],
                        recentAdditions: [],
                        milestones: []
                    }}
                />
            </Modal>
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
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerButton: {
        padding: spacing.sm,
        borderRadius: 12,
        backgroundColor: colors.accent,
        marginLeft: spacing.sm,
    },
    headerButtonText: {
        fontSize: fontSizes.lg,
        color: colors.text,
    },
    tabRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: spacing.sm,
        marginBottom: spacing.sm,
        gap: 10,
    },
    tabBtn: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        backgroundColor: colors.card,
        borderRadius: 12,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: colors.border,
    },
    tabBtnActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    tabBtnText: {
        color: colors.text,
        fontWeight: 'bold',
        fontSize: fontSizes.md,
    },
    tabBtnTextActive: {
        color: colors.card,
    },
    statsBox: {
        backgroundColor: colors.card,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.lg,
        marginBottom: spacing.md,
        marginHorizontal: spacing.md,
        ...shadows.card,
    },
    stat: {
        fontSize: fontSizes.md,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    statValue: {
        fontWeight: 'bold',
        color: colors.primary,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
    },
    listContent: {
        paddingBottom: spacing.lg,
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
    figureName: {
        fontSize: fontSizes.lg,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    figureSeries: {
        fontSize: fontSizes.md,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    figureMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    figureSize: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
    },
    rarityBadge: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        borderRadius: 10,
    },
    rarityText: {
        color: colors.text,
        fontSize: fontSizes.sm,
        fontWeight: 'bold',
    },
    figureDescription: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    figureDetails: {
        marginBottom: spacing.xs,
    },
    figureDetail: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginBottom: 2,
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
        marginLeft: spacing.sm,
    },
    featureItem: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginBottom: 1,
    },
    actionRow: {
        flexDirection: 'row',
        marginTop: spacing.sm,
        gap: 10,
    },
    moveBtn: {
        flex: 1,
        backgroundColor: colors.green,
        borderRadius: 12,
        paddingVertical: spacing.sm,
        alignItems: 'center',
        marginRight: 6,
        ...shadows.card,
    },
    moveBtnText: {
        color: colors.text,
        fontWeight: 'bold',
        fontSize: fontSizes.md,
    },
    removeBtn: {
        flex: 1,
        backgroundColor: colors.orange,
        borderRadius: 12,
        paddingVertical: spacing.sm,
        alignItems: 'center',
        marginLeft: 6,
        ...shadows.card,
    },
    removeBtnText: {
        color: colors.text,
        fontWeight: 'bold',
        fontSize: fontSizes.md,
    },
    emptyMsg: {
        textAlign: 'center',
        color: colors.textSecondary,
        fontSize: fontSizes.md,
        marginTop: spacing.xl,
    },
    browseButton: {
        backgroundColor: colors.primary,
        borderRadius: 16,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        alignItems: 'center',
        width: 260,
        marginTop: spacing.md,
        ...shadows.card,
    },
    browseButtonText: {
        color: colors.card,
        fontSize: fontSizes.md,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    photoContainer: {
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    userPhoto: {
        width: 120,
        height: 120,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: colors.primary,
        ...shadows.card,
    },
    placeholderPhoto: {
        width: 120,
        height: 120,
        borderRadius: 16,
        backgroundColor: colors.border,
        borderWidth: 2,
        borderColor: colors.textSecondary,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderText: {
        fontSize: 32,
        opacity: 0.5,
    },
    photoLabel: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
        fontWeight: '600',
    },
    // Collection Limit Modal Styles
    limitModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
    },
    limitModalBox: {
        backgroundColor: colors.card,
        borderRadius: 24,
        padding: spacing.xl,
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
        width: '100%',
        maxWidth: 320,
    },
    limitModalTitle: {
        fontSize: fontSizes.lg,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    limitModalMessage: {
        fontSize: fontSizes.md,
        color: colors.text,
        marginBottom: spacing.sm,
        textAlign: 'center',
        lineHeight: 22,
    },
    limitModalSubMessage: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
        textAlign: 'center',
        fontWeight: '600',
    },
    limitModalComingSoon: {
        fontSize: fontSizes.sm,
        color: colors.accent,
        marginBottom: spacing.lg,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    limitModalButton: {
        backgroundColor: colors.primary,
        borderRadius: 16,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.xl,
        alignItems: 'center',
        width: '100%',
        ...shadows.card,
    },
    limitModalButtonText: {
        color: colors.card,
        fontSize: fontSizes.md,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    // Sorting Styles
    sortRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        backgroundColor: colors.background,
    },
    sortLabel: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        fontWeight: '600',
        marginRight: spacing.sm,
    },
    sortButtons: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between',
    },
    sortButton: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        borderRadius: 12,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        minWidth: 60,
        alignItems: 'center',
    },
    sortButtonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    sortButtonText: {
        fontSize: fontSizes.xs,
        color: colors.textPrimary,
        fontWeight: '500',
    },
    sortButtonTextActive: {
        color: colors.white,
        fontWeight: '600',
    },
    // Naming Note Styles
    namingNote: {
        backgroundColor: '#FFF8E1',
        borderLeftWidth: 4,
        borderLeftColor: '#FFB74D',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.sm,
        borderRadius: 8,
    },
    namingNoteText: {
        fontSize: fontSizes.xs,
        color: '#E65100',
        lineHeight: 16,
        fontStyle: 'italic',
    },
    // Series Header Styles
    seriesHeader: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        marginTop: spacing.md,
        marginBottom: spacing.sm,
        borderRadius: 8,
        marginHorizontal: spacing.lg,
    },
    seriesHeaderText: {
        fontSize: fontSizes.md,
        fontWeight: 'bold',
        color: colors.white,
        textAlign: 'center',
    },
}); 