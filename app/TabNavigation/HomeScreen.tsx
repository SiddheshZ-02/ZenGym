import Exercise from "@/components/Exercise";
import ImageSlide from "@/components/ImageSlide";
import Slogan from "@/components/Slogan";
import { createThemedStyles } from "@/constants/responsive";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const useStyles = createThemedStyles((_, responsive) => {
  const { spacing } = responsive;
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: "#000",
    },
  });
});

const HomeScreen = () => {
  const styles = useStyles();

  const ListHeader = useMemo(() => {
    return (
      <>
        <Slogan />
        <ImageSlide />
      </>
    );
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ flex: 1, backgroundColor: "black" }}>
        <Exercise ListHeaderComponent={ListHeader} />
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
