import ProfileAvatarButton from "@/components/ProfileAvatarButton";
import { createThemedStyles } from "@/constants/responsive";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
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
    workoutRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "flex-start",
    },
    lineUsername: {
      fontSize: isSmallPhone ? fontSizes.xl : fontSizes.hero,
      fontWeight: "700",
      color: "white",
      lineHeight: fontSizes.hero + 4,
      maxWidth:"100%"
    },
  });
});

const Slogan = () => {
  const styles = useStyles();
  const { profile } = useProfileStore();
  const { user } = useAuthStore();

  const displayName =
    profile?.username?.trim() ||
    user?.email?.split("@")[0] ||
    "";

  return (
    <View style={styles.shell}>
      <View style={styles.copy}>
        <Text style={styles.lineWhite}>READY TO</Text>
        <View style={styles.workoutRow}>
          <Text style={styles.lineAccent}>WORKOUT</Text>
        </View>
          {displayName ? (
            <Text style={styles.lineUsername}> {displayName.toUpperCase()}</Text>
          ) : null}
      </View>
      <ProfileAvatarButton size={44} />
    </View>
  );
};

export default Slogan;
