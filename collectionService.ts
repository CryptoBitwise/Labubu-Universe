import { firestore } from './firebaseConfig';

export interface CollectionItem {
    figureId: string;
    owned: boolean;
    wishlist: boolean;
    userPhoto?: string;
    dateAdded?: string;
    notes?: string;
}

export interface UserCollection {
    userId: string;
    items: CollectionItem[];
    lastUpdated: string;
}

export class CollectionService {
    private static readonly COLLECTION_NAME = 'userCollections';

    /**
     * Save user's collection to Firestore
     * @param userId - Unique user identifier
     * @param items - Array of collection items
     */
    static async saveCollection(userId: string, items: CollectionItem[]): Promise<boolean> {
        try {
            const userCollection: UserCollection = {
                userId,
                items,
                lastUpdated: new Date().toISOString()
            };

            await firestore()
                .collection(this.COLLECTION_NAME)
                .doc(userId)
                .set(userCollection);

            return true;
        } catch (error) {
            console.error('Error saving collection:', error);
            return false;
        }
    }

    /**
     * Load user's collection from Firestore
     * @param userId - Unique user identifier
     */
    static async loadCollection(userId: string): Promise<CollectionItem[]> {
        try {
            const doc = await firestore()
                .collection(this.COLLECTION_NAME)
                .doc(userId)
                .get();

            if (doc.exists()) {
                const data = doc.data();
                if (data && data.items) {
                    return data.items;
                } else {
                    return [];
                }
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error loading collection:', error);
            return [];
        }
    }

    /**
     * Add a single item to the collection
     * @param userId - Unique user identifier
     * @param item - Collection item to add
     */
    static async addItem(userId: string, item: CollectionItem): Promise<boolean> {
        try {
            const currentItems = await this.loadCollection(userId);
            const existingIndex = currentItems.findIndex(i => i.figureId === item.figureId);

            if (existingIndex >= 0) {
                // Update existing item
                currentItems[existingIndex] = item;
            } else {
                // Add new item
                currentItems.push(item);
            }

            return await this.saveCollection(userId, currentItems);
        } catch (error) {
            console.error('❌ Error adding item to collection:', error);
            return false;
        }
    }

    /**
     * Remove an item from the collection
     * @param userId - Unique user identifier
     * @param figureId - ID of the figure to remove
     */
    static async removeItem(userId: string, figureId: string): Promise<boolean> {
        try {
            const currentItems = await this.loadCollection(userId);
            const filteredItems = currentItems.filter(item => item.figureId !== figureId);

            return await this.saveCollection(userId, filteredItems);
        } catch (error) {
            console.error('❌ Error removing item from collection:', error);
            return false;
        }
    }

    /**
     * Get a simple user ID (for demo purposes)
     * In a real app, this would come from authentication
     */
    static getUserId(): string {
        // For now, use a simple demo user ID
        // In production, this would come from Firebase Auth
        return 'demo-user-123';
    }

    /**
     * Sync collection with local AsyncStorage as backup
     * @param items - Collection items to sync
     */
    static async syncWithLocalStorage(items: CollectionItem[]): Promise<void> {
        try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            await AsyncStorage.setItem('labubuCollection', JSON.stringify(items));
        } catch (error) {
            console.error('Error syncing to local storage:', error);
        }
    }

    /**
     * Load collection from local storage as fallback
     */
    static async loadFromLocalStorage(): Promise<CollectionItem[]> {
        try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            const savedCollection = await AsyncStorage.getItem('labubuCollection');
            if (savedCollection) {
                const items = JSON.parse(savedCollection);
                return items;
            }
            return [];
        } catch (error) {
            console.error('Error loading from local storage:', error);
            return [];
        }
    }
}
