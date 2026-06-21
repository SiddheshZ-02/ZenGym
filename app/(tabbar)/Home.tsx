import { View, TouchableOpacity, Alert, ScrollView } from "react-native";
import React from "react";
import ImageSlide from "@/components/ImageSlide";

import Slogan from "@/components/Slogan";
import { SafeAreaView } from "react-native-safe-area-context";
import Exercise from "@/components/Exercise";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useAuthStore } from "@/store/AuthStore";

const Home = () => {
  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <SafeAreaView />
  
<ScrollView>

      <Slogan />
      <ImageSlide />
      <Exercise />
</ScrollView>
    </View>
  );
};

export default Home;
