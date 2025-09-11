import { CollectionItem } from './collectionService';
import { CollectionAnalytics } from './collectionAnalyticsService';
import { Achievement } from './achievementService';

export interface SharingOptions {
    includePhotos: boolean;
    includeAnalytics: boolean;
    includeAchievements: boolean;
    includeWishlist: boolean;
    watermark: boolean;
    format: 'image' | 'text' | 'json';
}

export interface ShareableContent {
    title: string;
    description: string;
    collectionStats: {
        totalFigures: number;
        ownedCount: number;
        wishlistCount: number;
        completionPercentage: number;
        totalValue: number;
    };
    recentAdditions: CollectionItem[];
    achievements: Achievement[];
    photos: string[];
}

export class CollectionSharingService {
    /**
     * Generate shareable content from collection data
     */
    static generateShareableContent(
        collectionItems: CollectionItem[],
        analytics: CollectionAnalytics,
        achievements: Achievement[] = []
    ): ShareableContent {
        const ownedItems = collectionItems.filter(item => item.owned);
        const wishlistItems = collectionItems.filter(item => item.wishlist);
        const recentAdditions = ownedItems
            .filter(item => item.addedAt)
            .sort((a, b) => new Date(b.addedAt!).getTime() - new Date(a.addedAt!).getTime())
            .slice(0, 5);

        const unlockedAchievements = achievements.filter(a => a.unlocked);

        return {
            title: "My Labubu Collection",
            description: `Check out my amazing Labubu collection! I have ${ownedItems.length} figures and ${wishlistItems.length} on my wishlist.`,
            collectionStats: {
                totalFigures: analytics.totalFigures,
                ownedCount: analytics.ownedCount,
                wishlistCount: analytics.wishlistCount,
                completionPercentage: analytics.completionPercentage,
                totalValue: Math.round(analytics.ownedValue.average)
            },
            recentAdditions: recentAdditions,
            achievements: unlockedAchievements,
            photos: ownedItems.filter(item => item.userPhoto).map(item => item.userPhoto!)
        };
    }

    /**
     * Generate text summary for sharing
     */
    static generateTextSummary(content: ShareableContent): string {
        const { collectionStats, achievements } = content;

        let text = `🏆 My Labubu Collection 🏆\n\n`;
        text += `📦 Collection Stats:\n`;
        text += `• Owned: ${collectionStats.ownedCount} figures\n`;
        text += `• Wishlist: ${collectionStats.wishlistCount} figures\n`;
        text += `• Completion: ${collectionStats.completionPercentage}%\n`;
        text += `• Total Value: $${collectionStats.totalValue}\n\n`;

        if (achievements.length > 0) {
            text += `🏆 Recent Achievements:\n`;
            achievements.slice(0, 3).forEach(achievement => {
                text += `• ${achievement.icon} ${achievement.title}\n`;
            });
            text += `\n`;
        }

        text += `#Labubu #Collection #PopMart #Collectibles`;

        return text;
    }

    /**
     * Generate JSON export data
     */
    static generateJsonExport(
        collectionItems: CollectionItem[],
        analytics: CollectionAnalytics,
        achievements: Achievement[]
    ): string {
        const exportData = {
            exportDate: new Date().toISOString(),
            version: "1.0",
            collection: {
                items: collectionItems,
                analytics: analytics,
                achievements: achievements.filter(a => a.unlocked)
            },
            metadata: {
                totalItems: collectionItems.length,
                ownedCount: analytics.ownedCount,
                wishlistCount: analytics.wishlistCount,
                completionPercentage: analytics.completionPercentage
            }
        };

        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Share to social media platforms
     */
    static async shareToSocial(
        content: ShareableContent,
        _platform: 'instagram' | 'twitter' | 'facebook' | 'general'
    ): Promise<void> {
        const text = this.generateTextSummary(content);

        // This would integrate with React Native's Share API
        // For now, we'll use a placeholder implementation
        try {
            const { Share } = require('react-native');
            await Share.share({
                message: text,
                title: content.title
            });
        } catch (error) {
            console.error('Error sharing to social media:', error);
            throw new Error('Failed to share to social media');
        }
    }

    /**
     * Export collection data
     */
    static async exportCollection(
        collectionItems: CollectionItem[],
        analytics: CollectionAnalytics,
        achievements: Achievement[],
        format: 'json' | 'csv' | 'txt'
    ): Promise<string> {
        switch (format) {
            case 'json':
                return this.generateJsonExport(collectionItems, analytics, achievements);
            case 'csv':
                return this.generateCsvExport(collectionItems);
            case 'txt':
                return this.generateTextSummary(
                    this.generateShareableContent(collectionItems, analytics, achievements)
                );
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    /**
     * Generate CSV export
     */
    private static generateCsvExport(collectionItems: CollectionItem[]): string {
        const headers = ['Figure ID', 'Name', 'Series', 'Rarity', 'Owned', 'Wishlist', 'Added Date', 'User Photo'];
        const rows = collectionItems.map(item => [
            item.figureId,
            `"${item.name || 'Unknown'}"`,
            `"${item.series || 'Unknown'}"`,
            `"${item.rarity || 'Unknown'}"`,
            item.owned ? 'Yes' : 'No',
            item.wishlist ? 'Yes' : 'No',
            item.addedAt || '',
            item.userPhoto ? 'Yes' : 'No'
        ]);

        return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    }

    /**
     * Get sharing suggestions based on collection
     */
    static getSharingSuggestions(content: ShareableContent): string[] {
        const suggestions: string[] = [];
        const { collectionStats, achievements } = content;

        if (collectionStats.ownedCount >= 10) {
            suggestions.push("Share your impressive collection size!");
        }

        if (collectionStats.completionPercentage >= 50) {
            suggestions.push("Show off your collection completion progress!");
        }

        if (achievements.length >= 3) {
            suggestions.push("Celebrate your recent achievements!");
        }

        if (collectionStats.totalValue >= 500) {
            suggestions.push("Share your valuable collection!");
        }

        if (content.photos.length >= 5) {
            suggestions.push("Showcase your collection photos!");
        }

        return suggestions.length > 0 ? suggestions : ["Share your Labubu collection journey!"];
    }
}
