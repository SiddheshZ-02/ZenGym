import { useAuthStore } from "@/store/authStore";
import { AppSystemProvider } from "@/constants/responsive";
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const App = () => {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    return initializeAuth();
  }, [initializeAuth]);

  return (
    <SafeAreaProvider>
      <AppSystemProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Screen/Auth/index" />
          <Stack.Screen name="Screen/Auth/LoginScreen" />
          <Stack.Screen name="Screen/Auth/SignupScreen" />
          <Stack.Screen name="TabNavigation" />
          <Stack.Screen name="Screen/BodyPart/BodyPartScreen" />
          <Stack.Screen name="Screen/ExerciseDetails/ExerciseDetailsScreen" />
          <Stack.Screen name="Screen/Profile/ProfileScreen" />
        </Stack>
        <Toast />
      </AppSystemProvider>
    </SafeAreaProvider>
  );
};

export default App;
