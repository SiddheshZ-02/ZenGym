import { useEffect } from "react";
import { Platform } from "react-native";
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
    let onlineHandler: (() => void) | null = null;
    let offlineHandler: (() => void) | null = null;

    if (Platform.OS === "web") {
      // Use navigator.onLine for web
      set({
        isConnected: navigator.onLine,
        isInternetReachable: navigator.onLine,
      });

      onlineHandler = () =>
        set({ isConnected: true, isInternetReachable: true });
      offlineHandler = () =>
        set({ isConnected: false, isInternetReachable: false });

      window.addEventListener("online", onlineHandler);
      window.addEventListener("offline", offlineHandler);
    }

    return () => {
      if (onlineHandler && Platform.OS === "web") {
        window.removeEventListener("online", onlineHandler);
      }
      if (offlineHandler && Platform.OS === "web") {
        window.removeEventListener("offline", offlineHandler);
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
