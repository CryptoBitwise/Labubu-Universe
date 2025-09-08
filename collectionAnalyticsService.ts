import { CollectionItem } from './collectionService';
import { labubuFigures } from './LabubuFiguresData';

export interface CollectionAnalytics {
    // Basic Stats
    totalFigures: number;
    ownedCount: number;
    wishlistCount: number;
    completionPercentage: number;

    // Value Analytics
    totalValue: {
        min: number;
        max: number;
        average: number;
    };
    ownedValue: {
        min: number;
        max: number;
        average: number;
    };
    wishlistValue: {
        min: number;
        max: number;
        average: number;
    };

    // Series Analytics
    seriesStats: SeriesStats[];

    // Rarity Analytics
    rarityStats: RarityStats[];

    // Recent Activity
    recentAdditions: CollectionItem[];

    // Goals & Milestones
    milestones: Milestone[];
}

export interface SeriesStats {
    seriesName: string;
    totalInSeries: number;
    ownedInSeries: number;
    wishlistInSeries: number;
    completionPercentage: number;
    seriesValue: {
        min: number;
        max: number;
    };
}

export interface RarityStats {
    rarity: string;
    totalCount: number;
    ownedCount: number;
    wishlistCount: number;
    completionPercentage: number;
    averageValue: number;
}

export interface Milestone {
    id: string;
    title: string;
    description: string;
    target: number;
    current: number;
    completed: boolean;
    type: 'owned' | 'value' | 'series' | 'rarity';
    reward?: string;
}

export class CollectionAnalyticsService {

    /**
     * Generate comprehensive analytics for a user's collection
     */
    static generateAnalytics(collectionItems: CollectionItem[]): CollectionAnalytics {
        // Ensure collectionItems is always an array
        const items = collectionItems || [];
        const ownedItems = items.filter(item => item.owned);
        const wishlistItems = items.filter(item => item.wishlist);

        // Get figure data for owned and wishlist items
        const ownedFigures = ownedItems.map(item =>
            labubuFigures.find(fig => fig.id.toString() === item.figureId)
        ).filter(Boolean);

        const wishlistFigures = wishlistItems.map(item =>
            labubuFigures.find(fig => fig.id.toString() === item.figureId)
        ).filter(Boolean);

        // Basic stats
        const totalFigures = labubuFigures.length;
        const ownedCount = ownedItems.length;
        const wishlistCount = wishlistItems.length;
        const completionPercentage = Math.round((ownedCount / totalFigures) * 100);

        // Value calculations
        const totalValue = this.calculateValueRange(labubuFigures);
        const ownedValue = this.calculateValueRange(ownedFigures);
        const wishlistValue = this.calculateValueRange(wishlistFigures);

        // Series analytics
        const seriesStats = this.calculateSeriesStats(items);

        // Rarity analytics
        const rarityStats = this.calculateRarityStats(items);

        // Recent additions (last 30 days)
        const recentAdditions = this.getRecentAdditions(items);

        // Milestones
        const milestones = this.generateMilestones(ownedCount, ownedValue, seriesStats, rarityStats);

        return {
            totalFigures,
            ownedCount,
            wishlistCount,
            completionPercentage,
            totalValue,
            ownedValue,
            wishlistValue,
            seriesStats: seriesStats || [],
            rarityStats: rarityStats || [],
            recentAdditions: recentAdditions || [],
            milestones: milestones || []
        };
    }

    /**
     * Calculate value range for a set of figures
     */
    private static calculateValueRange(figures: any[]): { min: number; max: number; average: number } {
        if (figures.length === 0) {
            return { min: 0, max: 0, average: 0 };
        }

        const minValue = figures.reduce((sum, fig) => sum + fig.estimatedValue.min, 0);
        const maxValue = figures.reduce((sum, fig) => sum + fig.estimatedValue.max, 0);
        const averageValue = (minValue + maxValue) / 2;

        return {
            min: Math.round(minValue),
            max: Math.round(maxValue),
            average: Math.round(averageValue)
        };
    }

    /**
     * Calculate statistics for each series
     */
    private static calculateSeriesStats(items: CollectionItem[]): SeriesStats[] {
        const seriesMap = new Map<string, {
            total: any[];
            owned: any[];
            wishlist: any[];
        }>();

        // Group figures by series
        labubuFigures.forEach(figure => {
            if (!seriesMap.has(figure.series)) {
                seriesMap.set(figure.series, {
                    total: [],
                    owned: [],
                    wishlist: []
                });
            }
            seriesMap.get(figure.series)!.total.push(figure);
        });

        // Group collection items by series
        items.forEach(item => {
            const figure = labubuFigures.find(fig => fig.id.toString() === item.figureId);
            if (figure) {
                const seriesData = seriesMap.get(figure.series);
                if (seriesData) {
                    if (item.owned) {
                        seriesData.owned.push(figure);
                    }
                    if (item.wishlist) {
                        seriesData.wishlist.push(figure);
                    }
                }
            }
        });

        // Calculate stats for each series
        return Array.from(seriesMap.entries()).map(([seriesName, data]) => {
            const completionPercentage = Math.round((data.owned.length / data.total.length) * 100);
            const seriesValue = this.calculateValueRange(data.owned);

            return {
                seriesName,
                totalInSeries: data.total.length,
                ownedInSeries: data.owned.length,
                wishlistInSeries: data.wishlist.length,
                completionPercentage,
                seriesValue: {
                    min: seriesValue.min,
                    max: seriesValue.max
                }
            };
        }).sort((a, b) => b.completionPercentage - a.completionPercentage);
    }

    /**
     * Calculate statistics for each rarity level
     */
    private static calculateRarityStats(items: CollectionItem[]): RarityStats[] {
        const rarityMap = new Map<string, {
            total: any[];
            owned: any[];
            wishlist: any[];
        }>();

        // Group figures by rarity
        labubuFigures.forEach(figure => {
            if (!rarityMap.has(figure.rarity)) {
                rarityMap.set(figure.rarity, {
                    total: [],
                    owned: [],
                    wishlist: []
                });
            }
            rarityMap.get(figure.rarity)!.total.push(figure);
        });

        // Group collection items by rarity
        items.forEach(item => {
            const figure = labubuFigures.find(fig => fig.id.toString() === item.figureId);
            if (figure) {
                const rarityData = rarityMap.get(figure.rarity);
                if (rarityData) {
                    if (item.owned) {
                        rarityData.owned.push(figure);
                    }
                    if (item.wishlist) {
                        rarityData.wishlist.push(figure);
                    }
                }
            }
        });

        // Calculate stats for each rarity
        return Array.from(rarityMap.entries()).map(([rarity, data]) => {
            const completionPercentage = Math.round((data.owned.length / data.total.length) * 100);
            const averageValue = data.owned.length > 0
                ? this.calculateValueRange(data.owned).average
                : 0;

            return {
                rarity,
                totalCount: data.total.length,
                ownedCount: data.owned.length,
                wishlistCount: data.wishlist.length,
                completionPercentage,
                averageValue
            };
        }).sort((a, b) => {
            // Sort by rarity importance (Ultra Rare first, then by completion)
            const rarityOrder = ['Ultra Rare', 'Very Rare', 'Rare', 'Uncommon', 'Common'];
            const aIndex = rarityOrder.indexOf(a.rarity);
            const bIndex = rarityOrder.indexOf(b.rarity);
            if (aIndex !== bIndex) return aIndex - bIndex;
            return b.completionPercentage - a.completionPercentage;
        });
    }

    /**
     * Get recent additions to collection (last 30 days)
     */
    private static getRecentAdditions(items: CollectionItem[]): CollectionItem[] {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return items
            .filter(item => {
                if (!item.dateAdded) return false;
                const addedDate = new Date(item.dateAdded);
                return addedDate >= thirtyDaysAgo;
            })
            .sort((a, b) => {
                if (!a.dateAdded || !b.dateAdded) return 0;
                return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
            })
            .slice(0, 10); // Top 10 recent additions
    }

    /**
     * Generate collection milestones
     */
    private static generateMilestones(
        ownedCount: number,
        ownedValue: { min: number; max: number; average: number },
        seriesStats: SeriesStats[],
        rarityStats: RarityStats[]
    ): Milestone[] {
        const milestones: Milestone[] = [];

        // Collection size milestones
        const sizeMilestones = [5, 10, 25, 50, 75, 100];
        sizeMilestones.forEach(target => {
            milestones.push({
                id: `owned_${target}`,
                title: `Collector Level ${target}`,
                description: `Own ${target} Labubu figures`,
                target,
                current: ownedCount,
                completed: ownedCount >= target,
                type: 'owned',
                reward: target >= 50 ? '🏆 Master Collector' : target >= 25 ? '🥇 Expert Collector' : '🥉 Collector'
            });
        });

        // Value milestones
        const valueMilestones = [100, 500, 1000, 2500, 5000];
        valueMilestones.forEach(target => {
            milestones.push({
                id: `value_${target}`,
                title: `$${target} Collection`,
                description: `Collection worth $${target}+`,
                target,
                current: Math.round(ownedValue.average),
                completed: ownedValue.average >= target,
                type: 'value',
                reward: target >= 2500 ? '💰 High Roller' : target >= 1000 ? '💎 Premium Collector' : '💵 Value Collector'
            });
        });

        // Series completion milestones
        seriesStats.forEach(series => {
            if (series.completionPercentage === 100) {
                milestones.push({
                    id: `series_${series.seriesName.replace(/\s+/g, '_')}`,
                    title: `Series Master: ${series.seriesName}`,
                    description: `Complete ${series.seriesName} series`,
                    target: series.totalInSeries,
                    current: series.ownedInSeries,
                    completed: true,
                    type: 'series',
                    reward: '🎯 Series Master'
                });
            }
        });

        // Rarity milestones
        rarityStats.forEach(rarity => {
            if (rarity.rarity === 'Ultra Rare' && rarity.ownedCount > 0) {
                milestones.push({
                    id: `rarity_${rarity.rarity.replace(/\s+/g, '_')}`,
                    title: `${rarity.rarity} Hunter`,
                    description: `Own ${rarity.ownedCount} ${rarity.rarity} figure${rarity.ownedCount > 1 ? 's' : ''}`,
                    target: rarity.ownedCount,
                    current: rarity.ownedCount,
                    completed: true,
                    type: 'rarity',
                    reward: '✨ Rare Hunter'
                });
            }
        });

        return milestones.sort((a, b) => {
            // Show completed milestones first, then by progress
            if (a.completed !== b.completed) {
                return a.completed ? -1 : 1;
            }
            return b.current - a.current;
        });
    }

    /**
     * Get collection insights and recommendations
     */
    static getCollectionInsights(analytics: CollectionAnalytics): string[] {
        if (!analytics) return [];
        const insights: string[] = [];

        // Completion insights
        if (analytics.completionPercentage >= 50) {
            insights.push(`🎉 Amazing! You've collected ${analytics.completionPercentage}% of all Labubu figures!`);
        } else if (analytics.completionPercentage >= 25) {
            insights.push(`📈 Great progress! You're ${analytics.completionPercentage}% of the way to a complete collection!`);
        } else {
            insights.push(`🚀 Just getting started! You have ${analytics.ownedCount} figures and many more to discover!`);
        }

        // Value insights
        if (analytics.ownedValue.average >= 1000) {
            insights.push(`💰 Your collection is worth $${analytics.ownedValue.average.toLocaleString()} - that's impressive!`);
        } else if (analytics.ownedValue.average >= 500) {
            insights.push(`💎 Your collection has significant value at $${analytics.ownedValue.average.toLocaleString()}!`);
        }

        // Series insights
        const topSeries = analytics.seriesStats[0];
        if (topSeries && topSeries.completionPercentage >= 75) {
            insights.push(`🎯 You're almost done with ${topSeries.seriesName} - just ${topSeries.totalInSeries - topSeries.ownedInSeries} more!`);
        }

        // Rarity insights
        const ultraRare = analytics.rarityStats.find(r => r.rarity === 'Ultra Rare');
        if (ultraRare && ultraRare.ownedCount > 0) {
            insights.push(`✨ You own ${ultraRare.ownedCount} Ultra Rare figure${ultraRare.ownedCount > 1 ? 's' : ''} - that's incredible!`);
        }

        // Recent activity insights
        if (analytics.recentAdditions.length > 0) {
            insights.push(`📅 You've added ${analytics.recentAdditions.length} figure${analytics.recentAdditions.length > 1 ? 's' : ''} in the last 30 days!`);
        }

        return insights;
    }
}
