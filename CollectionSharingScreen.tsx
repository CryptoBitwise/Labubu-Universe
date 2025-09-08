import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    Alert,
    Share,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, spacing, fontSizes, shadows, gradients } from './designSystem';
import { CollectionItem } from './collectionService';
import { CollectionAnalytics } from './collectionAnalyticsService';
import { Achievement } from './achievementService';
import { CollectionSharingService, ShareableContent } from './collectionSharingService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CollectionSharingScreenProps {
    onBack: () => void;
    collectionItems: CollectionItem[];
    analytics: CollectionAnalytics;
    achievements?: Achievement[];
}

export default function CollectionSharingScreen({
    onBack,
    collectionItems,
    analytics,
    achievements = []
}: CollectionSharingScreenProps) {
    const [shareableContent, setShareableContent] = useState<ShareableContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [sharing, setSharing] = useState(false);

    useEffect(() => {
        generateContent();
    }, [collectionItems.length, analytics?.ownedCount, analytics?.wishlistCount, analytics?.completionPercentage, analytics?.ownedValue?.average]);

    const generateContent = async () => {
        setLoading(true);
        console.log('Starting content generation...');

        try {
            // Create simple content directly without service
            const ownedItems = (collectionItems || []).filter(item => item.owned);
            const wishlistItems = (collectionItems || []).filter(item => item.wishlist);

            const content = {
                title: "My Labubu Collection",
                description: `Check out my amazing Labubu collection! I have ${ownedItems.length} figures and ${wishlistItems.length} on my wishlist.`,
                collectionStats: {
                    totalFigures: analytics?.totalFigures || 58,
                    ownedCount: ownedItems.length,
                    wishlistCount: wishlistItems.length,
                    completionPercentage: analytics?.completionPercentage || 0,
                    totalValue: analytics?.ownedValue?.average || 0
                },
                recentAdditions: ownedItems.slice(0, 5),
                achievements: achievements || [],
                photos: ownedItems.filter(item => item.userPhoto).map(item => item.userPhoto!)
            };

            console.log('Content generated:', content);
            setShareableContent(content);
        } catch (error) {
            console.error('Error generating shareable content:', error);
            // Set default content to prevent infinite loading
            setShareableContent({
                title: "My Labubu Collection",
                description: "Check out my Labubu collection!",
                collectionStats: {
                    totalFigures: 58,
                    ownedCount: 0,
                    wishlistCount: 0,
                    completionPercentage: 0,
                    totalValue: 0
                },
                recentAdditions: [],
                achievements: [],
                photos: []
            });
        } finally {
            setLoading(false);
            console.log('Content generation finished');
        }
    };

    const handleShareToSocial = async (platform: 'instagram' | 'twitter' | 'facebook' | 'general') => {
        if (!shareableContent) return;

        setSharing(true);
        try {
            // Generate simple text summary
            const { collectionStats, achievements } = shareableContent;

            let text = `🏆 My Labubu Collection 🏆\n\n`;
            text += `📦 Collection Stats:\n`;
            text += `• Owned: ${collectionStats.ownedCount} figures\n`;
            text += `• Wishlist: ${collectionStats.wishlistCount} figures\n`;
            text += `• Completion: ${collectionStats.completionPercentage}%\n`;
            text += `• Total Value: $${collectionStats.totalValue}\n\n`;
            text += `#Labubu #Collection #PopMart #Collectibles`;

            await Share.share({
                message: text,
                title: shareableContent.title,
                url: platform === 'instagram' ? 'https://labubuuniverse.app' : undefined
            });
        } catch (error) {
            console.error('Error sharing:', error);
            Alert.alert('Error', 'Failed to share content');
        } finally {
            setSharing(false);
        }
    };

    const handleExportData = async (format: 'json' | 'csv' | 'txt') => {
        if (!shareableContent) return;

        setSharing(true);
        try {
            let exportData = '';

            if (format === 'txt') {
                const { collectionStats } = shareableContent;
                exportData = `Labubu Collection Export\n\n`;
                exportData += `Owned: ${collectionStats.ownedCount} figures\n`;
                exportData += `Wishlist: ${collectionStats.wishlistCount} figures\n`;
                exportData += `Completion: ${collectionStats.completionPercentage}%\n`;
                exportData += `Total Value: $${collectionStats.totalValue}\n`;
            } else if (format === 'json') {
                exportData = JSON.stringify({
                    exportDate: new Date().toISOString(),
                    collection: shareableContent,
                    items: collectionItems || []
                }, null, 2);
            } else {
                exportData = 'CSV export coming soon!';
            }

            await Share.share({
                message: exportData,
                title: `Labubu Collection Export (${format.toUpperCase()})`
            });
        } catch (error) {
            console.error('Error exporting data:', error);
            Alert.alert('Error', 'Failed to export collection data');
        } finally {
            setSharing(false);
        }
    };

    const renderSharingCard = (title: string, description: string, icon: string, onPress: () => void, color: string = colors.primary) => (
        <TouchableOpacity style={styles.sharingCard} onPress={onPress} disabled={sharing}>
            <View style={[styles.cardIcon, { backgroundColor: color }]}>
                <Text style={styles.cardIconText}>{icon}</Text>
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardDescription}>{description}</Text>
            </View>
            <View style={styles.cardArrow}>
                <Text style={styles.arrowText}>→</Text>
            </View>
        </TouchableOpacity>
    );

    const renderCollectionStats = () => {
        if (!shareableContent) return null;

        const { collectionStats } = shareableContent;

        return (
            <View style={styles.statsContainer}>
                <Text style={styles.statsTitle}>Collection Overview</Text>
                <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{collectionStats.ownedCount}</Text>
                        <Text style={styles.statLabel}>Owned</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{collectionStats.wishlistCount}</Text>
                        <Text style={styles.statLabel}>Wishlist</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{collectionStats.completionPercentage}%</Text>
                        <Text style={styles.statLabel}>Complete</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>${collectionStats.totalValue}</Text>
                        <Text style={styles.statLabel}>Value</Text>
                    </View>
                </View>
            </View>
        );
    };

    const renderSharingSuggestions = () => {
        if (!shareableContent) return null;

        const suggestions = [];
        const { collectionStats } = shareableContent;

        if (collectionStats.ownedCount >= 10) {
            suggestions.push("Share your impressive collection size!");
        }
        if (collectionStats.completionPercentage >= 50) {
            suggestions.push("Show off your collection completion progress!");
        }
        if (collectionStats.totalValue >= 500) {
            suggestions.push("Share your valuable collection!");
        }
        if (suggestions.length === 0) {
            suggestions.push("Share your Labubu collection journey!");
        }

        return (
            <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>Sharing Ideas</Text>
                {suggestions.map((suggestion, index) => (
                    <View key={index} style={styles.suggestionItem}>
                        <Text style={styles.suggestionIcon}>💡</Text>
                        <Text style={styles.suggestionText}>{suggestion}</Text>
                    </View>
                ))}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Preparing your collection for sharing...</Text>
            </View>
        );
    }

    if (!shareableContent) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Unable to prepare sharing content</Text>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient colors={gradients.header || ['#FF6B9D', '#C44569']} style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Share Collection</Text>
                <View style={styles.headerSpacer} />
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Collection Stats */}
                {renderCollectionStats()}

                {/* Social Media Sharing */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Share to Social Media</Text>
                    {renderSharingCard(
                        'Share to Instagram',
                        'Post your collection stats and achievements',
                        '📸',
                        () => handleShareToSocial('instagram'),
                        '#E4405F'
                    )}
                    {renderSharingCard(
                        'Share to Twitter',
                        'Tweet about your Labubu collection',
                        '🐦',
                        () => handleShareToSocial('twitter'),
                        '#1DA1F2'
                    )}
                    {renderSharingCard(
                        'Share to Facebook',
                        'Post your collection on Facebook',
                        '📘',
                        () => handleShareToSocial('facebook'),
                        '#1877F2'
                    )}
                    {renderSharingCard(
                        'Share Anywhere',
                        'Copy text to share anywhere',
                        '📤',
                        () => handleShareToSocial('general'),
                        colors.primary
                    )}
                </View>

                {/* Export Options */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Export Collection Data</Text>
                    {renderSharingCard(
                        'Export as JSON',
                        'Download complete collection data',
                        '📄',
                        () => handleExportData('json'),
                        '#4CAF50'
                    )}
                    {renderSharingCard(
                        'Export as CSV',
                        'Spreadsheet format for analysis',
                        '📊',
                        () => handleExportData('csv'),
                        '#FF9800'
                    )}
                    {renderSharingCard(
                        'Export as Text',
                        'Simple text summary',
                        '📝',
                        () => handleExportData('txt'),
                        '#9C27B0'
                    )}
                </View>

                {/* Sharing Suggestions */}
                {renderSharingSuggestions()}

                {/* Loading Overlay */}
                {sharing && (
                    <View style={styles.sharingOverlay}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={styles.sharingText}>Sharing...</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    loadingText: {
        marginTop: spacing.md,
        fontSize: fontSizes.md,
        color: colors.textSecondary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        paddingTop: spacing.xl,
        ...shadows.medium,
    },
    backButton: {
        padding: spacing.sm,
    },
    backButtonText: {
        fontSize: fontSizes.md,
        color: colors.white,
        fontWeight: '600',
    },
    headerTitle: {
        flex: 1,
        fontSize: fontSizes.xl,
        fontWeight: 'bold',
        color: colors.white,
        textAlign: 'center',
    },
    headerSpacer: {
        width: 60,
    },
    content: {
        flex: 1,
    },
    statsContainer: {
        backgroundColor: colors.white,
        margin: spacing.lg,
        padding: spacing.lg,
        borderRadius: spacing.md,
        ...shadows.small,
    },
    statsTitle: {
        fontSize: fontSizes.lg,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: fontSizes.xl,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: spacing.xs,
    },
    statLabel: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
    },
    section: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: fontSizes.lg,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    sharingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: spacing.lg,
        borderRadius: spacing.md,
        marginBottom: spacing.sm,
        ...shadows.small,
    },
    cardIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    cardIconText: {
        fontSize: fontSizes.xl,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: fontSizes.md,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    cardDescription: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        lineHeight: 18,
    },
    cardArrow: {
        marginLeft: spacing.sm,
    },
    arrowText: {
        fontSize: fontSizes.lg,
        color: colors.textSecondary,
    },
    suggestionsContainer: {
        backgroundColor: colors.white,
        margin: spacing.lg,
        padding: spacing.lg,
        borderRadius: spacing.md,
        ...shadows.small,
    },
    suggestionsTitle: {
        fontSize: fontSizes.lg,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    suggestionIcon: {
        fontSize: fontSizes.md,
        marginRight: spacing.sm,
    },
    suggestionText: {
        flex: 1,
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        lineHeight: 18,
    },
    sharingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sharingText: {
        marginTop: spacing.md,
        fontSize: fontSizes.md,
        color: colors.white,
        fontWeight: '600',
    },
});
