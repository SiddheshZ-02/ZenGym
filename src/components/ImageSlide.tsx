import { createThemedStyles } from "@/constants/responsive";
import { supabase } from "@/services/supabaseClient";
import { LegendList } from "@legendapp/list";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";

interface SlideItem {
  id: number;
  source: { uri: string } | number;
}

const FALLBACK_SLIDES: SlideItem[] = [
  { id: 1, source: require("@assets/images/slide1.jpg") },
  { id: 2, source: require("@assets/images/slide2.png") },
  { id: 3, source: require("@assets/images/slide3.png") },
  { id: 4, source: require("@assets/images/slide4.jpg") },
  { id: 5, source: require("@assets/images/slide5.jpg") },
];

const useStyles = createThemedStyles((_, responsive) => {
  const { spacing, radius, hp, SCREEN, containerMaxWidth } = responsive;
  const slideWidth = Math.min(SCREEN.width - spacing.md * 2, containerMaxWidth ?? SCREEN.width - spacing.md * 2);

  return StyleSheet.create({
    shell: {
      paddingHorizontal: spacing.md,
      width: "100%",
      maxWidth: containerMaxWidth,
      alignSelf: "center",
    },
    slideWrap: {
      paddingVertical: spacing.sm,
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
          .select("id, title, image_url, sort_order")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .order("id", { ascending: true });

        if (error) throw error;

        if (data?.length) {
          setSlides(
            data.map((slide) => ({
              id: slide.id,
              source: { uri: slide.image_url },
            })),
          );
        } else {
          setSlides(FALLBACK_SLIDES);
        }
      } catch (error) {
        console.error("Error fetching carousel slides:", error);
        setSlides(FALLBACK_SLIDES);
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
        (listRef.current as any)?.scrollToIndex({ index: next, animated: true });
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

  return (
    <View style={styles.shell}>
      <LegendList
        data={slides}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ gap: 20 }}
        horizontal
        pagingEnabled
        ref={listRef}
        recycleItems
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.slideWrap}>
            <Image source={item.source} style={styles.slideImage} />
          </View>
        )}
      />
    </View>
  );
};

export default ImageSlide;
