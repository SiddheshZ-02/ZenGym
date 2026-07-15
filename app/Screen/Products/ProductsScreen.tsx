import { createThemedStyles } from "@/constants/responsive";
import { supabase } from "@/services/supabaseClient";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SlideItem {
  id: number;
  source: { uri: string } | number;
  linkUrl?: string;
}

const useStyles = createThemedStyles((_, responsive) => {
  const {
    spacing,
    radius,
    fontSizes,
    hp,
    SCREEN,
    containerMaxWidth,
    isSmallPhone,
  } = responsive;
  const slideWidth = Math.min(
    SCREEN.width - spacing.md * 2,
    containerMaxWidth ?? SCREEN.width - spacing.md * 2,
  );

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: "#32CD32",
    },
    screen: {
      flex: 1,
      backgroundColor: "#000",
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
      backgroundColor: "#32CD32",
      width: "100%",
      textAlign: "center",
      paddingVertical: spacing.sm,
      color: "#000",
    },
    contentShell: {
      flex: 1,
      width: "100%",
      alignSelf: "center",
      maxWidth: containerMaxWidth,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    slideWrap: {
      alignItems: "center",
      paddingVertical: spacing.sm,
    },
    slideImage: {
      height: Math.max(hp(200), 180),
      width: slideWidth,
      resizeMode: "cover",
      borderRadius: radius.xl,
      backgroundColor: "black",
    },
    loadingWrap: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#000",
    },
  });
});

const ProductsScreen = () => {
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [loading, setLoading] = useState(true);
  const styles = useStyles();
  const router = useRouter();

  const fetchSlides = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("carousel_slides")
        .select("id, title, image_url, sort_order, link_url")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true });

      if (error) throw error;

      if (data?.length) {
        setSlides(
          data.map((slide) => ({
            id: slide.id,
            source: { uri: slide.image_url },
            linkUrl: slide.link_url,
          })),
        );
      }
    } catch (error) {
      console.error("Error fetching carousel slides:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  const handleSlidePress = useCallback(async (linkUrl?: string) => {
    if (linkUrl) {
      let cleanedUrl = linkUrl.replace(/`/g, "").trim();
      if (
        !cleanedUrl.startsWith("http://") &&
        !cleanedUrl.startsWith("https://")
      ) {
        cleanedUrl = "https://" + cleanedUrl;
      }
      try {
        await Linking.openURL(cleanedUrl);
      } catch (error) {
        console.error("Error opening URL:", error, cleanedUrl);
      }
    }
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: SlideItem }) => (
      <View style={styles.slideWrap}>
        <TouchableOpacity
          onPress={() => handleSlidePress(item.linkUrl)}
          style={styles.slideImage}
        >
          <Image source={item.source} style={styles.slideImage} />
        </TouchableOpacity>
      </View>
    ),
    [styles.slideWrap, styles.slideImage, handleSlidePress],
  );

  const ListContent = useMemo(
    () => (
      <>
        <View style={styles.headingContainerRow}>
          <Text style={styles.headingTextWithBack}>Products</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Feather name="chevron-left" size={28} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.contentShell}>
          <FlatList
            data={slides}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ gap: 20, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            renderItem={renderItem}
          />
        </View>
      </>
    ),
    [styles, router, slides, renderItem],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.screen}>
          <View style={styles.headingContainerRow}>
            <Text style={styles.headingTextWithBack}>Products</Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <Feather name="chevron-left" size={28} color="black" />
            </TouchableOpacity>
          </View>
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#32CD32" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>{ListContent}</View>
    </SafeAreaView>
  );
};

export default ProductsScreen;
