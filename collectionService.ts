import { firestore } from './firebaseConfig';
import auth from '@react-native-firebase/auth';

export interface CollectionItem {
    figureId: string;
    owned: boolean;
    wishlist: boolean;
    userPhoto?: string;
    userPhotos?: string[];
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
    private static readonly MAX_RETRIES = 3;
    private static readonly RETRY_DELAY = 1000; // 1 second

    /**
     * Clean collection items by removing undefined values (Firebase doesn't support undefined)
     */
    private static cleanCollectionItems(items: CollectionItem[]): CollectionItem[] {
        return items.map(item => {
            const cleanedItem: any = { ...item };

            // Remove undefined values
            Object.keys(cleanedItem).forEach(key => {
                if (cleanedItem[key] === undefined) {
                    delete cleanedItem[key];
                }
            });

            return cleanedItem as CollectionItem;
        });
    }

    /**
     * Wait for authentication to be ready (iOS bridge timing fix)
     */
    private static async waitForAuth(): Promise<boolean> {
        return new Promise((resolve) => {
            const user = auth().currentUser;
            if (user) {
                resolve(true);
                return;
            }

            // Wait for auth state change
            const unsubscribe = auth().onAuthStateChanged((user) => {
                unsubscribe();
                resolve(!!user);
            });

            // Timeout after 3 seconds
            setTimeout(() => {
                unsubscribe();
                resolve(false);
            }, 3000);
        });
    }

    /**
     * Retry Firestore operation with exponential backoff
     */
    private static async retryOperation<T>(
        operation: () => Promise<T>,
        operationName: string,
        retries: number = this.MAX_RETRIES
    ): Promise<T> {
        try {
            return await operation();
        } catch (error: any) {
            // Check if it's a permission error and auth might not be ready
            if (error.code === 'firestore/permission-denied' && retries > 0) {
                console.log(`⚠️ ${operationName} failed with permission denied, waiting for auth...`);

                // Wait for auth to be ready
                const authReady = await this.waitForAuth();
                if (authReady) {
                    console.log(`🔄 Retrying ${operationName} after auth ready...`);
                    await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
                    return this.retryOperation(operation, operationName, retries - 1);
                }
            }

            throw error;
        }
    }

    /**
     * Save user's collection to Firestore
     * @param items - Array of collection items
     */
    static async saveCollection(items: CollectionItem[]): Promise<boolean> {
        try {
            const userId = await this.getUserId();

            // Clean items to remove undefined values
            const cleanedItems = this.cleanCollectionItems(items);

            const userCollection: UserCollection = {
                userId,
                items: cleanedItems,
                lastUpdated: new Date().toISOString()
            };

            // Use retry logic for Firestore operations
            await this.retryOperation(
                () => firestore()
                    .collection(this.COLLECTION_NAME)
                    .doc(userId)
                    .set(userCollection),
                'saveCollection'
            );

            return true;
        } catch (error) {
            console.error('❌ Error saving collection:', error);
            return false;
        }
    }

    /**
     * Load user's collection from Firestore
     */
    static async loadCollection(): Promise<CollectionItem[]> {
        try {
            const userId = await this.getUserId();

            // Use retry logic for Firestore operations
            const doc = await this.retryOperation(
                () => firestore()
                    .collection(this.COLLECTION_NAME)
                    .doc(userId)
                    .get(),
                'loadCollection'
            );

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
            console.error('❌ Error loading collection:', error);
            return [];
        }
    }

    /**
     * Add a single item to the collection
     * @param userId - Unique user identifier
     * @param item - Collection item to add
     */
    static async addItem(item: CollectionItem): Promise<boolean> {
        try {
            const currentItems = await this.loadCollection();
            const existingIndex = currentItems.findIndex(i => i.figureId === item.figureId);

            if (existingIndex >= 0) {
                // Update existing item
                currentItems[existingIndex] = item;
            } else {
                // Add new item
                currentItems.push(item);
            }

            return await this.saveCollection(currentItems);
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
    static async removeItem(figureId: string): Promise<boolean> {
        try {
            const currentItems = await this.loadCollection();
            const filteredItems = currentItems.filter(item => item.figureId !== figureId);

            return await this.saveCollection(filteredItems);
        } catch (error) {
            console.error('❌ Error removing item from collection:', error);
            return false;
        }
    }

    /**
     * Get a unique user ID based on device
     * Each device gets its own collection
     */
    static async getUserId(): Promise<string> {
        try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            let userId = await AsyncStorage.getItem('labubu_user_id');

            // Check if this is the old shared user ID and force a new one
            if (userId === 'demo-user-123' || !userId) {
                // Clear any old shared data
                await AsyncStorage.removeItem('labubuCollection');
                await AsyncStorage.removeItem('labubu_user_id');

                // Generate a unique ID for this device
                userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                await AsyncStorage.setItem('labubu_user_id', userId);

                console.log('Generated new unique user ID:', userId);
            }

            return userId;
        } catch (error) {
            console.error('Error getting user ID:', error);
            // Fallback to timestamp-based ID
            return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
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

            // Check app version to clear old shared data
            const currentVersion = '2.0.0'; // New version with unique user IDs
            const storedVersion = await AsyncStorage.getItem('labubu_app_version');

            if (storedVersion !== currentVersion) {
                // Clear old shared data and update version
                await AsyncStorage.removeItem('labubuCollection');
                await AsyncStorage.setItem('labubu_app_version', currentVersion);
                console.log('Cleared old shared data for new version');
                return [];
            }

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
