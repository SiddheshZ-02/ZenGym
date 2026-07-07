import { ScrollView, StyleSheet, View } from "react-native";
import React from "react";
import ImageSlide from "@/components/ImageSlide";

import Slogan from "@/components/Slogan";
import { SafeAreaView } from "react-native-safe-area-context";
import Exercise from "@/components/Exercise";
import { createThemedStyles } from "@/constants/responsive";

const useStyles = createThemedStyles((_, responsive) => {
  const { spacing } = responsive;
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: "#000",
    },
    scrollContent: {
      paddingBottom: spacing.xxl,
    },
  });
});

const HomeScreen = () => {
  const styles = useStyles();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ flex: 1, backgroundColor: "black" }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Slogan />
          <ImageSlide />
          <Exercise />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
