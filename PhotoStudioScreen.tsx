import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet, SafeAreaView, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, spacing, fontSizes, gradients, shadows } from './designSystem';
import PhotoPicker from './PhotoPicker';
import { CollectionItem } from './collectionService';
import { labubuFigures } from './LabubuFiguresData';
import { PhotoUploadService } from './photoUploadService';
import { Modal, Dimensions } from 'react-native';

interface PhotoStudioScreenProps {
    onBack: () => void;
    collectionItems: CollectionItem[];
    onUpdateCollectionItems: (items: CollectionItem[]) => void;
}

export default function PhotoStudioScreen({ onBack, collectionItems, onUpdateCollectionItems }: PhotoStudioScreenProps) {
    const [pickerVisible, setPickerVisible] = useState(false);
    const [selectedFigureId, setSelectedFigureId] = useState<string | null>(null);
    const [viewerVisible, setViewerVisible] = useState(false);
    const [viewerIndex, setViewerIndex] = useState(0);

    // TODO real user auth; use placeholder for now
    const userId = 'user123';

    const studioItems = useMemo(
        () => collectionItems.filter(item => item.owned || !!item.userPhoto || (item.userPhotos && item.userPhotos.length > 0)),
        [collectionItems]
    );

    const openPickerFor = (figureId: string) => {
        setSelectedFigureId(figureId);
        setPickerVisible(true);
    };

    const handlePhotoSelected = (photoUri: string) => {
        if (!selectedFigureId) {
            setPickerVisible(false);
            return;
        }
        try {
            const idx = collectionItems.findIndex(i => i.figureId === selectedFigureId);
            const updated = [...collectionItems];
            if (idx >= 0) {
                const item = updated[idx];
                const nextPhotos = photoUri !== 'skip' ? ([...(item.userPhotos || []), photoUri]) : (item.userPhotos || []);
                updated[idx] = { ...item, userPhoto: photoUri !== 'skip' ? photoUri : undefined, userPhotos: nextPhotos };
            } else {
                const first = photoUri !== 'skip' ? [photoUri] : [];
                updated.push({ figureId: selectedFigureId, owned: true, wishlist: false, userPhoto: photoUri !== 'skip' ? photoUri : undefined, userPhotos: first, dateAdded: new Date().toISOString() });
            }
            onUpdateCollectionItems(updated);
        } catch (e) {
            console.error('PhotoStudio handlePhotoSelected error:', e);
            Alert.alert('Error', 'Failed to save photo');
        } finally {
            setPickerVisible(false);
            setSelectedFigureId(null);
        }
    };

    const handlePhotosSelected = (photoUris: string[]) => {
        if (!selectedFigureId || photoUris.length === 0) {
            setPickerVisible(false);
            return;
        }
        try {
            const idx = collectionItems.findIndex(i => i.figureId === selectedFigureId);
            const updated = [...collectionItems];
            if (idx >= 0) {
                const item = updated[idx];
                const merged = [...(item.userPhotos || []), ...photoUris];
                updated[idx] = { ...item, userPhoto: merged[merged.length - 1], userPhotos: merged };
            } else {
                updated.push({ figureId: selectedFigureId, owned: true, wishlist: false, userPhoto: photoUris[photoUris.length - 1], userPhotos: photoUris, dateAdded: new Date().toISOString() });
            }
            onUpdateCollectionItems(updated);
        } catch (e) {
            console.error('PhotoStudio handlePhotosSelected error:', e);
            Alert.alert('Error', 'Failed to save photos');
        } finally {
            setPickerVisible(false);
            setSelectedFigureId(null);
        }
    };

    const renderItem = ({ item }: { item: CollectionItem }) => {
        const figure = labubuFigures.find(f => String(f.id) === String(item.figureId));
        const thumb = figure?.imageUrl;
        const name = figure?.name || `Figure #${item.figureId}`;
        const allPhotos = item.userPhotos && item.userPhotos.length > 0 ? item.userPhotos : (item.userPhoto ? [item.userPhoto] : []);
        const openViewer = (startIndex: number) => {
            setSelectedFigureId(item.figureId);
            setViewerIndex(startIndex);
            setViewerVisible(true);
        };
        return (
            <View style={styles.card}>
                <TouchableOpacity style={styles.imageBox} activeOpacity={0.9} onPress={() => openPickerFor(item.figureId)}>
                    {allPhotos.length > 0 ? (
                        <TouchableOpacity activeOpacity={0.9} onPress={() => openViewer(0)} style={{ flex: 1 }}>
                            <Image source={{ uri: allPhotos[allPhotos.length - 1] }} style={styles.userOverlay} resizeMode="cover" />
                        </TouchableOpacity>
                    ) : thumb ? (
                        <Image source={{ uri: thumb }} style={styles.image} resizeMode="cover" />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <Text style={styles.placeholderEmoji}>📸</Text>
                            <Text style={styles.placeholderText}>Add Photo</Text>
                        </View>
                    )}
                </TouchableOpacity>
                <View style={styles.cardFooter}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{name}</Text>
                    <View style={styles.actionsRow}>
                        <TouchableOpacity onPress={() => openPickerFor(item.figureId)}>
                            <Text style={styles.cardCta}>{allPhotos.length > 0 ? 'Add More' : 'Upload'}</Text>
                        </TouchableOpacity>
                        {allPhotos.length > 0 ? (
                            <TouchableOpacity
                                onPress={async () => {
                                    Alert.alert('Remove Photo', 'Delete this photo from your figure?', [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Remove', style: 'destructive', onPress: async () => {
                                                try {
                                                    const updated = collectionItems.map(ci => {
                                                        if (ci.figureId !== item.figureId) return ci;
                                                        const photosArr = (ci.userPhotos && ci.userPhotos.length > 0)
                                                            ? ci.userPhotos
                                                            : (ci.userPhoto ? [ci.userPhoto] : []);
                                                        if (photosArr.length === 0) return { ...ci, userPhoto: undefined, userPhotos: [] };
                                                        const last = photosArr[photosArr.length - 1];
                                                        const remaining = photosArr.slice(0, - 1);
                                                        const newCover = remaining.length > 0 ? remaining[remaining.length - 1] : undefined;
                                                        if (last && PhotoUploadService.isFirebaseStorageUrl(last)) {
                                                            PhotoUploadService.deletePhoto(last).catch(() => { });
                                                        }
                                                        return { ...ci, userPhoto: newCover, userPhotos: remaining };
                                                    });
                                                    onUpdateCollectionItems(updated);
                                                } catch (e) {
                                                    console.error('Delete photo error', e);
                                                    Alert.alert('Error', 'Failed to remove photo');
                                                }
                                            }
                                        }
                                    ]);
                                }}
                                accessibilityLabel={`Remove photo for ${name}`}
                            >
                                <Text style={styles.removeText}>Remove</Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <LinearGradient colors={gradients.header} style={styles.headerGradient}>
                <View style={styles.headerContent}>
                    <TouchableOpacity style={styles.standardBackButton} onPress={onBack}>
                        <Text style={styles.standardBackButtonText}>← Back</Text>
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.header}>Photo Studio 📸</Text>
                        <Text style={styles.headerTagline}>Add photos to your owned figures</Text>
                    </View>
                </View>
            </LinearGradient>

            {studioItems.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>No photos yet</Text>
                    <Text style={styles.emptySubtitle}>Upload a photo for any figure from your collection.</Text>
                </View>
            ) : (
                <FlatList
                    data={studioItems}
                    keyExtractor={(it) => it.figureId}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                />
            )}

            <PhotoPicker
                visible={pickerVisible}
                figureId={selectedFigureId || ''}
                userId={userId}
                allowMultiple={true}
                onPhotoSelected={handlePhotoSelected}
                onPhotosSelected={handlePhotosSelected}
                onClose={() => { setPickerVisible(false); setSelectedFigureId(null); }}
            />

            {/* Simple full-screen viewer using Modal */}
            {viewerVisible && selectedFigureId ? (
                <FullScreenViewer
                    visible={viewerVisible}
                    onClose={() => setViewerVisible(false)}
                    photos={(() => {
                        const it = collectionItems.find(ci => ci.figureId === selectedFigureId);
                        if (!it) return [] as string[];
                        if (it.userPhotos && it.userPhotos.length > 0) return it.userPhotos;
                        if (it.userPhoto) return [it.userPhoto];
                        return [] as string[];
                    })()}
                    startIndex={viewerIndex}
                />
            ) : null}
        </SafeAreaView>
    );
}

function FullScreenViewer({ visible, photos, startIndex, onClose }: { visible: boolean; photos: string[]; startIndex: number; onClose: () => void; }) {
    const [index, setIndex] = useState(startIndex || 0);
    const { width, height } = Dimensions.get('window');
    useEffect(() => { setIndex(startIndex || 0); }, [startIndex]);
    const next = () => setIndex((i) => Math.min(i + 1, photos.length - 1));
    const prev = () => setIndex((i) => Math.max(i - 1, 0));
    if (!visible) return null;
    if (!photos || photos.length === 0) return null;
    return (
        <Modal visible transparent animationType="fade" onRequestClose={onClose}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', alignItems: 'center', justifyContent: 'center' }}>
                <TouchableOpacity style={{ position: 'absolute', top: 40, right: 20, padding: 10 }} onPress={onClose}>
                    <Text style={{ color: 'white', fontSize: 18 }}>Close</Text>
                </TouchableOpacity>
                <Image source={{ uri: photos[index] }} style={{ width: width * 0.92, height: height * 0.72, borderRadius: 12 }} resizeMode="contain" />
                <View style={{ flexDirection: 'row', marginTop: 16, alignItems: 'center' }}>
                    <TouchableOpacity onPress={prev} disabled={index === 0} style={{ padding: 12, opacity: index === 0 ? 0.4 : 1 }}>
                        <Text style={{ color: 'white', fontSize: 18 }}>◀</Text>
                    </TouchableOpacity>
                    <Text style={{ color: 'white', marginHorizontal: 12 }}>{index + 1} / {photos.length}</Text>
                    <TouchableOpacity onPress={next} disabled={index === photos.length - 1} style={{ padding: 12, opacity: index === photos.length - 1 ? 0.4 : 1 }}>
                        <Text style={{ color: 'white', fontSize: 18 }}>▶</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    headerGradient: {
        paddingTop: spacing.xl,
        paddingBottom: spacing.lg,
        alignItems: 'center',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        ...shadows.card,
    },
    header: {
        fontSize: fontSizes.xl,
        fontWeight: '700',
        color: colors.primary,
        textAlign: 'center',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    headerTextContainer: {
        flex: 1,
        alignItems: 'center',
    },
    standardBackButton: {
        marginRight: spacing.sm,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        borderRadius: 12,
        backgroundColor: colors.accent,
    },
    standardBackButtonText: {
        color: colors.text,
        fontSize: fontSizes.sm,
        fontWeight: 'bold',
    },
    listContent: {
        padding: spacing.lg,
        paddingBottom: spacing.xl,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: 16,
        marginBottom: spacing.lg,
        width: '48%',
        overflow: 'hidden',
        ...shadows.card,
    },
    imageBox: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: '#F2F2F2',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    userOverlay: {
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    placeholderImage: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderEmoji: {
        fontSize: 32,
        marginBottom: 6,
    },
    placeholderText: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
    },
    cardFooter: {
        padding: spacing.sm,
    },
    cardTitle: {
        fontSize: fontSizes.sm,
        fontWeight: '700',
        color: colors.primary,
    },
    actionsRow: {
        marginTop: 4,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardCta: {
        fontSize: fontSizes.sm,
        color: colors.accent,
        marginTop: 2,
    },
    removeText: {
        fontSize: fontSizes.sm,
        color: '#D9534F',
        marginTop: 2,
        fontWeight: '600',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
    },
    emptyTitle: {
        fontSize: fontSizes.lg,
        fontWeight: '700',
        color: colors.primary,
        marginBottom: spacing.xs,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: fontSizes.sm,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});


