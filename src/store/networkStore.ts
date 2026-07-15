import { Platform } from "react-native";
import { create } from "zustand";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { useEffect } from "react";

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  initializeNetwork: () => () => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isConnected: true,
  isInternetReachable: true,

  initializeNetwork: () => {
    if (Platform.OS === "web") {
      // Web: use navigator.onLine
      set({
        isConnected: navigator.onLine,
        isInternetReachable: navigator.onLine,
      });

      const onlineHandler = () =>
        set({ isConnected: true, isInternetReachable: true });
      const offlineHandler = () =>
        set({ isConnected: false, isInternetReachable: false });

      window.addEventListener("online", onlineHandler);
      window.addEventListener("offline", offlineHandler);

      return () => {
        window.removeEventListener("online", onlineHandler);
        window.removeEventListener("offline", offlineHandler);
      };
    } else {
      // Native (iOS/Android): use NetInfo
      const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
        set({
          isConnected: state.isConnected ?? false,
          isInternetReachable: state.isInternetReachable,
        });
      });

      // Get initial state immediately (don't wait for first change event)
      NetInfo.fetch().then((state) => {
        set({
          isConnected: state.isConnected ?? false,
          isInternetReachable: state.isInternetReachable,
        });
      });

      return unsubscribe;
    }
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