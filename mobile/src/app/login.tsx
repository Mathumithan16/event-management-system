import { useState } from "react";
import {
  Alert,
  Pressable,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";

import GoogleSignInButton from "../auth/GoogleSignInButton";
import { saveLoginResponse } from "../auth/session";
import { API_URL, getApiConnectionError } from "../config/api";

function showLoginAlert(title: string, message: string) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    return;
  }

  Alert.alert(title, message);
}

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      showLoginAlert("Error", "Please enter email and password.");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body:
          `username=${encodeURIComponent(email.trim())}` +
          `&password=${encodeURIComponent(password)}`,
      });

      await saveLoginResponse(response);
      router.replace("/events");
    } catch (error) {
      console.error("Login error:", error);
      showLoginAlert(
        getApiConnectionError(error) ? "Connection Error" : "Login Failed",
        getApiConnectionError(error) ??
          (error instanceof Error
            ? error.message
            : "Could not connect to the backend."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
        editable={!isSubmitting}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!isSubmitting}
      />

      <Pressable
        style={[styles.button, isSubmitting && styles.disabledButton]}
        onPress={handleLogin}
        disabled={isSubmitting}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>

      <Text style={styles.separator}>or</Text>
      <GoogleSignInButton role="VOLUNTEER" />

      <Pressable
        style={styles.registerButton}
        disabled={isSubmitting}
        onPress={() => router.replace("/register")}
      >
        <Text style={styles.registerText}>Create an account</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#000000",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
    minHeight: 50,
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  separator: {
    textAlign: "center",
    color: "#666666",
    marginTop: 14,
  },
  registerButton: {
    alignItems: "center",
    paddingVertical: 16,
  },
  registerText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
