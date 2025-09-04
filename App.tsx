/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView, StatusBar, Animated, Modal, Dimensions, Easing } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import BrowseFiguresScreen from './BrowseFiguresScreen';
import CollectionScreen from './CollectionScreen';
import { colors, spacing, fontSizes, gradients, shadows } from './designSystem';
const labubupink = require('./assets/labubupink.png');

let Haptics: any = { selectionAsync: () => { } };
try {
  Haptics = require('expo-haptics');
} catch { }

const LORE_TIPS = [
  'The very first Labubu was inspired by a mischievous forest spirit! Some collectors believe finding a "Secret" Labubu brings extra luck to your collection. ✨',
  'Labubu is known for its cheeky grin and pointy ears—true fans can spot a real Labubu from a mile away! 🐰',
  'Collectors call ultra-rare Labubus "grails"—have you found your grail yet?',
  'Labubu fans love to trade doubles with friends. Swapping is part of the magic! 💖',
  'Some say if you display your Labubus under a full moon, they bring sweet dreams. 🌙',
  'The Labubu community loves to share unboxing videos—show off your pulls and join the fun!',
  'Did you know? There are secret colorways hidden in some series. Keep your eyes peeled! 🌈',
];

const SPLASH_DURATION = 3500;

// Collection item type with user photo support
interface CollectionItem {
  figureId: string;
  owned: boolean;
  wishlist: boolean;
  userPhoto?: string;
  dateAdded?: string;
  notes?: string;
}

function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [fadeIn] = useState(new Animated.Value(0));
  const [fadeOut] = useState(new Animated.Value(1));
  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();
    const timer = setTimeout(() => {
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(onFinish);
    }, SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, [fadeIn, fadeOut, onFinish]);

  // Cute loading sparkle animation
  const sparkleAnim = useState(new Animated.Value(0))[0];
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(sparkleAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, [sparkleAnim]);
  const sparkleY = sparkleAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  const sparkleOpacity = sparkleAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 1, 0.5] });

  return (
    <Animated.View style={[styles.splashContainer, { opacity: fadeOut }]}>
      {/* Dreamy gradient background */}
      <LinearGradient
        colors={["#F9C6E0", "#BEE7F7", "#FFF7D6", "#C6F9E0"]}
        start={{ x: 0.1, y: 0.1 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Subtle sparkles and floating elements */}
      <Animated.Text style={[styles.splashBgIcon, { top: 60, left: 40, opacity: 0.18 }]}>✨</Animated.Text>
      <Animated.Text style={[styles.splashBgIcon, { top: 120, right: 60, opacity: 0.13, position: 'absolute' }]}>🌸</Animated.Text>
      <Animated.Text style={[styles.splashBgIcon, { bottom: 100, left: 80, opacity: 0.15 }]}>💖</Animated.Text>
      <Animated.Text style={[styles.splashBgIcon, { bottom: 60, right: 50, opacity: 0.12, position: 'absolute' }]}>⭐</Animated.Text>
      {/* Main title and subtitle with fade-in */}
      <Animated.View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, opacity: fadeIn }}>
        <Text style={styles.splashTitleBig}>Labubu Universe ✨</Text>
        <Text style={styles.splashSubtitle}>Begin your magical journey</Text>
        {/* Cute animated loading sparkle */}
        <Animated.Text style={{
          fontSize: 38,
          marginTop: 32,
          color: '#F9C6E0',
          textShadowColor: '#fff',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 8,
          opacity: sparkleOpacity,
          transform: [{ translateY: sparkleY }],
        }}>✨</Animated.Text>
        <Text style={styles.splashLoadingText}>Loading Labubu magic...</Text>
      </Animated.View>
    </Animated.View>
  );
}

function AnimatedButton({ onPress, style, children, disabled }: any) {
  const scale = useState(new Animated.Value(1))[0];
  const floatAnim = useState(new Animated.Value(0))[0];
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 3000, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
        Animated.timing(floatAnim, { toValue: 0, duration: 3000, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
      ])
    ).start();
  }, [floatAnim]);
  const floatY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 30, bounciness: 8 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 8 }).start();
  };
  const handlePress = () => {
    if (!disabled) {
      Haptics.selectionAsync && Haptics.selectionAsync();
      onPress && onPress();
    }
  };
  return (
    <Animated.View style={{ transform: [{ scale }, { translateY: floatY }], width: '100%' }}>
      <TouchableOpacity
        style={style}
        activeOpacity={0.85}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

function LoreDiscoveryButton({ onPress }: { onPress: () => void }) {
  return (
    <AnimatedButton style={[styles.moduleCard, styles.loreCard]} onPress={onPress}>
      <Text style={styles.moduleTitle}>Lore & Discovery 🌟</Text>
      <Text style={styles.moduleDesc}>Peek behind the magic, find hidden stories, and become a true Labubu expert! 📖✨</Text>
    </AnimatedButton>
  );
}

function MyCollectionButton({ onPress }: { onPress: () => void }) {
  return (
    <AnimatedButton style={[styles.moduleCard, styles.collectionCard]} onPress={onPress}>
      <Text style={styles.moduleTitle}>My Collection 🧺</Text>
      <Text style={styles.moduleDesc}>See your adorable Labubus, track your grails, and show off your stash! 🐰💖</Text>
    </AnimatedButton>
  );
}

function TradingHubButton({ onPress }: { onPress: () => void }) {
  return (
    <AnimatedButton style={[styles.moduleCard, styles.tradingCard]} onPress={onPress}>
      <Text style={styles.moduleTitle}>Trading Hub 🔄</Text>
      <Text style={styles.moduleDesc}>Swap, connect, and make new collector friends! (Coming soon!) 🤝</Text>
    </AnimatedButton>
  );
}

function DisplayStudioButton({ onPress }: { onPress: () => void }) {
  return (
    <AnimatedButton style={[styles.moduleCard, styles.displayCard]} onPress={onPress}>
      <Text style={styles.moduleTitle}>Display Studio 🖼️</Text>
      <Text style={styles.moduleDesc}>Create your dreamy Labubu world and share it! (Coming soon!) 🌈</Text>
    </AnimatedButton>
  );
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [screen, setScreen] = useState<'home' | 'browse' | 'collection'>('home');
  const [owned, setOwned] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showLore, setShowLore] = useState(false);
  const [loreTip, setLoreTip] = useState(LORE_TIPS[0]);

  const [collectionItems, setCollectionItems] = useState<CollectionItem[]>([]);

  const addToOwned = (id: string) => {
    if (!owned.includes(id)) {
      setOwned([...owned, id]);
      setWishlist(wishlist.filter(fid => fid !== id));
      Alert.alert('Added to Owned!');
    }
  };
  const addToWishlist = (id: string) => {
    if (!wishlist.includes(id) && !owned.includes(id)) {
      setWishlist([...wishlist, id]);
      Alert.alert('Added to Wishlist!');
    }
  };

  const moveToOwned = (id: string) => {
    if (!owned.includes(id)) {
      setOwned([...owned, id]);
      setWishlist(wishlist.filter(fid => fid !== id));
      Alert.alert('Moved to Owned!');
    }
  };
  const moveToWishlist = (id: string) => {
    if (!wishlist.includes(id)) {
      setWishlist([...wishlist, id]);
      setOwned(owned.filter(fid => fid !== id));
      Alert.alert('Moved to Wishlist!');
    }
  };
  const removeCompletely = (id: string) => {
    setOwned(owned.filter(fid => fid !== id));
    setWishlist(wishlist.filter(fid => fid !== id));
    // Also remove from collection items
    setCollectionItems(collectionItems.filter(item => item.figureId !== id));
  };



  // Floating animation for sparkles
  const floating = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floating, { toValue: 1, duration: 3500, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
        Animated.timing(floating, { toValue: 0, duration: 3500, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
      ])
    ).start();
  }, [floating]);
  const floatUp = floating.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });
  const floatDown = floating.interpolate({ inputRange: [0, 1], outputRange: [0, 18] });
  const twinkle = floating.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 1, 0.5] });

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // Lore & Discovery Modal
  const LoreModal = () => (
    <Modal
      visible={showLore}
      animationType="fade"
      transparent
      onRequestClose={() => setShowLore(false)}
    >
      <View style={styles.loreModalOverlay}>
        <View style={styles.loreModalBox}>
          <Text style={styles.loreModalTitle}>Labubu Lore & Discovery 🌟</Text>
          <View style={styles.loreTipBox}>
            <Text style={styles.loreTipTitle}>Did you know?</Text>
            <Text style={styles.loreTipText}>{loreTip}</Text>
          </View>
          <TouchableOpacity
            style={styles.loreModalButton}
            onPress={() => setLoreTip(LORE_TIPS[Math.floor(Math.random() * LORE_TIPS.length)])}
            activeOpacity={0.85}
          >
            <Text style={styles.loreModalButtonText}>Show Another Lore Tip ✨</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.loreModalButton, styles.loreModalCTA]}
            onPress={() => { setShowLore(false); setScreen('browse'); }}
            activeOpacity={0.9}
          >
            <Text style={styles.loreModalCTAtext}>Want to discover more? Browse Figures →</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.loreModalClose}
            onPress={() => setShowLore(false)}
            activeOpacity={0.7}
          >
            <Text style={styles.loreModalCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (screen === 'browse') {
    return (
      <BrowseFiguresScreen
        onBack={() => {
          setScreen('home');
        }}
        owned={owned}
        wishlist={wishlist}
        addToOwned={id => { addToOwned(id); }}
        addToWishlist={id => { addToWishlist(id); }}
      />
    );
  }
  if (screen === 'collection') {
    return (
      <CollectionScreen
        onBack={() => {
          setScreen('home');
        }}
        onBrowse={() => { setScreen('browse'); }}
        owned={owned}
        wishlist={wishlist}
        collectionItems={collectionItems}
        moveToOwned={id => { moveToOwned(id); }}
        moveToWishlist={id => { moveToWishlist(id); }}
        removeCompletely={id => { removeCompletely(id); }}
        onUpdatePhoto={() => { }} // Photo handling is now done locally in CollectionScreen
        onUpdateCollectionItems={setCollectionItems}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} pointerEvents="box-none">
      {/* Dreamy, playful gradient background */}
      <LinearGradient
        colors={["#F9C6E0", "#BEE7F7", "#FFF7D6", "#C6F9E0"]}
        start={{ x: 0.1, y: 0.1 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Subtle cute patterns: stars, hearts, dots */}
      <Animated.Text style={[styles.bgIcon, styles.bgIconText, { top: 60, left: 30, opacity: 0.18, position: 'absolute' }]}>✨</Animated.Text>
      <Animated.Text style={[styles.bgIcon, styles.bgIconText, { top: 120, right: 40, opacity: 0.13, position: 'absolute' }]}>🌸</Animated.Text>
      <Animated.Text style={[styles.bgIcon, styles.bgIconText, { bottom: 100, left: 60, opacity: 0.15, position: 'absolute' }]}>💖</Animated.Text>
      <Animated.Text style={[styles.bgIcon, styles.bgIconText, { bottom: 60, right: 30, opacity: 0.12, position: 'absolute' }]}>⭐</Animated.Text>
      <Animated.Text style={[styles.bgIcon, styles.bgIconText, { top: SCREEN_HEIGHT * 0.4, left: SCREEN_WIDTH * 0.5, opacity: 0.09, position: 'absolute' }]}>•</Animated.Text>
      <Animated.Text style={[styles.bgIcon, styles.bgIconText, { top: SCREEN_HEIGHT * 0.7, left: SCREEN_WIDTH * 0.2, opacity: 0.09, position: 'absolute' }]}>•</Animated.Text>
      {/* More floating sparkles and hearts with animation */}
      <Animated.Text style={[styles.bgIcon, styles.bgIconText, { top: 90, left: 120, opacity: twinkle, position: 'absolute', transform: [{ translateY: floatUp }] }]}>✨</Animated.Text>
      <Animated.Text style={[styles.bgIcon, styles.bgIconText, { top: 200, right: 80, opacity: twinkle, position: 'absolute', transform: [{ translateY: floatDown }] }]}>💖</Animated.Text>
      <Animated.Text style={[styles.bgIcon, styles.bgIconText, { bottom: 180, left: 40, opacity: twinkle, position: 'absolute', transform: [{ translateY: floatUp }] }]}>⭐</Animated.Text>
      <Animated.Text style={[styles.bgIcon, styles.bgIconText, { bottom: 120, right: 100, opacity: twinkle, position: 'absolute', transform: [{ translateY: floatDown }] }]}>🌸</Animated.Text>
      {/* Kawaii character silhouette (Labubu) in background */}
      <Animated.Image
        source={labubupink}
        style={[
          styles.labubuSilhouette,
          {
            opacity: 0.14,
            left: SCREEN_WIDTH / 2 - 90,
            top: SCREEN_HEIGHT / 2 - 90,
            transform: [{ scale: 1.2 }, { translateY: floatUp }],
            position: 'absolute',
          },
        ]}
        resizeMode="contain"
      />
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <LinearGradient colors={gradients.header} style={styles.headerGradient}>
        <Text style={styles.header}>
          Labubu Universe ✨
        </Text>
        <Text style={styles.headerTagline}>Your Magical Collector’s Playground!</Text>
      </LinearGradient>
      {/* 2x2 grid of independent module cards */}
      <View style={styles.centeredCardsContainer}>
        <LoreDiscoveryButton onPress={() => setShowLore(true)} />
        <MyCollectionButton onPress={() => setScreen('collection')} />
        <TradingHubButton onPress={() => Alert.alert('Coming Soon!')} />
        <DisplayStudioButton onPress={() => Alert.alert('Coming Soon!')} />
      </View>
      <LoreModal />
    </SafeAreaView>
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
    fontSize: fontSizes.xxl,
    fontWeight: '700',
    color: '#6C3DD1', // dark purple
    letterSpacing: 1.2,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  headerTagline: {
    fontSize: fontSizes.md,
    color: '#B46FC2', // darker pastel purple for better contrast
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 4,
    letterSpacing: 0.5,
    textShadowColor: '#F9C6E0',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: fontSizes.lg,
    color: colors.accent,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
  },
  welcome: {
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 32,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 18,
    marginBottom: spacing.md,
    width: 260,
    alignItems: 'center',
    ...shadows.card,
  },
  buttonText: {
    color: colors.card,
    fontSize: fontSizes.md,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  disabledButton: {
    backgroundColor: colors.border,
    shadowOpacity: 0.06,
  },
  disabledButtonText: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  splashContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  splashGradient: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashTitleBig: {
    fontSize: fontSizes.xxl + 12,
    fontWeight: '700',
    color: '#6C3DD1',
    letterSpacing: 2,
    textAlign: 'center',
    textShadowColor: '#F7B2E6',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  kawaiiStar: {
    position: 'absolute',
    fontSize: 36,
    opacity: 0.5,
    zIndex: 1,
  },
  loreTipBox: {
    backgroundColor: '#FFF7D6',
    borderRadius: 18,
    padding: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1.5,
    borderColor: '#F9C6E0',
    shadowColor: '#F9C6E0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  loreTipTitle: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  loreTipText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: 'transparent',
  },
  footerText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    opacity: 0.7,
  },
  centeredCardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  moduleCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    width: 280,
    marginBottom: 20,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  moduleTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 6,
    textAlign: 'center',
  },
  moduleDesc: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loreCard: {
    borderColor: '#F9C6E0',
    borderWidth: 2,
    shadowColor: '#F9C6E0',
  },
  collectionCard: {
    borderColor: '#BEE7F7',
    borderWidth: 2,
    shadowColor: '#BEE7F7',
  },
  tradingCard: {
    borderColor: '#C6F9E0',
    borderWidth: 2,
    shadowColor: '#C6F9E0',
  },
  displayCard: {
    borderColor: '#FFE5C7',
    borderWidth: 2,
    shadowColor: '#FFE5C7',
  },
  bgIcon: {
    position: 'absolute',
    zIndex: 0,
  },
  bgIconText: {
    fontSize: 54,
    color: '#BFA6E0',
    textShadowColor: '#fff',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  labubuSilhouette: {
    width: 180,
    height: 180,
    zIndex: 0,
    position: 'absolute',
  },
  loreModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loreModalBox: {
    backgroundColor: '#FFF7D6',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#F9C6E0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
    width: 340,
    maxWidth: '100%',
  },
  loreModalTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  loreModalButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
    marginBottom: 2,
    alignItems: 'center',
    width: 260,
    alignSelf: 'center',
    ...shadows.card,
  },
  loreModalButtonText: {
    color: colors.card,
    fontSize: fontSizes.md,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  loreModalCTA: {
    backgroundColor: '#F9C6E0',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  loreModalCTAtext: {
    color: '#fff',
    fontSize: fontSizes.md,
    fontWeight: '700',
    textAlign: 'center',
  },
  loreModalClose: {
    marginTop: spacing.sm,
    padding: 6,
  },
  loreModalCloseText: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  splashBgIcon: {
    position: 'absolute',
    fontSize: 54,
    color: '#BFA6E0',
    textShadowColor: '#fff',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    zIndex: 0,
  },
  splashSubtitle: {
    fontSize: fontSizes.xl,
    color: '#B46FC2',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
    textShadowColor: '#F9C6E0',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 0.5,
  },
  splashLoadingText: {
    fontSize: fontSizes.md,
    color: '#B46FC2',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 0.5,
    opacity: 0.8,
  },
});

