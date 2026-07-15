import {
  createThemedStyles,
  getResHeight,
  getResWidth,
} from "@/constants/responsive";
import { supabase } from "@/services/supabaseClient";
import { router } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

interface SlideItem {
  id: number;
  source: { uri: string } | number;
  linkUrl?: string;
}

const useStyles = createThemedStyles((_, responsive) => {
  const { spacing, radius, hp, SCREEN, containerMaxWidth } = responsive;
  const slideWidth = Math.min(
    SCREEN.width - spacing.md * 2,
    containerMaxWidth ?? SCREEN.width - spacing.md * 2,
  );

  return StyleSheet.create({
    shell: {
      paddingHorizontal: spacing.md,
      width: "100%",
      maxWidth: containerMaxWidth,
      alignSelf: "center",
    },
    slideWrap: {
      alignItems: "center",
    },
    slideImage: {
      height: Math.max(hp(200), 180),
      width: slideWidth,
      resizeMode: "cover",
      borderRadius: radius.xl,
      backgroundColor: "black",
    },
    loadingWrap: {
      height: Math.max(hp(200), 180),
      width: slideWidth,
      borderRadius: radius.xl,
      backgroundColor: "black",
      alignItems: "center",
      justifyContent: "center",
    },
    dotsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: spacing.sm,
      gap: spacing.xs,
      position:"absolute",
      bottom:getResWidth(6),
      alignSelf:"center"
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#666",
    },
    activeDot: {
      backgroundColor: "#32CD32",
      width: 20,
      borderRadius: 4,
    },
  });
});

const ImageSlide = () => {
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const listRef = useRef<FlatList>(null);
  const styles = useStyles();

  // All hooks must be called before any early returns!
  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 50,
    }),
    [],
  );

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

  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setActiveSlide((prev) => {
        const next = prev + 1 >= Math.min(slides.length, 5) ? 0 : prev + 1;
        listRef.current?.scrollToIndex({
          index: next,
          animated: true,
        });
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [slides.length]);

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

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: any[] }) => {
      if (
        viewableItems.length > 0 &&
        viewableItems[0].index !== null &&
        viewableItems[0].index !== undefined
      ) {
        setActiveSlide(viewableItems[0].index);
      }
    },
    [],
  );

  // Take only first 5 slides
  const visibleSlides = useMemo(() => slides.slice(0, 5), [slides]);

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

  // Now we can do early returns AFTER all hooks are defined
  if (loading) {
    return (
      <View style={styles.shell}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#fff" />
        </View>
      </View>
    );
  }

  if (!slides.length) return null;

  return (
    <View style={styles.shell}>
      {/* Show View More button only if there are more than 5 slides */}
      {slides.length > 5 && (
        <TouchableOpacity
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            paddingVertical: getResHeight(10),
          }}
          onPress={() => router.push("/Screen/Products/ProductsScreen")}
        >
          <Text
            style={{
              color: "#32CD32",
              fontSize: getResWidth(12),
              fontWeight: "600",
            }}
          >
            {" "}
            View More {">>"}{" "}
          </Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={visibleSlides}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ gap: 20 }}
        horizontal
        pagingEnabled
        ref={listRef}
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={renderItem}
      />

      {/* Show dots only if there are multiple visible slides */}
      {visibleSlides.length > 1 && (
        <View style={styles.dotsContainer}>
          {visibleSlides.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === activeSlide && styles.activeDot]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default ImageSlide;
