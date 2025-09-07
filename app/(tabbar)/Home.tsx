import { View,  } from "react-native";
import React from "react";
import ImageSlide from "@/components/ImageSlide";

import Slogan from "@/components/Slogan";
import { SafeAreaView } from "react-native-safe-area-context";
import Exercise from "@/components/Exercise";

const Home = () => {
  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <SafeAreaView />

      <Slogan />
      <ImageSlide />
      <Exercise />
    </View>
  );
};

export default Home;
