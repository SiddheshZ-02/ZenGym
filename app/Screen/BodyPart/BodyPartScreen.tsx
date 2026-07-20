import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import PremiumUnlockModal from "@/components/PremiumUnlockModal";
import { createThemedStyles } from "@/constants/responsive";
import { ExerciseType, useDataStore } from "@/store/dataStore";
import { Feather, Fontisto, MaterialCommunityIcons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Image } from "expo-image";

// ====================== COUNTDOWN ======================
const CountdownTimer = React.memo(({ expiry }: { expiry: number }) => {
  const [timeLeft, setTimeLeft] = useState(expiry - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = expiry - Date.now();
      setTimeLeft(Math.max(0, remaining));
      if (remaining <= 0) clearInterval(interval);
    }, 30000);

    return () => clearInterval(interval);
  }, [expiry]);

  const formatted = useMemo(() => formatRemaining(timeLeft), [timeLeft]);

  return (
    <Text style={{ color: "#32CD32", fontWeight: "700", fontSize: 13 }}>
      {formatted}
    </Text>
  );
});

// ====================== MAIN SCREEN ======================
const BodyPartScreen = () => {
  const [filteredParts, setFilteredParts] = useState<ExerciseType[]>([]);
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [unlockMap, setUnlockMap] = useState<Record<number, number>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPremium, setSelectedPremium] = useState<ExerciseType | null>(
    null,
  );

  const router = useRouter();
  const { name } = useLocalSearchParams();
  const { exercises, loading, fetchExercises } = useDataStore();
  const styles = useStyles();

  // Load unlocks
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("premium_unlocks");
        if (raw) setUnlockMap(JSON.parse(raw));
      } catch (e) {
        console.error("Failed to load unlocks:", e);
      }
    })();
  }, []);

  // Fetch data
  useEffect(() => {
    if (name) fetchExercises(name as string);
  }, [name, fetchExercises]);

  // Search + Sort
  useEffect(() => {
    let sorted = [...exercises].sort(
      (a, b) =>
        getDifficultyOrder(a.difficulty) - getDifficultyOrder(b.difficulty),
    );

    if (!searchText.trim()) {
      setFilteredParts(sorted);
      return;
    }

    const search = searchText.toLowerCase();
    const filtered = sorted.filter((item) =>
      [item.name, item.body_part, item.target].some((field) =>
        field?.toLowerCase().includes(search),
      ),
    );
    setFilteredParts(filtered);
  }, [searchText, exercises]);

  const handleDetails = useCallback(
    (item: ExerciseType) => {
      const expiry = unlockMap[item.id];
      const now = Date.now();

      if (isPremiumDifficulty(item.difficulty) && (!expiry || expiry <= now)) {
        setSelectedPremium(item);
        setModalVisible(true);
        return;
      }

      router.push({
        pathname: "/Screen/ExerciseDetails/ExerciseDetailsScreen",
        params: { exercisesDetails: item.id },
      });
    },
    [unlockMap, router],
  );

  const startUnlock = useCallback(
    async (item: ExerciseType) => {
      const expiry = Date.now() + 60 * 60 * 1000;
      const nextMap = { ...unlockMap, [item.id]: expiry };

      setUnlockMap(nextMap);
      await AsyncStorage.setItem("premium_unlocks", JSON.stringify(nextMap));
      setModalVisible(false);
    },
    [unlockMap],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (name) await fetchExercises(name as string);
    setRefreshing(false);
  }, [name, fetchExercises]);

  const renderItem = useCallback(
    ({ item }: { item: ExerciseType }) => {
      const premium = isPremiumDifficulty(item.difficulty);
      return premium ? (
        <PremiumCard
          item={item}
          onPress={handleDetails}
          unlockMap={unlockMap}
          styles={styles}
        />
      ) : (
        <RegularCard item={item} onPress={handleDetails} styles={styles} />
      );
    },
    [handleDetails, unlockMap, styles],
  );

  if (loading) {
    return (
      <View style={styles.emptyState}>
        <ActivityIndicator size="large" color="#32CD32" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.headingContainerRow}>
          <Text style={styles.headingTextWithBack}>{name}</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Feather name="chevron-left" size={30} color="#32CD32" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBarContainer}>
          <View style={styles.searchBarInner}>
            <Feather
              name="search"
              size={22}
              color="#32CD32"
              style={{ marginRight: 8 }}
            />
            <TextInput
              placeholder="Search by name, body part, or target..."
              placeholderTextColor="#888"
              value={searchText}
              onChangeText={setSearchText}
              style={styles.searchInput}
            />
          </View>
        </View>

        <FlatList
          data={filteredParts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#32CD32"]}
            />
          }
          removeClippedSubviews={true}
          windowSize={10}
          maxToRenderPerBatch={8}
        />
      </View>

      <PremiumUnlockModal
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        onWatch={() => selectedPremium && startUnlock(selectedPremium)}
      />
    </SafeAreaView>
  );
};

// ====================== MEMOIZED CARDS ======================
const PremiumCard = React.memo(
  ({
    item,
    onPress,
    unlockMap,
    styles,
  }: {
    item: ExerciseType;
    onPress: (item: ExerciseType) => void;
    unlockMap: Record<number, number>;
    styles: any;
  }) => {
    const isUnlocked = unlockMap[item.id] && unlockMap[item.id] > Date.now();

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onPress(item)}
        style={styles.premiumCardWrap}
      >
        <LinearGradient
          colors={["#0a1f0a", "#173617", "#112b11"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.premiumCard}
        >
          {renderImage(item, true, styles)}
          {renderCardInfo(item, true, styles, unlockMap)}

          {isUnlocked && (
            <View style={{ position: "absolute", right: 12, bottom: 12 }}>
              <CountdownTimer expiry={unlockMap[item.id]} />
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  },
);

const RegularCard = React.memo(
  ({
    item,
    onPress,
    styles,
  }: {
    item: ExerciseType;
    onPress: (item: ExerciseType) => void;
    styles: any;
  }) => (
    <TouchableOpacity
      style={styles.rowCard}
      onPress={() => onPress(item)}
      activeOpacity={0.9}
    >
      {renderImage(item, false, styles)}
      {renderCardInfo(item, false, styles)}
      <View style={styles.chevronWrap}>
        <Feather name="chevron-right" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  ),
);

// ====================== IMAGE & INFO HELPERS ======================
const renderImage = (item: ExerciseType, premium: boolean, styles: any) => (
  <View style={premium ? styles.rowImageWrapPremium : styles.rowImageWrap}>
    <Image
      source={
        item.gif_url
          ? { uri: item.gif_url }
          : `https://placehold.co/70x70/32CD32/000?text=${encodeURIComponent(item.name)}`
      }
      style={premium ? styles.rowImagePremium : styles.rowImage}
      autoplay={false}
      contentFit="cover"
      placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}
      transition={200}
      cachePolicy="memory-disk"
    />
  </View>
);

const renderCardInfo = (
  item: ExerciseType,
  premium: boolean,
  styles: any,
  unlockMap?: Record<number, number>,
) => (
  <View style={styles.cardInfo}>
    <View style={styles.cardTopRow}>
      <Text style={styles.rowName} numberOfLines={2}>
        {item.name}
      </Text>
      {premium && (
        <View style={styles.premiumBadge}>
          <MaterialCommunityIcons name="crown" size={16} color="#32CD32" />
          <Text style={styles.premiumBadgeText}>PREMIUM</Text>
        </View>
      )}
    </View>

    <View style={styles.cardTopRow}>
      {!!item.difficulty && (
        <Text style={styles.rowBodyPart}>{item.difficulty}</Text>
      )}
      {premium &&
        (unlockMap?.[item.id] && unlockMap[item.id] > Date.now() ? (
          <View style={styles.chevronWrap}>
            <Feather name="chevron-right" size={18} color="#32CD32" />
          </View>
        ) : (
          <View style={styles.chevronWrap}>
            <Fontisto name="locked" size={18} color="#32CD32" />
          </View>
        ))}
    </View>

    {!!item.target && (
      <Text style={styles.rowTarget}>Target: {item.target}</Text>
    )}
  </View>
);

// ====================== STYLES ======================
const useStyles = createThemedStyles((_, responsive) => {
  const {
    spacing,
    radius,
    fontSizes,
    wp,
    ms,
    isSmallPhone,
    containerMaxWidth,
  } = responsive;

  // Reduced image size for smaller cards
  const imageSize = isSmallPhone ? wp(48) : wp(55);

  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#000" },
    screen: { flex: 1, backgroundColor: "#000" },
    headingContainerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.xs,
    },
    backBtn: {
      position: "absolute",
      left: spacing.md,
      padding: spacing.xs,
      zIndex: 1,
    },
    headingTextWithBack: {
      fontSize: isSmallPhone ? fontSizes.lg : fontSizes.xl,
      fontWeight: "800",
      textTransform: "capitalize",
      backgroundColor: "#000",
      width: "100%",
      textAlign: "center",
      padding: spacing.sm,
      color: "#32CD32",
    },
    searchBarContainer: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
      zIndex: 10,
    },
    searchBarInner: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#222",
      borderRadius: radius.lg,
      paddingHorizontal: spacing.md,
      height: ms(44),
    },
    searchInput: { flex: 1, color: "#fff", fontSize: fontSizes.md },

    listContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xl,
      alignSelf: "center",
      width: "100%",
      maxWidth: containerMaxWidth,
    },

    // Regular Card - Smaller
    rowCard: {
      flexDirection: "row",
      backgroundColor: "#1a1a1a",
      borderRadius: radius.lg,
      padding: spacing.sm, // Reduced padding
      marginBottom: spacing.md,
      alignItems: "center",
    },

    // Premium Card - Smaller
    premiumCardWrap: {
      borderRadius: radius.lg,
      marginBottom: spacing.md,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "rgba(50, 205, 50, 0.6)",
      shadowColor: "#32CD32",
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 6,
    },
    premiumCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.sm, // Reduced padding
    },

    rowImageWrap: {
      width: imageSize,
      height: imageSize,
      borderRadius: radius.md,
      overflow: "hidden",
      marginRight: spacing.md,
    },
    rowImageWrapPremium: {
      width: imageSize,
      height: imageSize,
      borderRadius: radius.md,
      overflow: "hidden",
      marginRight: spacing.md,
      backgroundColor: "#fff",
      padding: 4,
    },
    rowImage: { width: "100%", height: "100%", backgroundColor: "#1a1a1a" },
    rowImagePremium: { width: "100%", height: "100%", borderRadius: radius.sm },

    cardInfo: { flex: 1 },
    cardTopRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },
    rowName: {
      fontSize: fontSizes.md,
      fontWeight: "700",
      color: "#fff",
      marginBottom: spacing.xxs,
      flex: 1,
    },
    premiumBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
    premiumBadgeText: {
      fontSize: fontSizes.xs,
      fontWeight: "800",
      color: "#32CD32",
    },
    rowBodyPart: {
      fontSize: fontSizes.sm,
      color: "#32CD32",
      fontWeight: "600",
      marginBottom: spacing.xxs,
    },
    rowTarget: { fontSize: fontSizes.sm, color: "#999" },
    chevronWrap: { alignItems: "center", marginRight: spacing.lg },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#000",
    },
  });
});

const getDifficultyOrder = (difficulty?: string) => {
  switch (difficulty?.toLowerCase()) {
    case "beginner":
      return 1;
    case "intermediate":
      return 2;
    case "advanced":
      return 3;
    default:
      return 4;
  }
};

const isPremiumDifficulty = (difficulty?: string) => {
  const d = difficulty?.toLowerCase();
  return d === "intermediate" || d === "advanced";
};

function formatRemaining(ms: number) {
  if (ms <= 0) return "0:00";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}min`;
}

export default BodyPartScreen;
