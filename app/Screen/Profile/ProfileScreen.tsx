import { createThemedStyles } from "@/constants/responsive";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { showToast } from "@/utils/toast";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const useStyles = createThemedStyles((_, responsive) => {
  const { spacing, radius, fontSizes, ms, containerMaxWidth } = responsive;

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: "#000",
    },
    screen: {
      flex: 1,
      backgroundColor: "#000",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: "#333",
    },
    backBtn: {
      position: "absolute",
      left: spacing.md,
      padding: spacing.xs,
      zIndex: 1,
    },
    headerTitle: {
      fontSize: fontSizes.xl,
      fontWeight: "bold",
      color: "#32CD32",
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xl,
      alignItems: "center",
    },
    content: {
      width: "100%",
      maxWidth: containerMaxWidth ?? 440,
      alignItems: "center",
    },
    avatarSection: {
      alignItems: "center",
      marginBottom: spacing.xl,
    },
    avatarWrap: {
      width: ms(120),
      height: ms(120),
      borderRadius: ms(60),
      borderWidth: 3,
      borderColor: "#32CD32",
      overflow: "hidden",
      backgroundColor: "#1a1a1a",
      alignItems: "center",
      justifyContent: "center",
    },
    avatarImage: {
      width: "100%",
      height: "100%",
    },
    changePhotoBtn: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: "#2a2a2a",
      borderRadius: radius.md,
      gap: spacing.xs,
    },
    changePhotoText: {
      color: "#32CD32",
      fontSize: fontSizes.md,
      fontWeight: "600",
    },
    card: {
      width: "100%",
      backgroundColor: "#1a1a1a",
      borderRadius: radius.lg,
      padding: spacing.lg,
      marginBottom: spacing.md,
    },
    label: {
      fontSize: fontSizes.sm,
      color: "#888",
      marginBottom: spacing.xs,
    },
    value: {
      fontSize: fontSizes.md,
      color: "#fff",
    },
    input: {
      backgroundColor: "#2d2d2d",
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: ms(14),
      color: "#fff",
      fontSize: fontSizes.md,
    },
    saveBtn: {
      backgroundColor: "#32CD32",
      borderRadius: radius.md,
      paddingVertical: ms(14),
      alignItems: "center",
      marginTop: spacing.md,
    },
    saveBtnText: {
      color: "#fff",
      fontSize: fontSizes.md,
      fontWeight: "600",
    },
    logoutBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      backgroundColor: "#2a2a2a",
      borderRadius: radius.md,
      paddingVertical: ms(16),
      marginTop: spacing.lg,
      gap: spacing.sm,
    },
    logoutText: {
      color: "#FF4444",
      fontSize: fontSizes.md,
      fontWeight: "600",
    },
    loadingWrap: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  });
});

const ProfileScreen = () => {
  const router = useRouter();
  const styles = useStyles();
  const { user, signOut } = useAuthStore();
  const { profile, loading, uploading, fetchProfile, updateUsername, uploadAvatar } =
    useProfileStore();
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile?.username) {
      setUsername(profile.username);
    }
  }, [profile?.username]);

  const pickImage = async (source: "camera" | "library") => {
    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      showToast(
        "error",
        source === "camera"
          ? "Camera permission is required to take a photo"
          : "Photo library permission is required",
      );
      return;
    }

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });

    if (result.canceled || !result.assets[0]) return;

    const { error } = await uploadAvatar(result.assets[0].uri);
    if (error) {
      showToast("error", error);
    } else {
      showToast("success", "Profile photo updated!");
    }
  };

  const handleChangePhoto = () => {
    Alert.alert("Change Profile Photo", "Choose an option", [
      { text: "Take Photo", onPress: () => pickImage("camera") },
      { text: "Choose from Gallery", onPress: () => pickImage("library") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleSaveUsername = async () => {
    if (!username.trim()) {
      showToast("error", "Username cannot be empty");
      return;
    }

    setSaving(true);
    const { error } = await updateUsername(username);
    setSaving(false);

    if (error) {
      showToast("error", error);
    } else {
      showToast("success", "Username updated!");
    }
  };

  const handleLogout = async () => {
    await signOut();
    showToast("success", "Logged out successfully!");
    router.replace("/Screen/Auth/LoginScreen");
  };

  if (loading && !profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#32CD32" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <AntDesign name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              <View style={styles.avatarSection}>
                <TouchableOpacity
                  style={styles.avatarWrap}
                  onPress={handleChangePhoto}
                  disabled={uploading}
                  activeOpacity={0.8}
                >
                  {uploading ? (
                    <ActivityIndicator size="large" color="#32CD32" />
                  ) : profile?.avatar_url ? (
                    <Image
                      source={{ uri: profile.avatar_url }}
                      style={styles.avatarImage}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                    />
                  ) : (
                    <Ionicons name="person" size={56} color="#32CD32" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.changePhotoBtn}
                  onPress={handleChangePhoto}
                  disabled={uploading}
                >
                  <Ionicons name="camera" size={20} color="#32CD32" />
                  <Text style={styles.changePhotoText}>Change Photo</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.card}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{user?.email ?? "—"}</Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter username"
                  placeholderTextColor="#888"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleSaveUsername}
                  disabled={saving || loading}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Username</Text>
                  )}
                </TouchableOpacity>
              </View>

              {profile?.created_at && (
                <View style={styles.card}>
                  <Text style={styles.label}>Member Since</Text>
                  <Text style={styles.value}>
                    {new Date(profile.created_at).toLocaleDateString()}
                  </Text>
                </View>
              )}

              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <AntDesign name="logout" size={22} color="#FF4444" />
                <Text style={styles.logoutText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;
