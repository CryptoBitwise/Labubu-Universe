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
    Modal,
    SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, spacing, fontSizes, shadows, gradients } from './designSystem';
import { CollectionItem } from './collectionService';
import { CollectionAnalytics } from './collectionAnalyticsService';
import { AchievementService, Achievement, UserAchievementProgress, AchievementCategory } from './achievementService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AchievementScreenProps {
    onBack: () => void;
    collectionItems: CollectionItem[];
    analytics: CollectionAnalytics;
}

export default function AchievementScreen({ onBack, collectionItems, analytics }: AchievementScreenProps) {
    const [progress, setProgress] = useState<UserAchievementProgress | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);

    useEffect(() => {
        loadAchievements();
    }, [collectionItems, analytics]);

    const loadAchievements = async () => {
        setLoading(true);
        try {
            // Check for new achievements
            const newUnlocks = await AchievementService.checkAchievements(collectionItems, analytics);

            // Load current progress
            const currentProgress = await AchievementService.getAchievementProgress();
            setProgress(currentProgress);

            // Show unlock modal if there are new achievements
            if (newUnlocks && newUnlocks.length > 0) {
                setNewlyUnlocked(newUnlocks);
                setShowUnlockModal(true);
            }
        } catch (error) {
            console.error('Error loading achievements:', error);
            Alert.alert('Error', 'Failed to load achievements');
            // Set default progress to prevent crashes
            const defaultProgress = await AchievementService.getAchievementProgress();
            setProgress(defaultProgress);
        } finally {
            setLoading(false);
        }
    };

    const renderAchievementCard = (achievement: Achievement) => {
        const isUnlocked = achievement.unlocked;
        const progressPercentage = Math.min((achievement.progress / achievement.target) * 100, 100);

        return (
            <View key={achievement.id} style={[
                styles.achievementCard,
                isUnlocked && styles.unlockedCard
            ]}>
                <View style={styles.achievementHeader}>
                    <View style={styles.achievementIcon}>
                        <Text style={styles.achievementIconText}>{achievement.icon}</Text>
                    </View>
                    <View style={styles.achievementInfo}>
                        <Text style={[
                            styles.achievementTitle,
                            !isUnlocked && styles.lockedText
                        ]}>
                            {achievement.title}
                        </Text>
                        <Text style={[
                            styles.achievementDescription,
                            !isUnlocked && styles.lockedText
                        ]}>
                            {achievement.description}
                        </Text>
                    </View>
                    <View style={styles.achievementPoints}>
                        <Text style={[
                            styles.pointsText,
                            isUnlocked && styles.unlockedPoints
                        ]}>
                            {achievement.points}
                        </Text>
                        <Text style={styles.pointsLabel}>pts</Text>
                    </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${progressPercentage}%`,
                                    backgroundColor: isUnlocked ? colors.success : AchievementService.getRarityColor(achievement.rarity)
                                }
                            ]}
                        />
                    </View>
                    <Text style={styles.progressText}>
                        {achievement.progress} / {achievement.target}
                    </Text>
                </View>

                {/* Rewards */}
                {isUnlocked && achievement.rewards.length > 0 && (
                    <View style={styles.rewardsContainer}>
                        <Text style={styles.rewardsTitle}>Rewards:</Text>
                        {achievement.rewards.map((reward, index) => (
                            <Text key={index} style={styles.rewardText}>
                                • {reward.description}
                            </Text>
                        ))}
                    </View>
                )}

                {/* Rarity Badge */}
                <View style={[
                    styles.rarityBadge,
                    { backgroundColor: AchievementService.getRarityColor(achievement.rarity) }
                ]}>
                    <Text style={styles.rarityText}>{achievement.rarity.toUpperCase()}</Text>
                </View>
            </View>
        );
    };

    const renderCategoryFilter = () => {
        const categories = [
            { id: 'all', name: 'All', icon: '🏆' },
            ...(progress?.categories || []).map(cat => ({
                id: cat.id,
                name: cat.name,
                icon: cat.icon
            }))
        ];

        return (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryFilter}
                contentContainerStyle={styles.categoryFilterContent}
            >
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        style={[
                            styles.categoryButton,
                            selectedCategory === category.id && styles.activeCategoryButton
                        ]}
                        onPress={() => setSelectedCategory(category.id)}
                    >
                        <Text style={styles.categoryIcon}>{category.icon}</Text>
                        <Text style={[
                            styles.categoryButtonText,
                            selectedCategory === category.id && styles.activeCategoryButtonText
                        ]}>
                            {category.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        );
    };

    const renderUnlockModal = () => {
        if (newlyUnlocked.length === 0) return null;

        return (
            <Modal
                visible={showUnlockModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowUnlockModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.unlockModal}>
                        <Text style={styles.unlockTitle}>🎉 Achievement Unlocked!</Text>

                        {newlyUnlocked.map((achievement, index) => (
                            <View key={achievement.id} style={styles.unlockAchievement}>
                                <Text style={styles.unlockIcon}>{achievement.icon}</Text>
                                <View style={styles.unlockInfo}>
                                    <Text style={styles.unlockAchievementTitle}>{achievement.title}</Text>
                                    <Text style={styles.unlockAchievementDescription}>{achievement.description}</Text>
                                    <Text style={styles.unlockPoints}>+{achievement.points} points</Text>
                                </View>
                            </View>
                        ))}

                        <TouchableOpacity
                            style={styles.unlockButton}
                            onPress={() => setShowUnlockModal(false)}
                        >
                            <Text style={styles.unlockButtonText}>Awesome!</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };

    const getFilteredAchievements = (): Achievement[] => {
        if (!progress || !progress.categories) return [];

        if (selectedCategory === 'all') {
            return progress.categories.flatMap(cat => cat.achievements || []);
        }

        const category = progress.categories.find(cat => cat.id === selectedCategory);
        return category ? (category.achievements || []) : [];
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading achievements...</Text>
            </View>
        );
    }

    if (!progress) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Unable to load achievements</Text>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const filteredAchievements = getFilteredAchievements();

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <LinearGradient colors={gradients.header} style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Achievements 🏆</Text>
                <View style={styles.headerSpacer} />
            </LinearGradient>

            {/* Progress Summary */}
            <View style={styles.progressSummary}>
                <View style={styles.levelContainer}>
                    <Text style={styles.levelText}>Level {progress.level}</Text>
                    <Text style={styles.pointsText}>{progress.totalPoints} points</Text>
                </View>
                <View style={styles.progressStats}>
                    <Text style={styles.statText}>
                        {progress.unlockedAchievements} / {progress.totalAchievements} unlocked
                    </Text>
                </View>
            </View>

            {/* Category Filter */}
            {renderCategoryFilter()}

            {/* Achievements List */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {filteredAchievements.map(renderAchievementCard)}
            </ScrollView>

            {/* Unlock Modal */}
            {renderUnlockModal()}
        </SafeAreaView>
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
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        ...shadows.card,
    },
    backButton: {
        padding: spacing.sm,
    },
    backButtonText: {
        fontSize: fontSizes.md,
        color: '#6C3DD1',
        fontWeight: '600',
    },
    headerTitle: {
        flex: 1,
        fontSize: fontSizes.xl,
        fontWeight: '700',
        color: '#6C3DD1',
        textAlign: 'center',
        letterSpacing: 1.2,
    },
    headerSpacer: {
        width: 60,
    },
    progressSummary: {
        backgroundColor: colors.card,
        padding: spacing.lg,
        margin: spacing.lg,
        borderRadius: 22,
        ...shadows.card,
    },
    levelContainer: {
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    levelText: {
        fontSize: fontSizes.xl,
        fontWeight: 'bold',
        color: colors.primary,
    },
    pointsText: {
        fontSize: fontSizes.md,
        color: colors.textSecondary,
    },
    progressStats: {
        alignItems: 'center',
    },
    statText: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
    },
    categoryFilter: {
        marginBottom: spacing.md,
    },
    categoryFilterContent: {
        paddingHorizontal: spacing.lg,
    },
    categoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        marginRight: spacing.sm,
        backgroundColor: colors.white,
        borderRadius: spacing.md,
        ...shadows.small,
    },
    activeCategoryButton: {
        backgroundColor: colors.primary,
    },
    categoryIcon: {
        fontSize: fontSizes.md,
        marginRight: spacing.xs,
    },
    categoryButtonText: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    activeCategoryButtonText: {
        color: colors.white,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    achievementCard: {
        backgroundColor: colors.card,
        borderRadius: 22,
        padding: spacing.lg,
        marginBottom: spacing.md,
        marginHorizontal: spacing.lg,
        ...shadows.card,
        opacity: 0.6,
    },
    unlockedCard: {
        opacity: 1,
        borderLeftWidth: 4,
        borderLeftColor: colors.success,
    },
    achievementHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    achievementIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    achievementIconText: {
        fontSize: fontSizes.xl,
    },
    achievementInfo: {
        flex: 1,
    },
    achievementTitle: {
        fontSize: fontSizes.md,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    achievementDescription: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        lineHeight: 18,
    },
    lockedText: {
        color: colors.textSecondary,
        opacity: 0.6,
    },
    achievementPoints: {
        alignItems: 'center',
    },
    unlockedPoints: {
        color: colors.success,
        fontWeight: 'bold',
    },
    pointsLabel: {
        fontSize: fontSizes.xs,
        color: colors.textSecondary,
    },
    progressContainer: {
        marginBottom: spacing.sm,
    },
    progressBar: {
        height: 6,
        backgroundColor: colors.background,
        borderRadius: 3,
        marginBottom: spacing.xs,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    progressText: {
        fontSize: fontSizes.xs,
        color: colors.textSecondary,
        textAlign: 'right',
    },
    rewardsContainer: {
        marginTop: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.background,
    },
    rewardsTitle: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    rewardText: {
        fontSize: fontSizes.xs,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    rarityBadge: {
        position: 'absolute',
        top: spacing.sm,
        right: spacing.sm,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        borderRadius: spacing.sm,
    },
    rarityText: {
        fontSize: fontSizes.xs,
        color: colors.white,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
    },
    unlockModal: {
        backgroundColor: colors.white,
        borderRadius: spacing.lg,
        padding: spacing.xl,
        alignItems: 'center',
        width: '100%',
        maxWidth: 400,
        ...shadows.large,
    },
    unlockTitle: {
        fontSize: fontSizes.xl,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: spacing.lg,
        textAlign: 'center',
    },
    unlockAchievement: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        width: '100%',
    },
    unlockIcon: {
        fontSize: fontSizes.xxl,
        marginRight: spacing.md,
    },
    unlockInfo: {
        flex: 1,
    },
    unlockAchievementTitle: {
        fontSize: fontSizes.md,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    unlockAchievementDescription: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    unlockPoints: {
        fontSize: fontSizes.sm,
        color: colors.success,
        fontWeight: '600',
    },
    unlockButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: spacing.md,
        marginTop: spacing.lg,
        ...shadows.small,
    },
    unlockButtonText: {
        color: colors.white,
        fontSize: fontSizes.md,
        fontWeight: 'bold',
    },
});
