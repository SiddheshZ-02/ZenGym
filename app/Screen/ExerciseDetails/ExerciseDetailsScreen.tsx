import { createThemedStyles } from "@/constants/responsive";
import { ExerciseType, useDataStore } from "@/store/dataStore";
import { showToast } from "@/utils/toast";
import { Feather, Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ---- Tune these to taste ----
const HERO_HEIGHT = 360; // expanded hero image height
const HERO_MIN_SIZE = 72; // collapsed hero image size (square, top-left)
const HEADER_TOP = 50; // top offset for the collapsed header row
const COLLAPSE_RANGE = HERO_HEIGHT - HERO_MIN_SIZE; // scroll distance over which collapse happens

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const useStyles = createThemedStyles((_, responsive) => {
  const { spacing, radius, fontSizes, ms, containerMaxWidth, isSmallPhone } =
    responsive;

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: "#32CD32",
    },
    screen: {
      flex: 1,
      backgroundColor: "#000",
    },
    centeredState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#000",
      paddingHorizontal: spacing.lg,
    },
    centeredButton: {
      marginTop: spacing.lg,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      backgroundColor: "#32CD32",
      borderRadius: radius.full,
    },
    centeredButtonText: {
      color: "#000",
      fontWeight: "700",
      fontSize: fontSizes.md,
    },

    // Top nav row (back button / add button) - always fixed, above everything
    navRow: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 30,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    headerRow: {
      paddingHorizontal: spacing.md,
      flexDirection: "row",
      gap: spacing.sm,
      alignItems: "center",
      justifyContent: "space-between",
      maxWidth: containerMaxWidth,
      alignSelf: "center",
      width: "100%",
      backgroundColor: "#32CD32",
    },
    headerButton: {
      padding: spacing.xs,
    },
    titleWrap: {
      flex: 1,
      alignItems: "center",
    },
    titlePill: {
      fontSize: isSmallPhone ? fontSizes.md : fontSizes.lg,
      fontWeight: "700",
      textAlign: "center",
      backgroundColor: "#32CD32",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
      textTransform: "capitalize",
      color: "#000",
    },
    navButton: {
      padding: spacing.xs,
      backgroundColor: "rgba(0,0,0,0.4)",
      borderRadius: radius.full,
    },

    // Animated hero image - absolutely positioned, sits above scroll content
    heroWrap: {
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 20,
      overflow: "hidden",
      backgroundColor: "#1a1a1a",
    },
    heroImage: {
      width: "100%",
      height: "100%",
      backgroundColor: "#1a1a1a",
    },

    // Title + tags inside ScrollView — scroll with the page
    expandedInfoInScroll: {
      alignItems: "center",
      paddingHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
    pageTitle: {
      fontSize: fontSizes.xxl,
      fontWeight: "bold",
      color: "#32CD32",
      textAlign: "center",
      textTransform: "capitalize",
      marginBottom: spacing.sm,
    },
    tagRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
      justifyContent: "center",
    },
    tagChip: {
      backgroundColor: "#2a2a2a",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
    },
    tagText: {
      color: "#fff",
      fontSize: fontSizes.sm,
    },
    tagHighlight: {
      color: "#32CD32",
      fontWeight: "600",
    },

    // Compact card that slides in to the right of the shrunk hero image
    compactCard: {
      position: "absolute",
      left: HERO_MIN_SIZE + 30,
      right: 12,
      top: HEADER_TOP,
      height: HERO_MIN_SIZE,
      zIndex: 20,
      backgroundColor: "black",
      borderRadius: radius.lg,
      paddingHorizontal: spacing.md,
      justifyContent: "center",
      gap: 2,
    },
    compactCard1: {
      position: "relative",
      left: HERO_MIN_SIZE - 72,
      right: 12,
      height: HERO_MIN_SIZE + 20,
      backgroundColor: "#1a1a1a",
      borderRadius: radius.lg,
      paddingHorizontal: spacing.md,
      justifyContent: "center",
      gap: 2,
    },
    compactTitle: {
      fontSize: fontSizes.md,
      fontWeight: "700",
      color: "#32CD32",
      textTransform: "capitalize",
    },
    compactSubtitle: {
      fontSize: fontSizes.xs ?? 12,
      color: "#ccc",
    },

    // Scrollable content
    scrollContent: {
      paddingHorizontal: spacing.md,
      paddingBottom: 60,
      alignSelf: "center",
      width: "100%",
      maxWidth: containerMaxWidth,
    },
    contentStack: {
      gap: spacing.md,
    },
    infoCard: {
      backgroundColor: "#1a1a1a",
      padding: spacing.md,
      borderRadius: radius.lg,
      gap: spacing.xs,
    },
    infoTitle: {
      fontSize: fontSizes.lg,
      fontWeight: "600",
      color: "#32CD32",
      marginBottom: spacing.xs,
    },
    infoBody: {
      fontSize: fontSizes.md,
      color: "white",
      lineHeight: ms(24),
    },
    instructionRow: {
      flexDirection: "row",
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    instructionIndex: {
      fontSize: fontSizes.md,
      color: "#32CD32",
      fontWeight: "bold",
      minWidth: 20,
    },
    instructionText: {
      fontSize: fontSizes.md,
      color: "white",
      flex: 1,
      lineHeight: ms(24),
    },
    modalContainer: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.7)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: "#1a1a1a",
      borderRadius: radius.lg,
      padding: spacing.xl,
      width: "85%",
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: fontSizes.xl,
      fontWeight: "bold",
      color: "#fff",
      textAlign: "center",
      marginBottom: spacing.lg,
    },
    dayButton: {
      padding: spacing.md,
      backgroundColor: "#2a2a2a",
      borderRadius: radius.md,
      marginBottom: spacing.sm,
      alignItems: "center",
    },
    dayButtonText: {
      fontSize: fontSizes.md,
      color: "#fff",
    },
    closeModalButton: {
      padding: spacing.md,
      backgroundColor: "#444",
      borderRadius: radius.md,
      marginTop: spacing.md,
      alignItems: "center",
    },
    closeModalButtonText: {
      fontSize: fontSizes.md,
      color: "#fff",
    },
  });
});

const ExerciseDetailsScreen = () => {
  const [info, setInfo] = useState<ExerciseType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState(false);

  const router = useRouter();
  const { exercisesDetails } = useLocalSearchParams();
  const { workoutList, addExerciseToWorkout, fetchExerciseById } =
    useDataStore();
  const styles = useStyles();

  const [isGifPlaying, setIsGifPlaying] = useState(true);

  const GIF_STOP_THRESHOLD = COLLAPSE_RANGE * 0.55;
  const GIF_RESUME_THRESHOLD = COLLAPSE_RANGE * 0.35;

  // Drives every collapse animation
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const id = scrollY.addListener(({ value }) => {
      if (value >= GIF_STOP_THRESHOLD)
        setIsGifPlaying((prev) => (prev ? false : prev));
      else if (value <= GIF_RESUME_THRESHOLD)
        setIsGifPlaying((prev) => (!prev ? true : prev));
    });
    return () => scrollY.removeListener(id);
  }, [scrollY]);

  const loadExercise = async () => {
    if (!exercisesDetails) return;

    setLoading(true);
    try {
      const id = Number(exercisesDetails);
      const exercise = await fetchExerciseById(id);
      setInfo(exercise);
    } catch (error) {
      console.error("Error loading exercise:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExercise();
  }, [exercisesDetails]);

  const handleAddExercises = () => {
    if (!info) return;

    if (workoutList.some((item) => item.id === info.id)) {
      showToast("info", "This exercise is already in your workout list!");
      return;
    }

    setModalVisible(true);
  };

  const selectDayAndAdd = async (day: string) => {
    if (!info) return;

    await addExerciseToWorkout(info, day);
    showToast("success", `Exercise added to ${day}!`);
    setModalVisible(false);
  };

  const isExerciseInList = info
    ? workoutList.some((item: any) => item.id === info.id)
    : false;

  if (loading) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color="#32CD32" />
      </View>
    );
  }

  if (!info) {
    return (
      <View style={styles.centeredState}>
        <Text style={{ color: "white", fontSize: 18 }}>
          Exercise not found!
        </Text>
        <TouchableOpacity
          style={styles.centeredButton}
          onPress={() => router.back()}
        >
          <Text style={styles.centeredButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ----- Interpolations -----

  // Hero image: size shrinks from full width/height down to a small square,
  // and moves to top-left corner (HEADER_TOP / left margin).
  const heroSize = scrollY.interpolate({
    inputRange: [0, COLLAPSE_RANGE],
    outputRange: [SCREEN_WIDTH - 32, HERO_MIN_SIZE],
    extrapolate: "clamp",
  });

  const heroTop = scrollY.interpolate({
    inputRange: [0, COLLAPSE_RANGE],
    outputRange: [HERO_HEIGHT > 0 ? 100 : 0, HEADER_TOP],
    extrapolate: "clamp",
  });

  const heroLeft = scrollY.interpolate({
    inputRange: [0, COLLAPSE_RANGE],
    outputRange: [16, 16],
    extrapolate: "clamp",
  });

  const heroRadius = scrollY.interpolate({
    inputRange: [0, COLLAPSE_RANGE],
    outputRange: [24, 16],
    extrapolate: "clamp",
  });

  // Compact card (name/category/difficulty/target) next to the shrunk image
  const compactCardOpacity = scrollY.interpolate({
    inputRange: [COLLAPSE_RANGE * 0.5, COLLAPSE_RANGE],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const compactCardTranslateX = scrollY.interpolate({
    inputRange: [COLLAPSE_RANGE * 0.5, COLLAPSE_RANGE],
    outputRange: [30, 0],
    extrapolate: "clamp",
  });
  const compactCardTranslateY = scrollY.interpolate({
    inputRange: [COLLAPSE_RANGE * 0.5, COLLAPSE_RANGE],
    outputRange: [-80, 0],
    extrapolate: "clamp",
  });

  // How much top padding the scroll content needs so it starts right
  // below the fully expanded hero (title/tags are inside scroll content).
  const scrollContentTopPadding = 100 + (SCREEN_WIDTH - 32) - 100;

  return (
    <SafeAreaView style={styles.safeArea}>
   
      <View style={styles.screen}>
        {/* Fixed nav row, always on top */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <Feather name="chevron-left" size={28} color="black" />
          </TouchableOpacity>

          <View style={styles.titleWrap}>
            <Text style={styles.titlePill} numberOfLines={2}>
              {info.name}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleAddExercises}
            style={[
              styles.headerButton,
              { opacity: isExerciseInList ? 0.5 : 1 },
            ]}
            disabled={isExerciseInList}
          >
            <MaterialIcons
              name={isExerciseInList ? "check-circle" : "add-circle-outline"}
              size={28}
              color={isExerciseInList ? "black" : "black"}
            />
          </TouchableOpacity>
        </View>

        {/* Animated collapsing hero image */}
        <Animated.View
          style={[
            styles.heroWrap,
            {
              width: heroSize,
              height: heroSize,
              top: heroTop,
              left: heroLeft,
              borderRadius: heroRadius,
            },
          ]}
        >
          <Image
            source={
              info.gif_url
                ? { uri: info.gif_url }
                : "https://placehold.co/380x380/32CD32/000?text=" +
                  encodeURIComponent(info.name)
            }
            style={styles.heroImage}
            contentFit="cover"
            autoplay={isGifPlaying}
            placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}
            transition={500}
            cachePolicy="memory-disk"
          />
        </Animated.View>

        {/* Compact card that slides in next to the shrunk hero */}
        <Animated.View
          style={[
            styles.compactCard,
            {
              opacity: compactCardOpacity,
              transform: [{ translateX: compactCardTranslateX }],
            },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.compactTitle} numberOfLines={1}>
            {info.name}
          </Text>
          <Text style={styles.compactSubtitle} numberOfLines={1}>
            {[info.category, info.difficulty, info.target]
              .filter(Boolean)
              .join(" • ")}
          </Text>
        </Animated.View>
        {/* Compact card that slides in next to the shrunk hero */}
        <Animated.View
          style={[
            styles.compactCard1,
            {
              opacity: compactCardOpacity,
              transform: [{ translateX: compactCardTranslateY }],
            },
          ]}
          pointerEvents="none"
        ></Animated.View>

        {/* Scrollable content: info, equipment, description, instructions */}
        <Animated.ScrollView
          style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: scrollContentTopPadding },
          ]}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false },
          
          )}
        >
          <View style={styles.contentStack}>
            <View style={styles.expandedInfoInScroll}>
              <Text style={styles.pageTitle}>{info.name}</Text>
              <View style={styles.tagRow}>
                {info.category && (
                  <View style={styles.tagChip}>
                    <Text style={styles.tagText}>
                      Category:{" "}
                      <Text style={styles.tagHighlight}>{info.category}</Text>
                    </Text>
                  </View>
                )}
                {info.difficulty && (
                  <View style={styles.tagChip}>
                    <Text style={styles.tagText}>
                      Difficulty:{" "}
                      <Text style={styles.tagHighlight}>{info.difficulty}</Text>
                    </Text>
                  </View>
                )}
                {info.target && (
                  <View style={styles.tagChip}>
                    <Text style={styles.tagText}>
                      Target:{" "}
                      <Text style={styles.tagHighlight}>{info.target}</Text>
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {info.equipment && (
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Equipment Needed</Text>
                <Text style={styles.infoBody}>{info.equipment}</Text>
              </View>
            )}

            {info.description && (
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Description</Text>
                <Text style={styles.infoBody}>{info.description}</Text>
              </View>
            )}

            {info.instructions && Array.isArray(info.instructions) && (
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Instructions</Text>
                {info.instructions.map((instruction, index) => (
                  <View key={index} style={styles.instructionRow}>
                    <Text style={styles.instructionIndex}>{index + 1}.</Text>
                    <Text style={styles.instructionText}>{instruction}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </Animated.ScrollView>
      </View>

      {/* Day Picker Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select a Day</Text>
            {DAYS_OF_WEEK.map((day) => (
              <TouchableOpacity
                key={day}
                style={styles.dayButton}
                onPress={() => selectDayAndAdd(day)}
              >
                <Text style={styles.dayButtonText}>{day}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ExerciseDetailsScreen;
