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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, spacing, fontSizes, shadows, gradients } from './designSystem';
import { CollectionItem } from './collectionService';
import { CollectionAnalyticsService, CollectionAnalytics, Milestone } from './collectionAnalyticsService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CollectionAnalyticsScreenProps {
    onBack: () => void;
    collectionItems: CollectionItem[];
}

export default function CollectionAnalyticsScreen({ onBack, collectionItems }: CollectionAnalyticsScreenProps) {
    const [analytics, setAnalytics] = useState<CollectionAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState<'overview' | 'series' | 'rarity' | 'milestones'>('overview');

    useEffect(() => {
        console.log('CollectionAnalyticsScreen useEffect - collectionItems:', collectionItems);
        console.log('CollectionAnalyticsScreen useEffect - collectionItems type:', typeof collectionItems);
        console.log('CollectionAnalyticsScreen useEffect - collectionItems is array:', Array.isArray(collectionItems));
        generateAnalytics();
    }, [collectionItems]);

    const generateAnalytics = async () => {
        setLoading(true);
        try {
            console.log('Generating analytics for collection items:', collectionItems);
            const analyticsData = CollectionAnalyticsService.generateAnalytics(collectionItems);
            console.log('Generated analytics:', analyticsData);
            setAnalytics(analyticsData);
        } catch (error) {
            console.error('Error generating analytics:', error);
            Alert.alert('Error', 'Failed to generate collection analytics');
            // Set empty analytics to prevent render errors
            setAnalytics({
                totalFigures: 0,
                ownedCount: 0,
                wishlistCount: 0,
                completionPercentage: 0,
                totalValue: { min: 0, max: 0, average: 0 },
                ownedValue: { min: 0, max: 0, average: 0 },
                wishlistValue: { min: 0, max: 0, average: 0 },
                seriesStats: [],
                rarityStats: [],
                recentAdditions: [],
                milestones: []
            });
        } finally {
            setLoading(false);
        }
    };

    const renderOverview = () => {
        if (!analytics) return null;

        // Ensure analytics has all required properties
        const safeAnalytics = {
            totalFigures: analytics.totalFigures || 0,
            ownedCount: analytics.ownedCount || 0,
            wishlistCount: analytics.wishlistCount || 0,
            completionPercentage: analytics.completionPercentage || 0,
            totalValue: analytics.totalValue || { min: 0, max: 0, average: 0 },
            ownedValue: analytics.ownedValue || { min: 0, max: 0, average: 0 },
            wishlistValue: analytics.wishlistValue || { min: 0, max: 0, average: 0 },
            seriesStats: analytics.seriesStats || [],
            rarityStats: analytics.rarityStats || [],
            recentAdditions: analytics.recentAdditions || [],
            milestones: analytics.milestones || []
        };

        const insights = CollectionAnalyticsService.getCollectionInsights(safeAnalytics) || [];

        return (
            <View style={styles.tabContent}>
                {/* Key Stats Cards */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{safeAnalytics.ownedCount}</Text>
                        <Text style={styles.statLabel}>Owned</Text>
                        <Text style={styles.statSubtext}>of {safeAnalytics.totalFigures}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{safeAnalytics.completionPercentage}%</Text>
                        <Text style={styles.statLabel}>Complete</Text>
                        <Text style={styles.statSubtext}>Collection</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>${safeAnalytics.ownedValue.average.toLocaleString()}</Text>
                        <Text style={styles.statLabel}>Value</Text>
                        <Text style={styles.statSubtext}>Est. Worth</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{safeAnalytics.wishlistCount}</Text>
                        <Text style={styles.statLabel}>Wishlist</Text>
                        <Text style={styles.statSubtext}>Want List</Text>
                    </View>
                </View>

                {/* Insights */}
                <View style={styles.insightsSection}>
                    <Text style={styles.sectionTitle}>💡 Collection Insights</Text>
                    {insights && insights.map((insight, index) => (
                        <View key={index} style={styles.insightItem}>
                            <Text style={styles.insightText}>{insight}</Text>
                        </View>
                    ))}
                </View>

                {/* Recent Additions */}
                {safeAnalytics.recentAdditions && safeAnalytics.recentAdditions.length > 0 && (
                    <View style={styles.recentSection}>
                        <Text style={styles.sectionTitle}>📅 Recent Additions</Text>
                        {safeAnalytics.recentAdditions.slice(0, 5).map((item, index) => (
                            <View key={index} style={styles.recentItem}>
                                <Text style={styles.recentText}>
                                    Added {item.dateAdded ? new Date(item.dateAdded).toLocaleDateString() : 'Recently'}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    const renderSeries = () => {
        if (!analytics) return null;

        const safeAnalytics = {
            seriesStats: analytics.seriesStats || []
        };

        return (
            <View style={styles.tabContent}>
                <Text style={styles.sectionTitle}>📚 Series Progress</Text>
                {safeAnalytics.seriesStats.map((series, index) => (
                    <View key={index} style={styles.seriesCard}>
                        <View style={styles.seriesHeader}>
                            <Text style={styles.seriesName}>{series.seriesName}</Text>
                            <Text style={styles.seriesPercentage}>{series.completionPercentage}%</Text>
                        </View>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    { width: `${series.completionPercentage}%` }
                                ]}
                            />
                        </View>
                        <View style={styles.seriesStats}>
                            <Text style={styles.seriesStat}>
                                {series.ownedInSeries} / {series.totalInSeries} owned
                            </Text>
                            <Text style={styles.seriesStat}>
                                ${series.seriesValue.min} - ${series.seriesValue.max}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        );
    };

    const renderRarity = () => {
        if (!analytics) return null;

        const safeAnalytics = {
            rarityStats: analytics.rarityStats || []
        };

        return (
            <View style={styles.tabContent}>
                <Text style={styles.sectionTitle}>✨ Rarity Breakdown</Text>
                {safeAnalytics.rarityStats.map((rarity, index) => (
                    <View key={index} style={styles.rarityCard}>
                        <View style={styles.rarityHeader}>
                            <Text style={[styles.rarityName, { color: getRarityColor(rarity.rarity) }]}>
                                {rarity.rarity}
                            </Text>
                            <Text style={styles.rarityPercentage}>{rarity.completionPercentage}%</Text>
                        </View>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${rarity.completionPercentage}%`,
                                        backgroundColor: getRarityColor(rarity.rarity)
                                    }
                                ]}
                            />
                        </View>
                        <View style={styles.rarityStats}>
                            <Text style={styles.rarityStat}>
                                {rarity.ownedCount} / {rarity.totalCount} owned
                            </Text>
                            <Text style={styles.rarityStat}>
                                Avg: ${rarity.averageValue.toLocaleString()}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        );
    };

    const renderMilestones = () => {
        if (!analytics) return null;

        const safeAnalytics = {
            milestones: analytics.milestones || []
        };

        const completedMilestones = safeAnalytics.milestones.filter(m => m.completed);
        const pendingMilestones = safeAnalytics.milestones.filter(m => !m.completed);

        return (
            <View style={styles.tabContent}>
                <Text style={styles.sectionTitle}>🏆 Achievements</Text>

                {completedMilestones.length > 0 && (
                    <>
                        <Text style={styles.milestoneSubtitle}>✅ Completed</Text>
                        {completedMilestones.map((milestone, index) => (
                            <View key={index} style={[styles.milestoneCard, styles.completedMilestone]}>
                                <View style={styles.milestoneHeader}>
                                    <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                                    <Text style={styles.milestoneReward}>{milestone.reward}</Text>
                                </View>
                                <Text style={styles.milestoneDescription}>{milestone.description}</Text>
                                <View style={styles.milestoneProgress}>
                                    <Text style={styles.milestoneProgressText}>
                                        {milestone.current} / {milestone.target}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </>
                )}

                {pendingMilestones.length > 0 && (
                    <>
                        <Text style={styles.milestoneSubtitle}>🎯 In Progress</Text>
                        {pendingMilestones.slice(0, 5).map((milestone, index) => (
                            <View key={index} style={styles.milestoneCard}>
                                <View style={styles.milestoneHeader}>
                                    <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                                </View>
                                <Text style={styles.milestoneDescription}>{milestone.description}</Text>
                                <View style={styles.progressBar}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            { width: `${(milestone.current / milestone.target) * 100}%` }
                                        ]}
                                    />
                                </View>
                                <Text style={styles.milestoneProgressText}>
                                    {milestone.current} / {milestone.target}
                                </Text>
                            </View>
                        ))}
                    </>
                )}
            </View>
        );
    };

    const getRarityColor = (rarity: string): string => {
        switch (rarity) {
            case 'Ultra Rare': return '#FFD700';
            case 'Very Rare': return '#C0C0C0';
            case 'Rare': return '#CD7F32';
            case 'Uncommon': return '#9B59B6';
            case 'Common': return '#95A5A6';
            default: return colors.primary;
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Analyzing your collection...</Text>
            </View>
        );
    }

    // Safety check - if analytics is still null, show error
    if (!analytics) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Unable to load analytics</Text>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    try {
        return (
            <View style={styles.container}>
                {/* Header */}
                <LinearGradient colors={gradients.header || ['#FF6B9D', '#C44569']} style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Collection Analytics</Text>
                    <View style={styles.headerSpacer} />
                </LinearGradient>

                {/* Tab Navigation */}
                <View style={styles.tabNavigation}>
                    {(() => {
                        const tabs = [
                            { key: 'overview', label: 'Overview', icon: '📊' },
                            { key: 'series', label: 'Series', icon: '📚' },
                            { key: 'rarity', label: 'Rarity', icon: '✨' },
                            { key: 'milestones', label: 'Achievements', icon: '🏆' }
                        ];
                        return tabs.map((tab) => (
                            <TouchableOpacity
                                key={tab.key}
                                style={[
                                    styles.tabButton,
                                    selectedTab === tab.key && styles.activeTabButton
                                ]}
                                onPress={() => setSelectedTab(tab.key as any)}
                            >
                                <Text style={[
                                    styles.tabButtonText,
                                    selectedTab === tab.key && styles.activeTabButtonText
                                ]}>
                                    {tab.icon} {tab.label}
                                </Text>
                            </TouchableOpacity>
                        ));
                    })()}
                </View>

                {/* Tab Content */}
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {selectedTab === 'overview' && renderOverview()}
                    {selectedTab === 'series' && renderSeries()}
                    {selectedTab === 'rarity' && renderRarity()}
                    {selectedTab === 'milestones' && renderMilestones()}
                </ScrollView>
            </View>
        );
    } catch (error) {
        console.error('Error rendering CollectionAnalyticsScreen:', error);
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Error loading analytics</Text>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }
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
    tabNavigation: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        ...shadows.small,
    },
    tabButton: {
        flex: 1,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.xs,
        alignItems: 'center',
        borderRadius: spacing.sm,
        marginHorizontal: spacing.xs,
    },
    activeTabButton: {
        backgroundColor: colors.primary,
    },
    tabButtonText: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    activeTabButtonText: {
        color: colors.white,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: spacing.lg,
    },
    tabContent: {
        flex: 1,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: spacing.xl,
    },
    statCard: {
        width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2,
        backgroundColor: colors.white,
        padding: spacing.lg,
        borderRadius: spacing.md,
        alignItems: 'center',
        marginBottom: spacing.md,
        marginRight: spacing.md,
        ...shadows.small,
    },
    statNumber: {
        fontSize: fontSizes.xxl,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: spacing.xs,
    },
    statLabel: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    statSubtext: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
    },
    sectionTitle: {
        fontSize: fontSizes.lg,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: spacing.lg,
    },
    insightsSection: {
        marginBottom: spacing.xl,
    },
    insightItem: {
        backgroundColor: colors.white,
        padding: spacing.md,
        borderRadius: spacing.sm,
        marginBottom: spacing.sm,
        ...shadows.small,
    },
    insightText: {
        fontSize: fontSizes.md,
        color: colors.textPrimary,
        lineHeight: 22,
    },
    recentSection: {
        marginBottom: spacing.xl,
    },
    recentItem: {
        backgroundColor: colors.white,
        padding: spacing.md,
        borderRadius: spacing.sm,
        marginBottom: spacing.sm,
        ...shadows.small,
    },
    recentText: {
        fontSize: fontSizes.md,
        color: colors.textPrimary,
    },
    seriesCard: {
        backgroundColor: colors.white,
        padding: spacing.lg,
        borderRadius: spacing.md,
        marginBottom: spacing.md,
        ...shadows.small,
    },
    seriesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    seriesName: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.textPrimary,
        flex: 1,
    },
    seriesPercentage: {
        fontSize: fontSizes.md,
        fontWeight: 'bold',
        color: colors.primary,
    },
    progressBar: {
        height: 8,
        backgroundColor: colors.background,
        borderRadius: 4,
        marginBottom: spacing.sm,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 4,
    },
    seriesStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    seriesStat: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
    },
    rarityCard: {
        backgroundColor: colors.white,
        padding: spacing.lg,
        borderRadius: spacing.md,
        marginBottom: spacing.md,
        ...shadows.small,
    },
    rarityHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    rarityName: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        flex: 1,
    },
    rarityPercentage: {
        fontSize: fontSizes.md,
        fontWeight: 'bold',
        color: colors.primary,
    },
    rarityStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    rarityStat: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
    },
    milestoneSubtitle: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing.md,
        marginTop: spacing.lg,
    },
    milestoneCard: {
        backgroundColor: colors.white,
        padding: spacing.lg,
        borderRadius: spacing.md,
        marginBottom: spacing.md,
        ...shadows.small,
    },
    completedMilestone: {
        borderLeftWidth: 4,
        borderLeftColor: colors.success,
    },
    milestoneHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    milestoneTitle: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.textPrimary,
        flex: 1,
    },
    milestoneReward: {
        fontSize: fontSizes.sm,
        color: colors.primary,
        fontWeight: '600',
    },
    milestoneDescription: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    milestoneProgress: {
        alignItems: 'flex-end',
    },
    milestoneProgressText: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        fontWeight: '500',
    },
});
