import NetInfo from "@react-native-community/netinfo";
import { useEffect } from "react";
import { create } from "zustand";

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  initializeNetwork: () => () => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isConnected: true,
  isInternetReachable: true,

  initializeNetwork: () => {
    let unsubscribeNetInfo: (() => void) | null = null;

    // Use @react-native-community/netinfo for both native and web
    unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      set({
        isConnected: state.isConnected ?? true,
        isInternetReachable: state.isInternetReachable ?? true,
      });
    });

    return () => {
      if (unsubscribeNetInfo) {
        unsubscribeNetInfo();
      }
    };
  },
}));

export const useNetworkStatus = () => {
  const { isConnected, isInternetReachable, initializeNetwork } =
    useNetworkStore();

  useEffect(() => {
    return initializeNetwork();
  }, [initializeNetwork]);

  return { isConnected, isInternetReachable };
};
