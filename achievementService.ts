import { CollectionItem } from './collectionService';
import { CollectionAnalytics } from './collectionAnalyticsService';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    category: 'collection' | 'value' | 'series' | 'rarity' | 'social' | 'special';
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    points: number;
    unlocked: boolean;
    unlockedAt?: string;
    progress: number;
    target: number;
    requirements: AchievementRequirement[];
    rewards: AchievementReward[];
}

export interface AchievementRequirement {
    type: 'owned_count' | 'value_threshold' | 'series_complete' | 'rarity_count' | 'consecutive_days' | 'social_share';
    value: number;
    description: string;
}

export interface AchievementReward {
    type: 'title' | 'badge' | 'points' | 'unlock_feature';
    value: string | number;
    description: string;
}

export interface AchievementCategory {
    id: string;
    name: string;
    icon: string;
    description: string;
    achievements: Achievement[];
}

export interface UserAchievementProgress {
    totalPoints: number;
    level: number;
    nextLevelPoints: number;
    unlockedAchievements: number;
    totalAchievements: number;
    categories: AchievementCategory[];
    recentUnlocks: Achievement[];
}

export class AchievementService {
    private static readonly ACHIEVEMENTS_KEY = 'labubu_achievements';
    private static readonly PROGRESS_KEY = 'labubu_achievement_progress';

    /**
     * Get all available achievements
     */
    static getAllAchievements(): Achievement[] {
        return [
            // Collection Size Achievements
            {
                id: 'first_collector',
                title: 'First Steps',
                description: 'Add your first Labubu to your collection',
                icon: '🎯',
                category: 'collection',
                rarity: 'common',
                points: 10,
                unlocked: false,
                progress: 0,
                target: 1,
                requirements: [
                    { type: 'owned_count', value: 1, description: 'Own 1 Labubu figure' }
                ],
                rewards: [
                    { type: 'title', value: 'Novice Collector', description: 'Unlock the "Novice Collector" title' },
                    { type: 'points', value: 10, description: 'Earn 10 achievement points' }
                ]
            },
            {
                id: 'collector_5',
                title: 'Getting Started',
                description: 'Build a collection of 5 Labubu figures',
                icon: '🌟',
                category: 'collection',
                rarity: 'common',
                points: 25,
                unlocked: false,
                progress: 0,
                target: 5,
                requirements: [
                    { type: 'owned_count', value: 5, description: 'Own 5 Labubu figures' }
                ],
                rewards: [
                    { type: 'title', value: 'Collector', description: 'Unlock the "Collector" title' },
                    { type: 'points', value: 25, description: 'Earn 25 achievement points' }
                ]
            },
            {
                id: 'collector_10',
                title: 'Serious Collector',
                description: 'Reach 10 figures in your collection',
                icon: '💎',
                category: 'collection',
                rarity: 'uncommon',
                points: 50,
                unlocked: false,
                progress: 0,
                target: 10,
                requirements: [
                    { type: 'owned_count', value: 10, description: 'Own 10 Labubu figures' }
                ],
                rewards: [
                    { type: 'title', value: 'Serious Collector', description: 'Unlock the "Serious Collector" title' },
                    { type: 'points', value: 50, description: 'Earn 50 achievement points' }
                ]
            },
            {
                id: 'collector_25',
                title: 'Dedicated Collector',
                description: 'Amass a collection of 25 Labubu figures',
                icon: '👑',
                category: 'collection',
                rarity: 'rare',
                points: 100,
                unlocked: false,
                progress: 0,
                target: 25,
                requirements: [
                    { type: 'owned_count', value: 25, description: 'Own 25 Labubu figures' }
                ],
                rewards: [
                    { type: 'title', value: 'Dedicated Collector', description: 'Unlock the "Dedicated Collector" title' },
                    { type: 'points', value: 100, description: 'Earn 100 achievement points' }
                ]
            },
            {
                id: 'collector_50',
                title: 'Master Collector',
                description: 'Achieve the ultimate collection of 50+ Labubu figures',
                icon: '🏆',
                category: 'collection',
                rarity: 'epic',
                points: 250,
                unlocked: false,
                progress: 0,
                target: 50,
                requirements: [
                    { type: 'owned_count', value: 50, description: 'Own 50 Labubu figures' }
                ],
                rewards: [
                    { type: 'title', value: 'Master Collector', description: 'Unlock the "Master Collector" title' },
                    { type: 'points', value: 250, description: 'Earn 250 achievement points' }
                ]
            },

            // Value Achievements
            {
                id: 'value_100',
                title: 'Hundred Dollar Club',
                description: 'Your collection is worth $100+',
                icon: '💰',
                category: 'value',
                rarity: 'common',
                points: 20,
                unlocked: false,
                progress: 0,
                target: 100,
                requirements: [
                    { type: 'value_threshold', value: 100, description: 'Collection worth $100+' }
                ],
                rewards: [
                    { type: 'title', value: 'Value Collector', description: 'Unlock the "Value Collector" title' },
                    { type: 'points', value: 20, description: 'Earn 20 achievement points' }
                ]
            },
            {
                id: 'value_500',
                title: 'Half Grand',
                description: 'Your collection reaches $500 in value',
                icon: '💎',
                category: 'value',
                rarity: 'uncommon',
                points: 75,
                unlocked: false,
                progress: 0,
                target: 500,
                requirements: [
                    { type: 'value_threshold', value: 500, description: 'Collection worth $500+' }
                ],
                rewards: [
                    { type: 'title', value: 'Premium Collector', description: 'Unlock the "Premium Collector" title' },
                    { type: 'points', value: 75, description: 'Earn 75 achievement points' }
                ]
            },
            {
                id: 'value_1000',
                title: 'Grand Collector',
                description: 'Your collection is worth over $1,000',
                icon: '💸',
                category: 'value',
                rarity: 'rare',
                points: 150,
                unlocked: false,
                progress: 0,
                target: 1000,
                requirements: [
                    { type: 'value_threshold', value: 1000, description: 'Collection worth $1,000+' }
                ],
                rewards: [
                    { type: 'title', value: 'Grand Collector', description: 'Unlock the "Grand Collector" title' },
                    { type: 'points', value: 150, description: 'Earn 150 achievement points' }
                ]
            },

            // Series Achievements
            {
                id: 'series_master',
                title: 'Series Master',
                description: 'Complete your first Labubu series',
                icon: '📚',
                category: 'series',
                rarity: 'uncommon',
                points: 100,
                unlocked: false,
                progress: 0,
                target: 1,
                requirements: [
                    { type: 'series_complete', value: 1, description: 'Complete 1 full series' }
                ],
                rewards: [
                    { type: 'title', value: 'Series Master', description: 'Unlock the "Series Master" title' },
                    { type: 'points', value: 100, description: 'Earn 100 achievement points' }
                ]
            },
            {
                id: 'series_expert',
                title: 'Series Expert',
                description: 'Complete 3 different Labubu series',
                icon: '🎓',
                category: 'series',
                rarity: 'rare',
                points: 200,
                unlocked: false,
                progress: 0,
                target: 3,
                requirements: [
                    { type: 'series_complete', value: 3, description: 'Complete 3 full series' }
                ],
                rewards: [
                    { type: 'title', value: 'Series Expert', description: 'Unlock the "Series Expert" title' },
                    { type: 'points', value: 200, description: 'Earn 200 achievement points' }
                ]
            },

            // Rarity Achievements
            {
                id: 'rare_hunter',
                title: 'Rare Hunter',
                description: 'Own your first Rare Labubu figure',
                icon: '🔍',
                category: 'rarity',
                rarity: 'uncommon',
                points: 50,
                unlocked: false,
                progress: 0,
                target: 1,
                requirements: [
                    { type: 'rarity_count', value: 1, description: 'Own 1 Rare figure' }
                ],
                rewards: [
                    { type: 'title', value: 'Rare Hunter', description: 'Unlock the "Rare Hunter" title' },
                    { type: 'points', value: 50, description: 'Earn 50 achievement points' }
                ]
            },
            {
                id: 'ultra_rare_master',
                title: 'Ultra Rare Master',
                description: 'Own an Ultra Rare Labubu figure',
                icon: '✨',
                category: 'rarity',
                rarity: 'epic',
                points: 300,
                unlocked: false,
                progress: 0,
                target: 1,
                requirements: [
                    { type: 'rarity_count', value: 1, description: 'Own 1 Ultra Rare figure' }
                ],
                rewards: [
                    { type: 'title', value: 'Ultra Rare Master', description: 'Unlock the "Ultra Rare Master" title' },
                    { type: 'points', value: 300, description: 'Earn 300 achievement points' }
                ]
            },

            // Special Achievements
            {
                id: 'photo_enthusiast',
                title: 'Photo Enthusiast',
                description: 'Add photos to 5 of your Labubu figures',
                icon: '📸',
                category: 'special',
                rarity: 'uncommon',
                points: 75,
                unlocked: false,
                progress: 0,
                target: 5,
                requirements: [
                    { type: 'owned_count', value: 5, description: 'Add photos to 5 figures' }
                ],
                rewards: [
                    { type: 'title', value: 'Photo Enthusiast', description: 'Unlock the "Photo Enthusiast" title' },
                    { type: 'points', value: 75, description: 'Earn 75 achievement points' }
                ]
            },
            {
                id: 'wishlist_master',
                title: 'Wishlist Master',
                description: 'Add 20 figures to your wishlist',
                icon: '💭',
                category: 'special',
                rarity: 'common',
                points: 30,
                unlocked: false,
                progress: 0,
                target: 20,
                requirements: [
                    { type: 'owned_count', value: 20, description: 'Add 20 figures to wishlist' }
                ],
                rewards: [
                    { type: 'title', value: 'Wishlist Master', description: 'Unlock the "Wishlist Master" title' },
                    { type: 'points', value: 30, description: 'Earn 30 achievement points' }
                ]
            }
        ];
    }

    /**
     * Check and update achievements based on current collection
     */
    static async checkAchievements(
        collectionItems: CollectionItem[],
        analytics: CollectionAnalytics
    ): Promise<Achievement[]> {
        const allAchievements = this.getAllAchievements();
        const currentProgress = await this.getAchievementProgress();
        const updatedAchievements = [...allAchievements];

        // Update progress and check for unlocks
        for (let i = 0; i < updatedAchievements.length; i++) {
            const achievement = updatedAchievements[i];
            const wasUnlocked = achievement.unlocked;

            // Update progress based on achievement type
            achievement.progress = this.calculateProgress(achievement, collectionItems, analytics);
            achievement.unlocked = achievement.progress >= achievement.target;

            // If newly unlocked, set unlock time
            if (achievement.unlocked && !wasUnlocked) {
                achievement.unlockedAt = new Date().toISOString();
            }
        }

        // Save updated achievements
        await this.saveAchievementProgress(updatedAchievements);

        // Return newly unlocked achievements
        const allCurrentAchievements = currentProgress.categories?.flatMap(cat => cat.achievements) || [];
        return updatedAchievements.filter(a => a.unlocked && !allCurrentAchievements.find(ca => ca.id === a.id)?.unlocked);
    }

    /**
     * Calculate progress for a specific achievement
     */
    private static calculateProgress(
        achievement: Achievement,
        collectionItems: CollectionItem[],
        analytics: CollectionAnalytics
    ): number {
        const requirement = achievement.requirements[0]; // Most achievements have single requirements

        switch (requirement.type) {
            case 'owned_count':
                return analytics.ownedCount;
            case 'value_threshold':
                return Math.round(analytics.ownedValue.average);
            case 'series_complete':
                return analytics.seriesStats.filter(s => s.completionPercentage === 100).length;
            case 'rarity_count':
                // For rarity achievements, check if user owns any figures of that rarity
                const ownedFigures = collectionItems.filter(item => item.owned);
                // This would need to be enhanced to check actual rarity from figure data
                return ownedFigures.length > 0 ? 1 : 0;
            default:
                return 0;
        }
    }

    /**
     * Get current achievement progress
     */
    static async getAchievementProgress(): Promise<UserAchievementProgress> {
        try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            const saved = await AsyncStorage.getItem(this.PROGRESS_KEY);

            if (saved) {
                return JSON.parse(saved);
            }

            // Return default progress
            return this.getDefaultProgress();
        } catch (error) {
            console.error('Error loading achievement progress:', error);
            return this.getDefaultProgress();
        }
    }

    /**
     * Save achievement progress
     */
    static async saveAchievementProgress(achievements: Achievement[]): Promise<void> {
        try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;

            const progress: UserAchievementProgress = {
                totalPoints: achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0),
                level: this.calculateLevel(achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0)),
                nextLevelPoints: this.getNextLevelPoints(achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0)),
                unlockedAchievements: achievements.filter(a => a.unlocked).length,
                totalAchievements: achievements.length,
                categories: this.groupAchievementsByCategory(achievements),
                recentUnlocks: achievements.filter(a => a.unlocked && a.unlockedAt).sort((a, b) =>
                    new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime()
                ).slice(0, 5)
            };

            await AsyncStorage.setItem(this.PROGRESS_KEY, JSON.stringify(progress));
        } catch (error) {
            console.error('Error saving achievement progress:', error);
        }
    }

    /**
     * Get default progress for new users
     */
    private static getDefaultProgress(): UserAchievementProgress {
        const achievements = this.getAllAchievements();
        return {
            totalPoints: 0,
            level: 1,
            nextLevelPoints: 100,
            unlockedAchievements: 0,
            totalAchievements: achievements.length,
            categories: this.groupAchievementsByCategory(achievements),
            recentUnlocks: []
        };
    }

    /**
     * Group achievements by category
     */
    private static groupAchievementsByCategory(achievements: Achievement[]): AchievementCategory[] {
        const categories: { [key: string]: AchievementCategory } = {};

        achievements.forEach(achievement => {
            if (!categories[achievement.category]) {
                categories[achievement.category] = {
                    id: achievement.category,
                    name: this.getCategoryName(achievement.category),
                    icon: this.getCategoryIcon(achievement.category),
                    description: this.getCategoryDescription(achievement.category),
                    achievements: []
                };
            }
            categories[achievement.category].achievements.push(achievement);
        });

        return Object.values(categories);
    }

    /**
     * Get category display name
     */
    private static getCategoryName(category: string): string {
        const names: { [key: string]: string } = {
            'collection': 'Collection',
            'value': 'Value',
            'series': 'Series',
            'rarity': 'Rarity',
            'social': 'Social',
            'special': 'Special'
        };
        return names[category] || category;
    }

    /**
     * Get category icon
     */
    private static getCategoryIcon(category: string): string {
        const icons: { [key: string]: string } = {
            'collection': '📦',
            'value': '💰',
            'series': '📚',
            'rarity': '✨',
            'social': '👥',
            'special': '🎯'
        };
        return icons[category] || '🏆';
    }

    /**
     * Get category description
     */
    private static getCategoryDescription(category: string): string {
        const descriptions: { [key: string]: string } = {
            'collection': 'Build your collection',
            'value': 'Increase collection value',
            'series': 'Complete series',
            'rarity': 'Find rare figures',
            'social': 'Share with community',
            'special': 'Special achievements'
        };
        return descriptions[category] || 'Achievement category';
    }

    /**
     * Calculate user level based on points
     */
    private static calculateLevel(points: number): number {
        return Math.floor(points / 100) + 1;
    }

    /**
     * Get points needed for next level
     */
    private static getNextLevelPoints(currentPoints: number): number {
        const currentLevel = this.calculateLevel(currentPoints);
        return currentLevel * 100;
    }

    /**
     * Get rarity color for achievements
     */
    static getRarityColor(rarity: string): string {
        const colors: { [key: string]: string } = {
            'common': '#95A5A6',
            'uncommon': '#2ECC71',
            'rare': '#3498DB',
            'epic': '#9B59B6',
            'legendary': '#F39C12'
        };
        return colors[rarity] || '#95A5A6';
    }
}
