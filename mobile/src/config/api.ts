import Constants from "expo-constants";
import { Platform } from "react-native";

const getApiHost = (): string => {
  // Web development
  if (Platform.OS === "web") {
    return "127.0.0.1";
  }

  // Expo Go on a physical device
  const hostUri = Constants.expoConfig?.hostUri;

  if (!hostUri) {
    throw new Error(
      "Could not determine the Expo development server address."
    );
  }

  // hostUri normally looks like:
  // 172.19.51.45:8081
  //
  // We only need:
  // 172.19.51.45
  return hostUri.split(":")[0];
};

export const API_URL = `http://${getApiHost()}:8000`;

console.log("API URL:", API_URL);