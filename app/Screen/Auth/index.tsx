import { useAuthStore } from "@/store/authStore";
import { useResponsive } from "@/constants/responsive";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useEffect, useRef, useState } from "react";
import { View, ActivityIndicator } from "react-native";
const SplashScreen = () => {
  const animation = useRef<LottieView>(null);
  const [animationError, setAnimationError] = useState(false);
  const router = useRouter();
  const { session, initialized } = useAuthStore();
  const { SCREEN } = useResponsive();

  useEffect(() => {
    // Wait until auth is initialized
    if (!initialized) return;

    const timer = setTimeout(() => {
      if (session) {
        router.replace("/TabNavigation/HomeScreen");
      } else {
        router.replace("/Screen/Auth/LoginScreen");
      }
    }, 1600);

    return () => clearTimeout(timer);
  }, [router, session, initialized]);

  const animationSource = require("@assets/animations/intro.json");

  if (animationError) {
    return (
      <View style={{ flex: 1, backgroundColor: "#030303", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#32CD32" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#030303" }}>
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
        onAnimationFailure={() => setAnimationError(true)}
        cacheComposition={true}
      />
    </View>
  );
};

export default SplashScreen;