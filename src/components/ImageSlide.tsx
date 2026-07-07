import { createThemedStyles } from "@/constants/responsive";
import { LegendList } from "@legendapp/list";
import React, { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, View } from "react-native";

const ImageList = [
  { id: 1, image: require("@assets/images/slide1.jpg") },
  { id: 2, image: require("@assets/images/slide2.png") },
  { id: 3, image: require("@assets/images/slide3.png") },
  { id: 4, image: require("@assets/images/slide4.jpg") },
  { id: 5, image: require("@assets/images/slide5.jpg") },
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
  });
});

const ImageSlide = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const listRef = useRef(null);
  const styles = useStyles();

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => {
        const next = prev + 1 >= ImageList.length ? 0 : prev + 1;
        (listRef.current as any)?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.shell}>
      <LegendList
        data={ImageList}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ gap: 20 }}
        horizontal
        pagingEnabled
        ref={listRef}
        recycleItems
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.slideWrap}>
            <Image source={item.image} style={styles.slideImage} />
          </View>
        )}
      />
    </View>
  );
};

export default ImageSlide;
