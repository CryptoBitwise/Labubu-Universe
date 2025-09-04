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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, spacing, fontSizes, shadows, gradients } from './designSystem';

// Try to import react-native-image-picker, fallback to placeholder if not available
let launchImageLibrary: any = null;
let launchCamera: any = null;
try {
    const imagePicker = require('react-native-image-picker');
    launchImageLibrary = imagePicker.launchImageLibrary;
    launchCamera = imagePicker.launchCamera;
} catch (error) {
    // Package not installed yet, will use placeholder functionality
    console.log('react-native-image-picker not available, using placeholder functionality');
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PhotoPickerProps {
    visible: boolean;
    onPhotoSelected: (photoUri: string) => void;
    onClose: () => void;
}

const PhotoPicker: React.FC<PhotoPickerProps> = ({
    visible,
    onPhotoSelected,
    onClose,
}) => {
    const [loading, setLoading] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    const handleTakePhoto = () => {
        Alert.alert(
            '📸 Camera Feature Coming Soon!',
            'The camera functionality will be available in a future update. For now, you can use the "Skip" option to continue.',
            [
                { text: 'OK', style: 'default' }
            ]
        );
    };

    const handleChooseFromGallery = () => {
        Alert.alert(
            '🖼️ Gallery Feature Coming Soon!',
            'The gallery functionality will be available in a future update. For now, you can use the "Skip" option to continue.',
            [
                { text: 'OK', style: 'default' }
            ]
        );
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
                                Camera and gallery features coming soon! For now, you can skip to use the default image.
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
                                            <Text style={styles.buttonText}>Take Photo (Coming Soon)</Text>
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
                                            <Text style={styles.buttonText}>Choose from Gallery (Coming Soon)</Text>
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