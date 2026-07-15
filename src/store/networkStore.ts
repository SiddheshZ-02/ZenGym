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
    let networkListener: any = null;

    const updateNetworkState = async () => {
      try {
        // Try to import expo-network dynamically to avoid errors if module not available
        const Network = require("expo-network");
        const { isConnected, isInternetReachable } =
          await Network.getNetworkStateAsync();
        set({
          isConnected: isConnected ?? true,
          isInternetReachable: isInternetReachable ?? true,
        });
      } catch (e) {
        // Fallback to web/navigator.onLine if expo-network fails
        if (Platform.OS === "web") {
          set({
            isConnected: navigator.onLine,
            isInternetReachable: navigator.onLine,
          });
        } else {
          // For native, default to true if we can't check
          set({ isConnected: true, isInternetReachable: true });
        }
      }
    };

    // Initial check
    updateNetworkState();

    if (Platform.OS === "web") {
      // Use navigator.onLine for web
      onlineHandler = () =>
        set({ isConnected: true, isInternetReachable: true });
      offlineHandler = () =>
        set({ isConnected: false, isInternetReachable: false });

      window.addEventListener("online", onlineHandler);
      window.addEventListener("offline", offlineHandler);
    } else {
      try {
        // Try expo-network for native
        const Network = require("expo-network");
        networkListener = Network.addNetworkStateListener((state: any) => {
          set({
            isConnected: state.isConnected ?? true,
            isInternetReachable: state.isInternetReachable ?? true,
          });
        });
      } catch (e) {
        console.warn("expo-network not available, network monitoring disabled");
      }
    }

    return () => {
      if (onlineHandler && Platform.OS === "web") {
        window.removeEventListener("online", onlineHandler);
      }
      if (offlineHandler && Platform.OS === "web") {
        window.removeEventListener("offline", offlineHandler);
      }
      if (networkListener) {
        try {
          networkListener.remove();
        } catch (e) {
          console.warn("Error removing network listener", e);
        }
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
