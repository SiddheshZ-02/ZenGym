import { createThemedStyles } from "@/constants/responsive";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const useStyles = createThemedStyles((_, responsive) => {
  const { spacing, fontSizes, isSmallPhone, containerMaxWidth } = responsive;

  return StyleSheet.create({
    shell: {
      minHeight: isSmallPhone ? 160 : 180,
      justifyContent: "space-between",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.md,
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
      width: "100%",
      maxWidth: containerMaxWidth,
      alignSelf: "center",
    },
    copy: {
      alignItems: "flex-start",
    },
    lineWhite: {
      fontSize: isSmallPhone ? fontSizes.xl : fontSizes.hero,
      fontWeight: "700",
      color: "white",
      lineHeight: fontSizes.hero + 4,
    },
    lineAccent: {
      fontSize: isSmallPhone ? fontSizes.xl : fontSizes.hero,
      fontWeight: "900",
      color: "#32CD32",
      lineHeight: fontSizes.hero + 4,
    },
  });
});

const Slogan = () => {
  const styles = useStyles();

  return (
    <View style={styles.shell}>
      <View style={styles.copy}>
        <Text style={styles.lineWhite}>READY TO</Text>
        <Text style={styles.lineAccent}>WORKOUT</Text>
      </View>
    </View>
  );
};

export default Slogan;
