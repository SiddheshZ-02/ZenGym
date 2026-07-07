import { createThemedStyles } from "@/constants/responsive";
import { ExerciseType, useDataStore } from "@/store/dataStore";
import { showToast } from "@/utils/toast";
import { Entypo, Feather } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const useStyles = createThemedStyles((_, responsive) => {
  const {
    spacing,
    radius,
    fontSizes,
    ms,
    hp,
    wp,
    isSmallPhone,
    containerMaxWidth,
  } = responsive;

  const heroHeight = isSmallPhone ? hp(300) : hp(360);
  const headerIconSize = isSmallPhone ? ms(36) : ms(40);

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: "#000",
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
    heroImageShell: {
      height: heroHeight,
      overflow: "hidden",
      borderRadius: radius.xl,
      marginHorizontal: spacing.md,
      marginTop: spacing.sm,
      alignSelf: "center",
      width: "100%",
      maxWidth: containerMaxWidth,
    },
    heroImage: {
      height: "100%",
      width: "100%",
      backgroundColor: "#1a1a1a",
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xxl,
      alignSelf: "center",
      width: "100%",
      maxWidth: containerMaxWidth,
    },
    contentStack: {
      gap: spacing.md,
    },
    pageTitle: {
      fontSize: isSmallPhone ? fontSizes.xl : fontSizes.xxl,
      fontWeight: "bold",
      color: "#32CD32",
      textAlign: "center",
      textTransform: "capitalize",
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
      minWidth: wp(20),
    },
    instructionText: {
      fontSize: fontSizes.md,
      color: "white",
      flex: 1,
      lineHeight: ms(24),
    },
  });
});

const ExerciseDetailsScreen = () => {
  const [info, setInfo] = useState<ExerciseType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const router = useRouter();
  const { exercisesDetails } = useLocalSearchParams();
  const { workoutList, addExerciseToWorkout, fetchExerciseById } =
    useDataStore();
  const styles = useStyles();

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

  const handleAddExercises = async () => {
    if (!info) return;

    if (workoutList.some((item) => item.id === info.id)) {
      showToast("info", "This exercise is already in your workout list!");
      return;
    }

    await addExerciseToWorkout(info);
    showToast("success", "Exercise has been added successfully!");
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#32CD32" barStyle="dark-content" />

      <View style={styles.screen}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
              <Feather name="chevron-left" size={28} color="black" />
          </TouchableOpacity>

          <View style={styles.titleWrap}>
            <Text style={styles.titlePill} numberOfLines={2}>
              {info.name}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleAddExercises}
            style={[styles.headerButton, { opacity: isExerciseInList ? 0.5 : 1 }]}
            disabled={isExerciseInList}
          >
            <MaterialIcons
              name={isExerciseInList ? "check-circle" : "add-circle-outline"}
              size={28}
              color={isExerciseInList ? "black" : "black"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.heroImageShell}>
          <Image
            source={
              info.gif_url
                ? { uri: info.gif_url }
                : "https://placehold.co/380x380/32CD32/000?text=" +
                  encodeURIComponent(info.name)
            }
            style={styles.heroImage}
            contentFit="cover"
            autoplay
            placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}
            transition={500}
            cachePolicy="memory-disk"
          />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.contentStack}>
            <Text style={styles.pageTitle}>{info.name}</Text>

            <View style={styles.tagRow}>
              {info.category && (
                <View style={styles.tagChip}>
                  <Text style={styles.tagText}>
                    Category: <Text style={styles.tagHighlight}>{info.category}</Text>
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
                    Target: <Text style={styles.tagHighlight}>{info.target}</Text>
                  </Text>
                </View>
              )}
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
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ExerciseDetailsScreen;
