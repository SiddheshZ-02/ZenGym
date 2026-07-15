import {
  createThemedStyles,
  getResHeight,
  useAdaptiveValue,
  useResponsive,
} from "@/constants/responsive";
import { useDataStore } from "@/store/dataStore";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList, RefreshControl, StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

interface ExerciseProps {
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
}

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
      width: "100%",
      maxWidth: containerMaxWidth,
      alignSelf: "center",
    },
    sectionTitle: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      backgroundColor: "#32CD32",
      borderRadius: radius.full,
      alignSelf: "center",
      marginTop: spacing.md,
      marginHorizontal: spacing.md,
    },
    sectionTitleText: {
      fontSize: fontSizes.xl,
      fontWeight: "800",
      color: "#000",
    },
    gridContent: {
      gap: spacing.md,
      paddingBottom: getResHeight(65),
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

const Exercise = ({ ListHeaderComponent }: ExerciseProps) => {
  const router = useRouter();
  const { bodyParts, loading, fetchBodyParts } = useDataStore();
  const styles = useStyles();
  const { SCREEN, containerMaxWidth } = useResponsive();
  const columns = useAdaptiveValue(2, 3);
  const [refreshing, setRefreshing] = useState(false);

  // ALL HOOKS MUST BE DEFINED BEFORE EARLY RETURNS
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBodyParts();
    setRefreshing(false);
  }, [fetchBodyParts]);

  useEffect(() => {
    fetchBodyParts();
  }, [fetchBodyParts]);

  const handleBodyPart = useCallback(
    (name: string) => {
      router.push({
        pathname: "/Screen/BodyPart/BodyPartScreen",
        params: { name },
      });
    },
    [router],
  );

  const horizontalPadding = 16;
  const availableWidth = useMemo(() => {
    return Math.min(SCREEN.width, containerMaxWidth ?? SCREEN.width);
  }, [SCREEN.width, containerMaxWidth]);

  const cardWidth = useMemo(() => {
    return (
      (availableWidth - horizontalPadding * 2 - 12 * (columns - 1)) / columns
    );
  }, [availableWidth, columns]);

  // THESE WERE AFTER EARLY RETURN BEFORE! MOVE THEM HERE:
  const FlatListHeader = useMemo(() => {
    return (
      <>
        {typeof ListHeaderComponent === "function" ? (
          <ListHeaderComponent />
        ) : (
          ListHeaderComponent
        )}
        <View style={styles.sectionShell}>
          <View style={styles.sectionTitle}>
            <Text style={styles.sectionTitleText}>Exercise</Text>
          </View>
        </View>
      </>
    );
  }, [
    ListHeaderComponent,
    styles.sectionShell,
    styles.sectionTitle,
    styles.sectionTitleText,
  ]);

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
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
            <Text style={styles.bodyPartLabel}>{item.name}</Text>
          </View>
        </TouchableOpacity>
      );
    },
    [
      styles.bodyPartTouch,
      styles.bodyPartCard,
      styles.bodyPartImage,
      styles.bodyPartLabel,
      cardWidth,
      handleBodyPart,
    ],
  );

  // NOW EARLY RETURN IS AFTER ALL HOOKS
  if (loading) {
    return (
      <View style={styles.loadingState}>
        <ActivityIndicator size="large" color="#32CD32" />
      </View>
    );
  }

  return (
    <FlatList
      data={bodyParts}
      contentContainerStyle={styles.gridContent}
      numColumns={columns}
      showsVerticalScrollIndicator={false}
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={FlatListHeader}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#32CD32"]}
          tintColor="#32CD32"
        />
      }
      renderItem={renderItem}
    />
  );
};

export default Exercise;
