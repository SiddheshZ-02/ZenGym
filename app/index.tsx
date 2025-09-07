
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useEffect, useRef } from 'react';

import { Dimensions, View } from "react-native";

const { height, width } = Dimensions.get("window");
const Index = () => {
  const animation = useRef<LottieView>(null);
const router =useRouter()
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/Home");
    }, 1600);

    return () => clearTimeout(timer);
  }, []);

 
  

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
