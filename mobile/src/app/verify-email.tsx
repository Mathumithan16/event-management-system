import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { API_URL, readApiResponse } from "../config/api";

export default function VerifyEmailScreen() {
  const { email: registeredEmail } = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(registeredEmail ?? "");
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleVerify = async () => {
    if (!email.trim() || !/^\d{6}$/.test(otp)) {
      Alert.alert("Check your details", "Enter your email and 6-digit code.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp }),
      });
      const data = await readApiResponse(response);

      if (!response.ok) {
        Alert.alert(
          "Verification Failed",
          data.detail || `Request failed with status ${response.status}.`
        );
        return;
      }

      Alert.alert("Email verified", "You can now log in.", [
        { text: "OK", onPress: () => router.replace("/login") },
      ]);
    } catch (error) {
      console.error("Email verification error:", error);
      Alert.alert("Connection Error", "Could not connect to the backend.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      Alert.alert("Email required", "Enter the email address you registered with.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await readApiResponse(response);

      Alert.alert(
        response.ok ? "Code sent" : "Could not send code",
        data.message ||
          data.detail ||
          `Request failed with status ${response.status}.`
      );
    } catch (error) {
      console.error("Resend verification error:", error);
      Alert.alert("Connection Error", "Could not connect to the backend.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify your email</Text>
      <Text style={styles.description}>
        Enter the 6-digit code we sent to your email address.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />

      <TextInput
        style={styles.input}
        placeholder="6-digit verification code"
        value={otp}
        onChangeText={(value) => setOtp(value.replace(/\D/g, "").slice(0, 6))}
        keyboardType="number-pad"
        maxLength={6}
      />

      <Pressable
        style={[styles.button, submitting && styles.disabledButton]}
        onPress={handleVerify}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>Verify email</Text>
      </Pressable>

      <Pressable
        style={styles.resendButton}
        onPress={handleResend}
        disabled={submitting}
      >
        <Text style={styles.resendText}>Resend code</Text>
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
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 28,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#000000",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  resendButton: {
    alignItems: "center",
    paddingVertical: 16,
  },
  resendText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
