import NetworkStatusAlert from "@/components/NetworkStatusAlert";
import { AppSystemProvider } from "@/constants/responsive";
import { useAuthStore } from "@/store/authStore";
import * as NavigationBar from "expo-navigation-bar";
import * as Notifications from "expo-notifications";
import { router, Stack } from "expo-router";
import React, { Component, ReactNode, useEffect, useRef } from "react";
import {
  AppState,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

// Root Error Boundary
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Root Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.title}>Oops! Something went wrong.</Text>
          <Text style={errorStyles.message}>
            {this.state.error?.message || "An unexpected error occurred."}
          </Text>
          <TouchableOpacity
            style={errorStyles.button}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={errorStyles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#32CD32",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
});

const App = () => {
  const { initializeAuth } = useAuthStore();
  const appState = useRef(AppState.currentState);
  const notificationSub = useRef<any>(null);

  useEffect(() => {
    // Global error handler to catch "Unable to activate keep awake"
    const originalError = console.error;
    console.error = (...args: any[]) => {
      const errorMessage = args.join(" ");
      if (errorMessage.includes("Unable to activate keep awake")) {
        // Ignore this specific error
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    // Handle tapping on a notification to deep-link into the app
    (async () => {
      try {
        const last = await Notifications.getLastNotificationResponse();
        if (last?.notification) {
          const rawDay = last.notification.request.content.data?.day;
          const day =
            typeof rawDay === "string" || typeof rawDay === "number"
              ? rawDay
              : undefined;
          if (day != null)
            router.push({
              pathname: "/TabNavigation/WorkoutListsScreen",
              params: { day },
            });
        }
      } catch (e) {
        // ignore
      }

      notificationSub.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          const rawDay = response.notification.request.content.data?.day;
          const day =
            typeof rawDay === "string" || typeof rawDay === "number"
              ? rawDay
              : undefined;
          if (day != null)
            router.push({
              pathname: "/TabNavigation/WorkoutListsScreen",
              params: { day },
            });
          else router.push("/TabNavigation/WorkoutListsScreen");
        });
    })();

    return initializeAuth();
  }, [initializeAuth]);

  // cleanup listener on unmount
  useEffect(() => {
    return () => {
      try {
        notificationSub.current?.remove?.();
      } catch (e) {
        // noop
      }
    };
  }, []);

  useEffect(() => {
    async function setupNavigationBar() {
      try {
        await NavigationBar.setButtonStyleAsync("light");
      } catch (e) {
        console.warn("Navigation bar setup error:", e);
      }
    }

    setupNavigationBar();
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AppSystemProvider>
          <NetworkStatusAlert />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="Screen/Auth/index" />
            <Stack.Screen name="Screen/Auth/LoginScreen" />
            <Stack.Screen name="Screen/Auth/SignupScreen" />
            <Stack.Screen name="TabNavigation" />
            <Stack.Screen name="Screen/BodyPart/BodyPartScreen" />
            <Stack.Screen name="Screen/ExerciseDetails/ExerciseDetailsScreen" />
            <Stack.Screen name="Screen/Profile/ProfileScreen" />
            <Stack.Screen name="Screen/Products/ProductsScreen" />
            <Stack.Screen name="Screen/Plans/PlansScreen" />
          </Stack>
          <Toast />
        </AppSystemProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
};

export default App;
