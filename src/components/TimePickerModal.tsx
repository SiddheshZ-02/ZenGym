import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";

interface TimePickerModalProps {
  visible: boolean;
  dayOfWeek: string;
  onConfirm: (hour: number, minute: number) => void;
  onCancel: () => void;
}

const TimePickerModal = ({
  visible,
  dayOfWeek,
  onConfirm,
  onCancel,
}: TimePickerModalProps) => {
  const now = new Date();
  const [hour, setHour] = useState(String(now.getHours()).padStart(2, "0"));
  const [minute, setMinute] = useState(
    String(now.getMinutes()).padStart(2, "0"),
  );

  useEffect(() => {
    if (!visible) return;
    const current = new Date();
    setHour(String(current.getHours()).padStart(2, "0"));
    setMinute(String(current.getMinutes()).padStart(2, "0"));
  }, [visible, dayOfWeek]);

  const normalizeHour = (value: string) => {
    const digits = value.replace(/[^0-9]/g, "").slice(0, 2);
    setHour(digits);
  };

  const normalizeMinute = (value: string) => {
    const digits = value.replace(/[^0-9]/g, "").slice(0, 2);
    setMinute(digits);
  };

  const handleConfirm = () => {
    const parsedHour = clampTimePart(hour, 23);
    const parsedMinute = clampTimePart(minute, 59);
    setHour(String(parsedHour).padStart(2, "0"));
    setMinute(String(parsedMinute).padStart(2, "0"));
    onConfirm(parsedHour, parsedMinute);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Remind me </Text>
          <Text style={styles.modalSubtitle}>
            Choose the reminder time for this workout day
          </Text>

          <View style={styles.timeRow}>
            <View style={styles.timeField}>
              <Text style={styles.fieldLabel}>Hour</Text>
              <TextInput
                value={hour}
                onChangeText={normalizeHour}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="08"
                placeholderTextColor="#666"
                style={styles.input}
              />
            </View>
            <Text style={styles.separator}>:</Text>
            <View style={styles.timeField}>
              <Text style={styles.fieldLabel}>Minute</Text>
              <TextInput
                value={minute}
                onChangeText={normalizeMinute}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="30"
                placeholderTextColor="#666"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>Set Reminder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

function clampTimePart(value: string, max: number) {
  const parsed = Number.parseInt(value || "0", 10);
  if (Number.isNaN(parsed)) return 0;
  return Math.min(Math.max(parsed, 0), max);
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 18,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 12,
  },
  timeField: {
    alignItems: "center",
  },
  fieldLabel: {
    color: "#999",
    fontSize: 12,
    marginBottom: 6,
  },
  input: {
    width: 72,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#101010",
    color: "#fff",
    fontSize: 22,
    textAlign: "center",
    fontWeight: "600",
  },
  separator: {
    color: "#32CD32",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  hint: {
    color: "#777",
    textAlign: "center",
    marginTop: 14,
    fontSize: 12,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    backgroundColor: "#444",
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 15,
  },
  confirmButton: {
    flex: 1,
    padding: 14,
    backgroundColor: "#32CD32",
    borderRadius: 12,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 15,
  },
});

export default TimePickerModal;
