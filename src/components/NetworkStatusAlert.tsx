import React, { useEffect, useRef } from "react";
import { Alert } from "react-native";
import { useNetworkStatus } from "@/store/networkStore";

const NetworkStatusAlert = () => {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const alertShownRef = useRef(false);
  const isOffline = !isConnected || isInternetReachable === false;

  useEffect(() => {
    if (isOffline && !alertShownRef.current) {
      alertShownRef.current = true;
      Alert.alert(
        "No Internet Connection",
        "Please check your internet connection and try again.",
        [{ text: "OK" }],
        { cancelable: false }
      );
    } else if (!isOffline) {
      alertShownRef.current = false;
    }
  }, [isConnected, isInternetReachable, isOffline]);

  return null;
};

export default NetworkStatusAlert;
