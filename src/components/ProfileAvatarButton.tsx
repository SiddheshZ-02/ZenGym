import { createThemedStyles, getResHeight } from "@/constants/responsive";
import { useProfileStore } from "@/store/profileStore";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { getResWidth } from './../constants/responsive';

interface ProfileAvatarButtonProps {
  size?: number;
}

const useStyles = createThemedStyles((_, _responsive) => {
  return StyleSheet.create({
    button: {
      overflow: "hidden",
      borderWidth: 2,
      borderColor: "#32CD32",
      backgroundColor: "#1a1a1a",
      alignItems: "center",
      justifyContent: "center",
      position:"absolute",
      right:getResWidth(20),
      top:getResHeight(30)
    },
    image: {
      width: "100%",
      height: "100%",
    },
    fallback: {
      alignItems: "center",
      justifyContent: "center",
    },
  });
});

const ProfileAvatarButton = ({ size = 44 }: ProfileAvatarButtonProps) => {
  const router = useRouter();
  const styles = useStyles();
  const { profile, fetchProfile } = useProfileStore();
  const dimension = size;

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handlePress = () => {
    router.push("/Screen/Profile/ProfileScreen");
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.button,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
        },
      ]}
      activeOpacity={0.8}
    >
      {profile?.avatar_url ? (
        <Image
          source={{ uri: profile.avatar_url }}
          style={styles.image}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      ) : (
        <View style={[styles.image, styles.fallback]}>
          <Ionicons name="person" size={dimension * 0.5} color="#32CD32" />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default ProfileAvatarButton;
