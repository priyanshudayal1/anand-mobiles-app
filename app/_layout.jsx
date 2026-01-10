import { Stack } from "expo-router";
import { LogBox } from "react-native";
import "../index.css";

// Suppress SafeAreaView deprecation warning from expo-router
LogBox.ignoreLogs(["SafeAreaView has been deprecated"]);

export default function RootLayout() {
  return <Stack />;
}
