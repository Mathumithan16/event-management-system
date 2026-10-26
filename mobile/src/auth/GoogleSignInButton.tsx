import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Platform,
  StyleSheet,
  Text,
} from "react-native";
import { router } from "expo-router";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

import { saveLoginResponse } from "./session";
import { API_URL, getApiConnectionError } from "../config/api";

WebBrowser.maybeCompleteAuthSession();

type GoogleSignInButtonProps = {
  role: "VOLUNTEER" | "ORGANIZER";
  disabled?: boolean;
};

const googleClientIds = {
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
};

function showAlert(title: string, message: string) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    return;
  }

  Alert.alert(title, message);
}

export default function GoogleSignInButton({
  role,
  disabled = false,
}: GoogleSignInButtonProps) {
  const hasPlatformClientId =
    (Platform.OS === "web" && Boolean(googleClientIds.webClientId)) ||
    (Platform.OS === "android" && Boolean(googleClientIds.androidClientId)) ||
    Boolean(googleClientIds.webClientId);

  if (!hasPlatformClientId) {
    return (
      <Pressable
        style={[styles.button, disabled && styles.disabledButton]}
        onPress={() =>
          showAlert(
            "Google Sign-In Not Configured",
            `Set EXPO_PUBLIC_GOOGLE_${Platform.OS.toUpperCase()}_CLIENT_ID in mobile/.env.local and restart Expo.`,
          )
        }
        disabled={disabled}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Continue with Google</Text>
      </Pressable>
    );
  }

  return <ConfiguredGoogleSignInButton role={role} disabled={disabled} />;
}

function ConfiguredGoogleSignInButton({
  role,
  disabled,
}: GoogleSignInButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [request, , promptAsync] = Google.useIdTokenAuthRequest({
    ...googleClientIds,
  });

  const handleGoogleSignIn = async () => {
    if (isSubmitting || disabled) return;

    if (!request) {
      showAlert(
        "Please Wait",
        "Google sign-in is still initializing. Try again shortly.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await promptAsync();
      if (result.type === "cancel" || result.type === "dismiss") return;
      if (result.type !== "success") {
        throw new Error("Google sign-in could not be completed.");
      }

      const credential =
        result.params?.id_token ?? result.authentication?.idToken;
      if (!credential) {
        throw new Error("Google did not return an ID token.");
      }

      const response = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ credential, role }),
      });

      if (response.status === 403) {
        const data = await response.json().catch(() => null);
        const detail =
          data?.detail || "Your organizer account is pending admin approval";
        showAlert("Account Pending Approval", detail);
        router.replace("/login");
        return;
      }

      await saveLoginResponse(response);
      router.replace("/events");
    } catch (error) {
      console.error("Google sign-in error:", error);
      showAlert(
        getApiConnectionError(error)
          ? "Connection Error"
          : "Google Sign-In Failed",
        getApiConnectionError(error) ??
          (error instanceof Error
            ? error.message
            : "Could not complete Google sign-in."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Pressable
      style={[styles.button, isSubmitting && styles.disabledButton]}
      onPress={handleGoogleSignIn}
      disabled={isSubmitting || disabled}
      accessibilityRole="button"
    >
      {isSubmitting ? (
        <ActivityIndicator color="#222222" />
      ) : (
        <Text style={styles.buttonText}>Continue with Google</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#222222",
    fontSize: 16,
    fontWeight: "600",
  },
});
