import { useResponsive } from "@/constants/responsive";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import LottieView from "lottie-react-native";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Prevent the splash screen from auto-hiding, ignore any errors
try {
  SplashScreen.preventAutoHideAsync();
} catch (e) {
  console.warn("Error preventing splash screen auto hide:", e);
}

const SplashScreenComponent = () => {
  const animation = useRef<LottieView>(null);
  const [animationError, setAnimationError] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const router = useRouter();
  const { session, initialized } = useAuthStore();
  const { SCREEN } = useResponsive();

  // Wait for both auth initialized and animation complete
  useEffect(() => {
    if (initialized && animationComplete) {
      // Hide the native splash screen before navigating, ignore any errors
      (async () => {
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          console.warn("Error hiding splash screen:", e);
        }
        if (session) {
          router.replace("/TabNavigation/HomeScreen");
        } else {
          router.replace("/Screen/Auth/LoginScreen");
        }
      })();
    }
  }, [router, session, initialized, animationComplete]);

  const animationSource = require("@assets/animations/intro.json");

  // if (animationError) {
  //   return (
  //     <SafeAreaView
  //       style={{
  //         flex: 1,
  //         backgroundColor: "#030303",
  //         justifyContent: "center",
  //         alignItems: "center",
  //       }}
  //     >
  //       <ActivityIndicator size="large" color="#32CD32" />
  //     </SafeAreaView>
  //   );
  // }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#030303" }}>
      <LottieView
        ref={animation}
        autoPlay
        loop={false}
        resizeMode="cover"
        style={{
          height: SCREEN.height,
          width: SCREEN.width,
        }}
        source={animationSource}
        // onAnimationFailure={() => setAnimationError(true)}
        onAnimationFinish={() => setAnimationComplete(true)}
        cacheComposition={true}
      />
    </SafeAreaView>
  );
};

export default SplashScreenComponent;
