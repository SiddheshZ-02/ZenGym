import { useResponsive } from "@/constants/responsive";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import LottieView from "lottie-react-native";
import { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

// Prevent the splash screen from auto-hiding, ignore any errors
try {
  SplashScreen.preventAutoHideAsync();
} catch (e) {
  console.warn("Error preventing splash screen auto hide:", e);
}

const SplashScreenComponent = () => {
  const animation = useRef<LottieView>(null);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [screenReady, setScreenReady] = useState(false);
  const router = useRouter();
  const { session, initialized } = useAuthStore();
  const { SCREEN } = useResponsive();

  useEffect(() => {
    const fallbackTimer = setTimeout(() => setScreenReady(true), 1400);
    return () => clearTimeout(fallbackTimer);
  }, []);

  useEffect(() => {
    if (animationComplete) {
      setScreenReady(true);
    }
  }, [animationComplete]);

  useEffect(() => {
    if (!initialized || !screenReady) return;

    let isActive = true;

    (async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn("Error hiding splash screen:", e);
      }

      if (!isActive) return;

      if (session) {
        router.replace("/TabNavigation/HomeScreen");
      } else {
        router.replace("/Screen/Auth/LoginScreen");
      }
    })();

    return () => {
      isActive = false;
    };
  }, [router, session, initialized, screenReady]);

  const animationSource = require("@assets/animations/intro.json");

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
        onAnimationFailure={() => setAnimationComplete(true)}
        onAnimationFinish={() => setAnimationComplete(true)}
        cacheComposition={true}
      />
    </SafeAreaView>
  );
};

export default SplashScreenComponent;
