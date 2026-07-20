import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

interface Props {
  visible: boolean;
  onRequestClose: () => void;
  onWatch: () => void;
  title?: string;
}

export default function PremiumUnlockModal({
  visible,
  onRequestClose,
  onWatch,
  title = "Watch Ad",
}: Props) {
  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.heading}>Unlock Premium Workout</Text>
          <Text style={styles.subheading}>
            Watch a short ad to unlock this workout for 1 hour.
          </Text>
          <View style={{ marginVertical: 30 }}>
            <FontAwesome name="play-circle-o" size={100} color="#efffef" />
          </View>

          <LinearGradient
            colors={["#32CD32", "#1E7D3B"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonWrapper}
          >
            <TouchableOpacity style={styles.button} onPress={onWatch}>
              <Text style={styles.buttonText}>Watch Now</Text>
            </TouchableOpacity>
          </LinearGradient>

          <TouchableOpacity style={styles.cancel} onPress={onRequestClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: Math.min(420, width - 40),
    backgroundColor: "#0b0b0b",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderColor: "rgba(50, 205, 50, 0.55)",
    borderWidth: 1,
  },
  heading: {
    color: "#32CD32",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  subheading: {
    color: "#ccc",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  buttonWrapper: {
    borderRadius: 12,
    width: "100%",
  },
  button: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#000",
    fontWeight: "800",
    fontSize: 16,
  },
  cancel: { marginTop: 12 },
  cancelText: { color: "#32CD32", fontWeight: "700" },
});
