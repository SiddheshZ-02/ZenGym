import { createThemedStyles, useAdaptiveValue, useResponsive } from "@/constants/responsive";
import { useDataStore } from "@/store/dataStore";
import { LegendList } from "@legendapp/list";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const useStyles = createThemedStyles((_, responsive) => {
  const { spacing, radius, fontSizes, ms, wp, containerMaxWidth } = responsive;

  return StyleSheet.create({
    loadingState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#000",
    },
    sectionShell: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xl,
      width: "100%",
      maxWidth: containerMaxWidth,
      alignSelf: "center",
    },
    sectionTitle: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      backgroundColor: "#32CD32",
      borderRadius: radius.full,
      alignSelf: "flex-start",
      marginBottom: spacing.md,
    },
    sectionTitleText: {
      fontSize: fontSizes.xl,
      fontWeight: "800",
      color: "#000",
    },
    gridContent: {
      gap: spacing.md,
      paddingBottom: spacing.xl,
    },
    bodyPartCard: {
      flex: 1,
      aspectRatio: 1,
      borderRadius: radius.xl,
      overflow: "hidden",
      backgroundColor: "#1a1a1a",
    },
    bodyPartImage: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "#1a1a1a",
    },
bodyPartLabel: {
  position: "absolute",
  left: spacing.sm,
  bottom: spacing.sm,
  alignSelf: "flex-start",
  color: "black",
  fontSize: fontSizes.md,
  fontWeight: "800",
  backgroundColor: "#32CD32",
  borderRadius: radius.lg,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  textTransform: "capitalize",
  overflow: "hidden",
},
    bodyPartTouch: {
      flex: 1,
      margin: spacing.xs,
      minHeight: ms(170),
    },
  });
});

const Exercise = () => {
  const router = useRouter();
  const { bodyParts, loading, fetchBodyParts } = useDataStore();
  const styles = useStyles();
  const { SCREEN, containerMaxWidth } = useResponsive();
  const columns = useAdaptiveValue(2, 3);

  useEffect(() => {
    fetchBodyParts();
  }, [fetchBodyParts]);

  const handleBodyPart = (name: string) => {
    router.push({
      pathname: "/Screen/BodyPart/BodyPartScreen",
      params: { name },
    });
  };

  const horizontalPadding = 16;
  const availableWidth = Math.min(
    SCREEN.width,
    containerMaxWidth ?? SCREEN.width,
  );
  const cardWidth =
    (availableWidth - horizontalPadding * 2 - 12 * (columns - 1)) / columns;

  if (loading) {
    return (
      <View style={styles.loadingState}>
        <ActivityIndicator size="large" color="#32CD32" />
      </View>
    );
  }

  return (
    <View style={styles.sectionShell}>
      <View style={styles.sectionTitle}>
        <Text style={styles.sectionTitleText}>Exercise</Text>
      </View>

      <LegendList
        data={bodyParts}
        contentContainerStyle={styles.gridContent}
        numColumns={columns}
        recycleItems
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const imageSource = item.image_url
            ? { uri: item.image_url }
            : {
                uri:
                  "https://placehold.co/180x180/32CD32/000?text=" +
                  encodeURIComponent(item.name),
              };

          return (
            <TouchableOpacity
              style={[styles.bodyPartTouch, { width: cardWidth }]}
              onPress={() => handleBodyPart(item?.name)}
            >
              <View style={styles.bodyPartCard}>
                <Image
                  source={imageSource}
                  style={styles.bodyPartImage}
                  placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}
                  transition={300}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />
                <Text style={styles.bodyPartLabel} >
                  {item.name}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

export default Exercise;
