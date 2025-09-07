import { View, Text, Dimensions, FlatList, Image } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { LegendList } from "@legendapp/list";

const { height, width } = Dimensions.get("window");

const ImageList = [
  { id: 1, image: require("@/assets/images/slide1.jpg") },
  { id: 2, image: require("@/assets/images/slide2.png") },
  { id: 3, image: require("@/assets/images/slide3.png") },
  { id: 4, image: require("@/assets/images/slide4.jpg") },
  { id: 5, image: require("@/assets/images/slide5.jpg") },
];

const ImageSlide = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  const listRef = useRef(null);

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
    <View>
      <LegendList
        data={ImageList}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ gap: 20 }}
        horizontal={true}
        pagingEnabled
        ref={listRef}
        recycleItems
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => {
          return (
            <View style={{ padding: 10, elevation: 10 }}>
              <Image
                source={item.image}
                style={{
                  height: 200,
                  width: width * 0.95,
                  resizeMode: "cover",
                  borderRadius: 20,
                  backgroundColor: "white",
                }}
              />
            </View>
          );
        }}
      />
    </View>
  );
};

export default ImageSlide;
