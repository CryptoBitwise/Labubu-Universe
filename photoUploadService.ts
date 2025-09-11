import { storage } from './firebaseConfig';
// import { Platform } from 'react-native'; // Unused for now

export interface PhotoUploadResult {
    success: boolean;
    downloadUrl?: string;
    error?: string;
}

export class PhotoUploadService {
    /**
     * Upload a photo to Firebase Storage
     * @param photoUri - Local file URI of the photo
     * @param figureId - ID of the figure this photo belongs to
     * @param userId - User ID (for organizing photos by user)
     */
    static async uploadPhoto(
        photoUri: string,
        figureId: string,
        userId: string
    ): Promise<PhotoUploadResult> {
        try {
            // Create a unique filename
            const timestamp = Date.now();
            const filename = `photos/${userId}/${figureId}_${timestamp}.jpg`;

            // Create reference to the file in Firebase Storage
            const reference = storage().ref(filename);

            // Upload the file
            const uploadTask = reference.putFile(photoUri);

            // Wait for upload to complete
            await uploadTask;

            // Get the download URL
            const downloadUrl = await reference.getDownloadURL();

            return {
                success: true,
                downloadUrl
            };
        } catch (error) {
            console.error('Error uploading photo:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Delete a photo from Firebase Storage
     * @param downloadUrl - The download URL of the photo to delete
     */
    static async deletePhoto(downloadUrl: string): Promise<boolean> {
        try {
            // Extract the file path from the download URL
            // Firebase Storage URLs have format: https://firebasestorage.googleapis.com/v0/b/bucket/o/path%2Fto%2Ffile?alt=media
            const urlParts = downloadUrl.split('/o/');
            if (urlParts.length < 2) {
                throw new Error('Invalid Firebase Storage URL');
            }

            const pathWithQuery = urlParts[1];
            const path = decodeURIComponent(pathWithQuery.split('?')[0]);

            if (!path) {
                throw new Error('Invalid download URL');
            }

            // Create reference and delete
            const reference = storage().ref(path);
            await reference.delete();

            return true;
        } catch (error) {
            console.error('Error deleting photo:', error);
            return false;
        }
    }

    /**
     * Check if a URL is a Firebase Storage URL
     * @param url - URL to check
     */
    static isFirebaseStorageUrl(url: string): boolean {
        return url.includes('firebasestorage.googleapis.com');
    }
}
