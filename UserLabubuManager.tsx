import React, { useEffect, useState } from 'react';
import { Alert, Button, FlatList, Image, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { firestore, storage } from './firebaseConfig';
import { launchImageLibrary, ImageLibraryOptions, Asset } from 'react-native-image-picker';
import { labubuFigures, LabubuFigure } from './LabubuFiguresData';

type SortKey = 'series' | 'name' | 'rarity';

const rarityOrder = ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Ultra Rare'];

const UserLabubuManager = ({ userId = 'user123' }: { userId: string }) => {
    const [labubus, setLabubus] = useState<LabubuFigure[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [sortBy, setSortBy] = useState<SortKey>('series');
    const [selectedLabubuId, setSelectedLabubuId] = useState<number | null>(null);

    useEffect(() => {
        setIsLoading(true);
        const colRef = firestore()
            .collection('users')
            .doc(userId)
            .collection('labubus');

        const unsubscribe = colRef.onSnapshot(
            (snap) => {
                try {
                    const labubusArray = snap.docs.map((d) => d.data() as LabubuFigure);
                    const sortedLabubus = [...labubusArray].sort((a, b) => {
                        if (sortBy === 'series') {
                            return a.series.localeCompare(b.series) || a.name.localeCompare(b.name);
                        }
                        if (sortBy === 'name') {
                            return a.name.localeCompare(b.name);
                        }
                        return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity) || a.name.localeCompare(b.name);
                    });
                    setLabubus(sortedLabubus);
                } catch (e) {
                    console.error('Fetch parse error:', e);
                    Alert.alert('Error', 'Failed to parse Labubus data');
                } finally {
                    setIsLoading(false);
                }
            },
            (error) => {
                console.error('Fetch error:', error);
                Alert.alert('Error', `Failed to fetch Labubus: ${error.message}`);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [userId, sortBy]);

    const pickAndSaveLabubu = async () => {
        if (!selectedLabubuId) {
            Alert.alert('Error', 'Please select a Labubu figure');
            return;
        }
        if (isLoading) return;
        setIsLoading(true);
        try {
            const labubu = labubuFigures.find((f) => f.id === selectedLabubuId);
            if (!labubu) {
                Alert.alert('Error', 'Labubu not found');
                return;
            }

            const options: ImageLibraryOptions = { mediaType: 'photo', quality: 1 };
            const result = await launchImageLibrary(options);
            if (result.didCancel) {
                setIsLoading(false);
                return;
            }
            const asset: Asset | undefined = result.assets?.[0];
            if (!asset?.uri) {
                Alert.alert('Error', 'No image selected');
                setIsLoading(false);
                return;
            }

            const fileUri = asset.uri;
            const fileName = `${labubu.name.replace(/\s+/g, '_')}_${Date.now()}.jpg`;
            const storagePath = `users/${userId}/labubus/${fileName}`;
            const imageRef = storage().ref(storagePath);
            await imageRef.putFile(fileUri);
            const imageUrl = await imageRef.getDownloadURL();

            const labubuData: LabubuFigure = {
                ...labubu,
                userImageUrl: imageUrl,
                ownedDate: new Date().toISOString(),
            };

            await firestore()
                .collection('users')
                .doc(userId)
                .collection('labubus')
                .doc(String(selectedLabubuId))
                .set(labubuData);

            Alert.alert('Success', `${labubu.name} saved with image!`);
        } catch (error: any) {
            console.error('Save error:', error);
            Alert.alert('Error', `Failed to save Labubu: ${error.message ?? String(error)}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.note}>
                Names are official Pop Mart titles from blind box series (e.g., Green Grape, Hehe). Community nicknames may differ.
            </Text>
            <TouchableOpacity onPress={() => Alert.alert('Naming Info', 'We use official Pop Mart names from blind box series like Exciting Macaron (e.g., Green Grape) and Have a Seat (e.g., Hehe, BaBa). Community nicknames may vary. Contact us if a name seems off!')}>
                <Text style={styles.infoIcon}>ℹ️</Text>
            </TouchableOpacity>
            <View style={styles.sortButtons}>
                <Button title="Sort by Series" onPress={() => setSortBy('series')} disabled={sortBy === 'series'} />
                <Button title="Sort by Name" onPress={() => setSortBy('name')} disabled={sortBy === 'name'} />
                <Button title="Sort by Rarity" onPress={() => setSortBy('rarity')} disabled={sortBy === 'rarity'} />
            </View>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={selectedLabubuId}
                    onValueChange={(itemValue) => setSelectedLabubuId(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="Select a Labubu" value={null} />
                    {labubuFigures.map((figure) => (
                        <Picker.Item
                            key={figure.id}
                            label={`${figure.name} (${figure.series})`}
                            value={figure.id}
                        />
                    ))}
                </Picker>
            </View>
            <Button
                title={isLoading ? 'Saving...' : 'Add Selected Labubu'}
                onPress={pickAndSaveLabubu}
                disabled={isLoading || !selectedLabubuId}
            />
            <FlatList
                data={labubus}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        {item.userImageUrl ? (
                            <Image source={{ uri: item.userImageUrl }} style={styles.image} />
                        ) : item.imageUrl ? (
                            <Image source={{ uri: item.imageUrl }} style={styles.image} />
                        ) : null}
                        <View>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.series}>{item.series}</Text>
                            <Text style={styles.rarity}>Rarity: {item.rarity}</Text>
                            <Text style={styles.date}>Owned: {item.ownedDate || 'N/A'}</Text>
                        </View>
                    </View>
                )}
                ListEmptyComponent={<Text>No Labubus saved yet</Text>}
                ItemSeparatorComponent={({ item, index }) => {
                    if (sortBy !== 'series' || index === 0) return null;
                    const prevItem = labubus[index - 1];
                    return item.series !== prevItem?.series ? <View style={styles.separator} /> : null;
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
    note: { fontSize: 12, color: '#666', marginBottom: 10, textAlign: 'center' },
    infoIcon: { fontSize: 16, color: '#007AFF', marginBottom: 10, textAlign: 'center' },
    sortButtons: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    item: { flexDirection: 'row', alignItems: 'center', padding: 8, marginBottom: 8, backgroundColor: '#fff', borderRadius: 8 },
    image: { width: 60, height: 60, marginRight: 8 },
    name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    series: { fontSize: 12, color: '#666' },
    rarity: { fontSize: 12, color: '#888' },
    date: { fontSize: 12, color: '#888' },
    separator: { height: 1, backgroundColor: '#ddd', marginVertical: 8 },
    pickerContainer: {
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#fff',
        paddingHorizontal: 8
    },
    picker: {
        height: 50,
        width: '100%',
        color: '#333'
    }
});

export default UserLabubuManager;


