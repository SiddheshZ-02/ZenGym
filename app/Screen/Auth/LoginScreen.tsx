import { createThemedStyles } from "@/constants/responsive";
import { useAuthStore } from "@/store/authStore";
import { showToast } from "@/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const useStyles = createThemedStyles((_, responsive) => {
  const { spacing, radius, fontSizes, ms, wp, containerMaxWidth, isSmallPhone } =
    responsive;

  const logoSize = isSmallPhone ? wp(84) : wp(100);

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#1a1a1a",
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xl,
    },
    content: {
      width: "100%",
      maxWidth: containerMaxWidth ?? 440,
      alignSelf: "center",
    },
    logo: {
      width: logoSize,
      height: logoSize,
      alignSelf: "center",
      marginBottom: spacing.md,
    },
    title: {
      fontSize: fontSizes.xxl,
      fontWeight: "bold",
      color: "#fff",
      textAlign: "center",
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontSize: fontSizes.md,
      color: "#888",
      textAlign: "center",
      marginBottom: spacing.xl,
    },
    input: {
      backgroundColor: "#2d2d2d",
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: ms(14),
      marginBottom: spacing.md,
      color: "#fff",
      fontSize: fontSizes.md,
    },
    passwordContainer: {
      flexDirection: "row",
      backgroundColor: "#2d2d2d",
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: ms(14),
      marginBottom: spacing.md,
      alignItems: "center",
    },
    passwordInput: {
      flex: 1,
      color: "#fff",
      fontSize: fontSizes.md,
      paddingVertical: 0,
      paddingHorizontal: 0,
    },
    eyeButton: {
      marginLeft: spacing.sm,
    },
    button: {
      backgroundColor: "#32CD32",
      borderRadius: radius.md,
      paddingVertical: ms(18),
      alignItems: "center",
      marginTop: spacing.xs,
    },
    buttonText: {
      color: "#fff",
      fontSize: fontSizes.lg,
      fontWeight: "600",
    },
    signupContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: spacing.lg,
      flexWrap: "wrap",
    },
    signupText: {
      color: "#888",
      fontSize: fontSizes.md,
    },
    signupLink: {
      color: "#32CD32",
      fontSize: fontSizes.md,
      fontWeight: "600",
    },
  });
});

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { signIn, loading } = useAuthStore();
  const styles = useStyles();

  const handleLogin = async () => {
    if (!email || !password) {
      showToast("error", "Please fill in all fields");
      return;
    }

    const { error } = await signIn(email, password);
    if (!error) {
      showToast("success", "Logged in successfully!");
      router.replace("/TabNavigation/HomeScreen");
    } else {
      showToast("error", error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Image source={require("@assets/images/ZG.png")} style={styles.logo} />
          <Text style={styles.title}>ZenGym</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#888"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#888"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#32CD32" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don&apos;t have an account?</Text>
            <TouchableOpacity
              onPress={() => router.push("/Screen/Auth/SignupScreen")}
            >
              <Text style={styles.signupLink}> Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
