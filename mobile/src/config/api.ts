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

const getApiUrl = (): string => {
  // Web development: always connect to the local host (localhost / 127.0.0.1 or current hostname)
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.location?.hostname) {
      return `http://${window.location.hostname}:8000`;
    }
    return "http://127.0.0.1:8000";
  }

  const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (configuredApiUrl) {
    return configuredApiUrl.replace(/\/+$/, "");
  }

  return `http://${getApiHost()}:8000`;
};

export const API_URL = getApiUrl();

export type ApiResponseBody = {
  detail?: string;
  message?: string;
};

export async function readApiResponse(
  response: Response,
): Promise<ApiResponseBody> {
  const body = await response.text();
  if (!body.trim()) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(body);
    if (typeof parsed === "object" && parsed !== null) {
      const detail =
        "detail" in parsed && typeof parsed.detail === "string"
          ? parsed.detail
          : undefined;
      const message =
        "message" in parsed && typeof parsed.message === "string"
          ? parsed.message
          : undefined;
      return { detail, message };
    }
  } catch {
    return {
      detail: `Server returned HTTP ${response.status}: ${body.trim().slice(0, 300)}`,
    };
  }

  return {
    detail: `Server returned HTTP ${response.status}: ${body.trim().slice(0, 300)}`,
  };
}

export function getApiConnectionError(error: unknown): string | undefined {
  const message = error instanceof Error ? error.message : String(error);
  if (!/(failed to fetch|fetch failed|network request failed|network error|timed out)/i.test(message)) {
    return undefined;
  }

  return (
    `Cannot reach the API at ${API_URL}. ` +
    "Start the backend with backend/run.bat, make sure it listens on 0.0.0.0:8000, " +
    "and connect your phone and computer to the same Wi-Fi. " +
    "On your phone, open the computer's IPv4 address at port 8000 in a browser."
  );
}

console.log("API URL:", API_URL);