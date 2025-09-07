import ContextProvider from "@/Context/ContextProvider";
import { Stack } from "expo-router";
import React from "react";

const _layout = () => {
 

  return (
    <ContextProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabbar)" options={{ headerShown: false }} />
      </Stack>
    </ContextProvider>
  );
};

export default _layout;
