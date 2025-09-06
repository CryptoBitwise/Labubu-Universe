import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Alert,
    ActivityIndicator,
    Dimensions,
    PermissionsAndroid,
    Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, spacing, fontSizes, shadows, gradients } from './designSystem';

import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType, PhotoQuality } from 'react-native-image-picker';
import { PhotoUploadService } from './photoUploadService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PhotoPickerProps {
    visible: boolean;
    figureId: string;
    userId: string;
    onPhotoSelected: (photoUri: string) => void;
    onClose: () => void;
}

const PhotoPicker: React.FC<PhotoPickerProps> = ({
    visible,
    figureId,
    userId,
    onPhotoSelected,
    onClose,
}) => {
    const [loading, setLoading] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Debug logging
    console.log('PhotoPicker render - visible:', visible);

    // Cleanup function to reset loading state and clear timeouts
    const resetLoadingState = () => {
        setLoading(false);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    // Reset loading state when modal becomes invisible
    useEffect(() => {
        if (!visible) {
            resetLoadingState();
        }
    }, [visible]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Request camera permission
    const requestCameraPermission = async (): Promise<boolean> => {
        if (Platform.OS === 'android') {
            try {
                console.log('Requesting camera permission...');
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: 'Camera Permission',
                        message: 'This app needs access to camera to take photos of your Labubu collection.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );
                console.log('Camera permission result:', granted);
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn('Camera permission error:', err);
                return false;
            }
        }
        return true; // iOS handles this automatically
    };

    // Request storage permission for gallery
    const requestStoragePermission = async (): Promise<boolean> => {
        if (Platform.OS === 'android') {
            try {
                console.log('Requesting storage permission...');

                // For Android 13+ (API 33+), we need READ_MEDIA_IMAGES instead
                const permission = Platform.Version >= 33
                    ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
                    : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

                console.log('Using permission:', permission);

                const granted = await PermissionsAndroid.request(
                    permission,
                    {
                        title: 'Storage Permission',
                        message: 'This app needs access to your photo library to select photos of your Labubu collection.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );
                console.log('Storage permission result:', granted);
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn('Storage permission error:', err);
                return false;
            }
        }
        return true; // iOS handles this automatically
    };

    const handleTakePhoto = async () => {
        setLoading(true);

        // Check camera permission first
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
            setLoading(false);
            Alert.alert(
                'Permission Denied',
                'Camera permission is required to take photos. Please enable it in your device settings.',
                [{ text: 'OK' }]
            );
            return;
        }

        const options = {
            mediaType: 'photo' as MediaType,
            quality: 0.8 as PhotoQuality,
            maxWidth: 1024,
            maxHeight: 1024,
            includeBase64: false,
            saveToPhotos: false,
            cameraType: 'back',
        };

        launchCamera(options, async (response: ImagePickerResponse) => {
            console.log('Camera response:', response);

            if (response.didCancel) {
                console.log('User cancelled camera');
                setLoading(false);
                return;
            }

            if (response.errorMessage) {
                console.log('Camera error:', response.errorMessage);
                Alert.alert('Camera Error', response.errorMessage);
                setLoading(false);
                return;
            }

            if (response.assets && response.assets[0]) {
                const photoUri = response.assets[0].uri;
                console.log('Photo captured:', photoUri);
                if (photoUri) {
                    try {
                        // Upload to Firebase Storage
                        const uploadResult = await PhotoUploadService.uploadPhoto(photoUri, figureId, userId);
                        if (uploadResult.success && uploadResult.downloadUrl) {
                            console.log('Photo uploaded successfully:', uploadResult.downloadUrl);
                            onPhotoSelected(uploadResult.downloadUrl);
                            onClose();
                        } else {
                            console.log('Upload failed:', uploadResult.error);
                            Alert.alert('Upload Error', uploadResult.error || 'Failed to upload photo');
                        }
                    } catch (error) {
                        console.log('Upload error:', error);
                        Alert.alert('Upload Error', 'Failed to upload photo');
                    } finally {
                        setLoading(false);
                    }
                } else {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        });
    };

    const handleChooseFromGallery = async () => {
        setLoading(true);

        // Check storage permission first
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
            setLoading(false);
            Alert.alert(
                'Permission Denied',
                'Storage permission is required to access your photo library. Please enable it in your device settings.',
                [{ text: 'OK' }]
            );
            return;
        }

        const options = {
            mediaType: 'photo' as MediaType,
            quality: 0.8 as PhotoQuality,
            maxWidth: 1024,
            maxHeight: 1024,
            includeBase64: false,
            selectionLimit: 1,
        };

        launchImageLibrary(options, async (response: ImagePickerResponse) => {
            console.log('Gallery response:', response);

            if (response.didCancel) {
                console.log('User cancelled gallery');
                setLoading(false);
                return;
            }

            if (response.errorMessage) {
                console.log('Gallery error:', response.errorMessage);
                Alert.alert('Gallery Error', response.errorMessage);
                setLoading(false);
                return;
            }

            if (response.assets && response.assets[0]) {
                const photoUri = response.assets[0].uri;
                console.log('Photo selected:', photoUri);
                if (photoUri) {
                    try {
                        // Upload to Firebase Storage
                        const uploadResult = await PhotoUploadService.uploadPhoto(photoUri, figureId, userId);
                        if (uploadResult.success && uploadResult.downloadUrl) {
                            console.log('Photo uploaded successfully:', uploadResult.downloadUrl);
                            onPhotoSelected(uploadResult.downloadUrl);
                            onClose();
                        } else {
                            console.log('Upload failed:', uploadResult.error);
                            Alert.alert('Upload Error', uploadResult.error || 'Failed to upload photo');
                        }
                    } catch (error) {
                        console.log('Upload error:', error);
                        Alert.alert('Upload Error', 'Failed to upload photo');
                    } finally {
                        setLoading(false);
                    }
                } else {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        });
    };

    const handleSkip = () => {
        onPhotoSelected('skip');
        onClose();
    };

    if (!visible) {
        return null;
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
            statusBarTranslucent={true}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.overlayTouchable}
                    activeOpacity={1}
                    onPress={onClose}
                >
                    <TouchableOpacity
                        style={styles.modalContainer}
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <LinearGradient
                            colors={gradients.header}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.headerGradient}
                        >
                            <Text style={styles.title}>Add Photo to Your Collection</Text>
                            <Text style={styles.subtitle}>
                                Take a photo with your camera or choose from your gallery to add to your Labubu collection!
                            </Text>
                        </LinearGradient>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.cameraButton]}
                                onPress={handleTakePhoto}
                                disabled={loading}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={[colors.primary, colors.accent]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.buttonGradient}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="white" size="small" />
                                    ) : (
                                        <>
                                            <Text style={styles.buttonIcon}>📸</Text>
                                            <Text style={styles.buttonText}>Take Photo</Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.galleryButton]}
                                onPress={handleChooseFromGallery}
                                disabled={loading}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={[colors.primary, colors.accent]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.buttonGradient}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="white" size="small" />
                                    ) : (
                                        <>
                                            <Text style={styles.buttonIcon}>🖼️</Text>
                                            <Text style={styles.buttonText}>Choose from Gallery</Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.skipButton]}
                                onPress={handleSkip}
                                disabled={loading}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.skipButtonText}>Skip - Use Default Image</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    overlayTouchable: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: colors.card,
        borderRadius: 24,
        margin: spacing.lg,
        width: SCREEN_WIDTH - 40,
        maxWidth: 400,
        overflow: 'hidden',
        zIndex: 10000,
        ...shadows.card,
    },
    headerGradient: {
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
    },
    title: {
        fontSize: fontSizes.lg,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.sm,
        textShadowColor: 'rgba(255, 255, 255, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    subtitle: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    buttonContainer: {
        padding: spacing.lg,
    },
    button: {
        marginBottom: spacing.md,
        borderRadius: 16,
        overflow: 'hidden',
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        minHeight: 56,
    },
    cameraButton: {
        // Additional styles if needed
    },
    galleryButton: {
        // Additional styles if needed
    },
    skipButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary,
        borderRadius: 16,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        minHeight: 56,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonIcon: {
        fontSize: 24,
        marginRight: spacing.sm,
    },
    buttonText: {
        color: 'white',
        fontSize: fontSizes.md,
        fontWeight: '600',
        textAlign: 'center',
    },
    skipButtonText: {
        color: colors.primary,
        fontSize: fontSizes.md,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default PhotoPicker;