import Toast from "react-native-toast-message";

type ToastType = "success" | "error" | "info";

export const showToast = (type: ToastType, message: string) => {
  let backgroundColor: string;

  switch (type) {
    case "success":
      backgroundColor = "#32CD32"; // Green
      break;
    case "error":
      backgroundColor = "#FF4444"; // Red
      break;
    case "info":
      backgroundColor = "#FFD700"; // Yellow
      break;
  }

  Toast.show({
    type: type,
    text1:
      type === "success"
        ? "Success"
        : type === "error"
          ? "Error"
          : type === "info"
            ? "Delete"
            : "warning",
    text2: message,
    props: { backgroundColor },
    position: "top",
    visibilityTime: 3000,
  });
};
