import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useEffect, useRef } from 'react';
import { Dimensions, View } from "react-native";
import { useAuthStore } from '@/store/AuthStore';

const { height, width } = Dimensions.get("window");
const Index = () => {
  const animation = useRef<LottieView>(null);
  const router = useRouter();
  const { session, initialized } = useAuthStore();

  useEffect(() => {
    // Wait until auth is initialized
    if (!initialized) return;
    
    const timer = setTimeout(() => {
      if (session) {
        router.replace("/(tabbar)/Home");
      } else {
        router.replace("/login");
      }
    }, 1600);

    return () => clearTimeout(timer);
  }, [session, initialized]);

  return (
    <View style={{ flex: 1, backgroundColor: "#030303" }}>
      <LottieView
        ref={animation}
        autoPlay
        style={{
          height: height,
        }}
        source={require("@/assets/animations/intro.json")}
      />
    </View>
  );
};

export default Index;
