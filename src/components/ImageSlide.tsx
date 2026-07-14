import {
  createThemedStyles,
  getResHeight,
  getResWidth,
} from "@/constants/responsive";
import { supabase } from "@/services/supabaseClient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Button,
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
      // paddingVertical: spacing.sm,
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
  });
});

const ImageSlide = () => {
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const listRef = useRef(null);
  const styles = useStyles();

  useEffect(() => {
    const fetchSlides = async () => {
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
        } else {
          console.error("Error fetching carousel slides:", error);
        }
      } catch (error) {
        console.error("Error fetching carousel slides:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setActiveSlide((prev) => {
        const next = prev + 1 >= slides.length ? 0 : prev + 1;
        (listRef.current as any)?.scrollToIndex({
          index: next,
          animated: true,
        });
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [slides.length]);

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

  const handleSlidePress = async (linkUrl?: string) => {
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
  };

  return (
    <View style={styles.shell}>
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
          View Products {">>"}{" "}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={slides}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ gap: 20 }}
        horizontal
        pagingEnabled
        ref={listRef}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.slideWrap}>
            <TouchableOpacity
              onPress={() => handleSlidePress(item.linkUrl)}
              style={styles.slideImage}
            >
              <Image source={item.source} style={styles.slideImage} />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default ImageSlide;
