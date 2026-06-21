import { useAuthStore } from "@/store/AuthStore";
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import Toast from "react-native-toast-message";

const RootLayout = () => {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="(tabbar)" />
      </Stack>
      <Toast />
    </>
  );
};

export default RootLayout;
