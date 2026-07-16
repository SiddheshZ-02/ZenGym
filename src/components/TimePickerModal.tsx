import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

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
  const [time, setTime] = useState(new Date());

  const handleConfirm = () => {
    onConfirm(time.getHours(), time.getMinutes());
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Remind me on {dayOfWeek}</Text>
          <Text style={styles.modalSubtitle}>
            Choose what time you want your reminder
          </Text>

          <View style={styles.pickerWrap}>
            <DateTimePicker
              value={time}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, selectedDate) => {
                if (selectedDate) setTime(selectedDate);
              }}
              textColor="#fff"
            />
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
    marginBottom: 16,
  },
  pickerWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
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