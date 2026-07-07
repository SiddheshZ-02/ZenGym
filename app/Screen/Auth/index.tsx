import { useAuthStore } from "@/store/authStore";
import { useResponsive } from "@/constants/responsive";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useEffect, useRef } from "react";
import { View } from "react-native";
const SplashScreen = () => {
  const animation = useRef<LottieView>(null);
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

  return (
    <View style={{ flex: 1, backgroundColor: "#030303" }}>
      <LottieView
        ref={animation}
        autoPlay
        style={{
          height: SCREEN.height,
          width: SCREEN.width,
        }}
        source={require("@assets/animations/intro.json")}
      />
    </View>
  );
};

export default SplashScreen;
