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
  const {
    spacing,
    radius,
    fontSizes,
    ms,
    wp,
    containerMaxWidth,
    isSmallPhone,
  } = responsive;

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
    googleButton: {
      backgroundColor: "#fff",
      borderRadius: radius.md,
      paddingVertical: ms(18),
      alignItems: "center",
      marginTop: spacing.md,
      flexDirection: "row",
      justifyContent: "center",
    },
    googleButtonText: {
      color: "#333",
      fontSize: fontSizes.lg,
      fontWeight: "600",
      marginLeft: spacing.sm,
    },
    dividerContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: spacing.md,
    },
    divider: {
      flex: 1,
      height: 1,
      backgroundColor: "#333",
    },
    dividerText: {
      color: "#888",
      marginHorizontal: spacing.md,
      fontSize: fontSizes.sm,
    },
    loginContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: spacing.lg,
      flexWrap: "wrap",
    },
    loginText: {
      color: "#888",
      fontSize: fontSizes.md,
    },
    loginLink: {
      color: "#32CD32",
      fontSize: fontSizes.md,
      fontWeight: "600",
    },
  });
});

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { signUp, signInWithGoogle, loading } = useAuthStore();
  const styles = useStyles();

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      showToast("error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      showToast("error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      showToast("error", "Password must be at least 6 characters");
      return;
    }

    const { error } = await signUp(email, password);
    if (!error) {
      showToast("success", "Account created successfully!");
      router.replace("/Screen/Auth/LoginScreen");
    } else {
      showToast("error", error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();
    if (!error) {
      showToast("success", "Signed up with Google successfully!");
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
          <Image
            source={require("@assets/images/ZG.png")}
            style={styles.logo}
          />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join ZenGym today</Text>

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

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              placeholderTextColor="#888"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeButton}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-off" : "eye"}
                size={24}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#32CD32" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#333" />
            ) : (
              <>
                <Ionicons name="logo-google" size={24} color="#333" />
                <Text style={styles.googleButtonText}>Sign Up with Google</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity
              onPress={() => router.push("/Screen/Auth/LoginScreen")}
            >
              <Text style={styles.loginLink}> Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
