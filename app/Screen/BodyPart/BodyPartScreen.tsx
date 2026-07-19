import { createThemedStyles, getResWidth } from "@/constants/responsive";
import { ExerciseType, useDataStore } from "@/store/dataStore";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  View,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

  const imageSize = isSmallPhone ? wp(58) : wp(70);

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: "#000",
    },
    screen: {
      flex: 1,
      backgroundColor: "#000",
    },
    contentShell: {
      flex: 1,
      width: "100%",
      alignSelf: "center",
      maxWidth: containerMaxWidth,
    },
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
    searchInput: {
      flex: 1,
      color: "#fff",
      fontSize: fontSizes.md,
      paddingVertical: 0,
      paddingHorizontal: 0,
      backgroundColor: "transparent",
    },
    listContainer: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xl,
      alignSelf: "center",
      width: "100%",
      maxWidth: containerMaxWidth,
    },

    // --- Standard (Beginner) card ---
    rowCard: {
      flexDirection: "row",
      backgroundColor: "#1a1a1a",
      borderRadius: radius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      alignItems: "center",
    },

    // --- Premium (Intermediate / Advanced) card ---
    premiumCardWrap: {
      borderRadius: radius.lg,
      marginBottom: spacing.md,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "rgba(50, 205, 50, 0.55)",
      shadowColor: "#32CD32",
      shadowOpacity: 0.35,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 0 },
      elevation: 4,
    },
    premiumCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.md,
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
    rowImage: {
      width: "100%",
      height: "100%",
      backgroundColor: "#1a1a1a",
    },
    rowImagePremium: {
      width: "100%",
      height: "100%",
      borderRadius: radius.sm,
    },

    cardInfo: {
      flex: 1,
    },
    cardTopRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },
    rowName: {
      fontSize: fontSizes.md,
      fontWeight: "700",
      color: "#fff",
      textTransform: "capitalize",
      marginBottom: spacing.xxs,
      flex: 1,
      paddingRight: spacing.xs,
    },
    premiumBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    premiumBadgeText: {
      fontSize: fontSizes.xs,
      fontWeight: "800",
      color: "#32CD32",
      letterSpacing: 0.5,
    },
    rowBodyPart: {
      fontSize: fontSizes.sm,
      color: "#32CD32",
      fontWeight: "600",
      marginBottom: spacing.xxs,
      textTransform: "capitalize",
    },
    rowTarget: {
      fontSize: fontSizes.sm,
      color: "#999",
      textTransform: "capitalize",
    },
    chevronWrap: {
      justifyContent: "flex-end",
      alignItems: "center",
      paddingLeft: spacing.xs,
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#000",
    },
  });
});

const BodyPartScreen = () => {
  const [filteredParts, setFilteredParts] = useState<ExerciseType[]>([]);
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();
  const { name } = useLocalSearchParams();
  const { exercises, loading, fetchExercises } = useDataStore();
  const styles = useStyles();

  const onRefresh = async () => {
    setRefreshing(true);
    if (name) {
      await fetchExercises(name as string);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    if (name) {
      fetchExercises(name as string);
    }
  }, [name, fetchExercises]);

  useEffect(() => {
    setFilteredParts(exercises);
  }, [exercises]);

  // Sort order: Beginner first, then Intermediate, then Advanced
  const getDifficultyOrder = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case "beginner":
        return 1;
      case "intermediate":
        return 2;
      case "advanced":
        return 3;
      default:
        return 4; // Put unknown difficulties at the end
    }
  };

  // Premium styling only applies to Intermediate / Advanced exercises
  const isPremiumDifficulty = (difficulty?: string) => {
    const d = difficulty?.toLowerCase();
    return d === "intermediate" || d === "advanced";
  };

  useEffect(() => {
    let sortedExercises = [...exercises];

    // Sort by difficulty
    sortedExercises.sort((a, b) => {
      return getDifficultyOrder(a.difficulty) - getDifficultyOrder(b.difficulty);
    });

    if (searchText.trim() === "") {
      setFilteredParts(sortedExercises);
      return;
    }

    const filtered = sortedExercises.filter((item) => {
      const search = searchText.toLowerCase();
      const itemName = item.name || "";
      const itemBodyPart = item.body_part || "";
      const itemTarget = item.target || "";

      return (
        itemName.toLowerCase().includes(search) ||
        itemBodyPart.toLowerCase().includes(search) ||
        itemTarget.toLowerCase().includes(search)
      );
    });

    setFilteredParts(filtered);
  }, [searchText, exercises]);

  const handleDetails = (id: number) => {
    router.push({
      pathname: "/Screen/ExerciseDetails/ExerciseDetailsScreen",
      params: { exercisesDetails: id },
    });
  };

  if (loading) {
    return (
      <View style={styles.emptyState}>
        <ActivityIndicator size="large" color="#32CD32" />
      </View>
    );
  }

  const renderImage = (item: ExerciseType, premium: boolean) => (
    <View style={premium ? styles.rowImageWrapPremium : styles.rowImageWrap}>
      <Image
        source={
          item.gif_url
            ? { uri: item.gif_url }
            : "https://placehold.co/70x70/32CD32/000?text=" +
              encodeURIComponent(item.name)
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

  const renderCardInfo = (item: ExerciseType, premium: boolean) => (
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
      {!!item.difficulty && (
        <Text style={styles.rowBodyPart}>{item.difficulty}</Text>
      )}
      {!!item.target && (
        <Text style={styles.rowTarget}>Target: {item.target}</Text>
      )}
    </View>
  );

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

        <View style={styles.listContainer}>
          <FlatList
            data={filteredParts}
            contentContainerStyle={styles.listContent}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#32CD32"]}
                tintColor="#32CD32"
              />
            }
            renderItem={({ item }) => {
              const premium = isPremiumDifficulty(item.difficulty);

              if (premium) {
                return (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => handleDetails(item.id)}
                    style={styles.premiumCardWrap}
                  >
                    <LinearGradient
                      colors={["#173617", "#0a140a", "#000000"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.premiumCard}
                    >
                      {renderImage(item, true)}
                      {renderCardInfo(item, true)}
                      <View style={styles.chevronWrap}>
                        <AntDesign name="right" size={18} color="#32CD32" />
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  style={styles.rowCard}
                  onPress={() => handleDetails(item.id)}
                >
                  {renderImage(item, false)}
                  {renderCardInfo(item, false)}
                  <AntDesign name="right" size={18} color="#666" />
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default BodyPartScreen;