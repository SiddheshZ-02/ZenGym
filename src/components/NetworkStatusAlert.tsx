import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Modal, Animated, Easing } from "react-native";

import { Feather } from "@expo/vector-icons";
import { createThemedStyles } from "@/constants/responsive";
import { useNetworkStatus } from '@/store/networkStore';

const useStyles = createThemedStyles((_, responsive) => {
  const { spacing, radius, fontSizes } = responsive;
  return StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.85)",
      justifyContent: "center",
      alignItems: "center",
    },
    offlineCard: {
      backgroundColor: "#1a1a1a",
      borderRadius: radius.xl,
      padding: spacing.md,
      alignItems: "center",
      width: "85%",
      maxWidth: 400,
      borderWidth: 2,
      borderColor: "#32CD32",
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: radius.full,
      backgroundColor: "#cd4c3220",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: spacing.lg,
    },
    offlineTitle: {
      fontSize: fontSizes.xl,
      fontWeight: "800",
      color: "#32CD32",
      marginBottom: spacing.sm,
    },
    offlineMessage: {
      fontSize: fontSizes.md,
      color: "#ccc",
      textAlign: "center",
      lineHeight: fontSizes.lg,
    },
  });
});

const NetworkStatusAlert = () => {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const isOffline = !isConnected || isInternetReachable === false;
  const styles = useStyles();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOffline) {
      // Animate in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOffline, scaleAnim, opacityAnim]);

  return (
    <Modal
      visible={isOffline}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
    >
      <Animated.View style={[styles.modalContainer, { opacity: opacityAnim }]}>
        <Animated.View
          style={[
            styles.offlineCard,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <Feather name="wifi-off" size={40} color="#c71414ff" />
          </View>
          <Text style={styles.offlineTitle}>OFFLINE</Text>
          <Text style={styles.offlineMessage}>
            Please check your internet connection and try again.
          </Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default NetworkStatusAlert;
