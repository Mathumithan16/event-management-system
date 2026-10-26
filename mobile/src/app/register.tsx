
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import {
  API_URL,
  getApiConnectionError,
  readApiResponse,
} from "../config/api";
import GoogleSignInButton from "../auth/GoogleSignInButton";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"VOLUNTEER" | "ORGANIZER">(
    "VOLUNTEER"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password) {
      Alert.alert("Missing Details", "Please fill in all fields.");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      console.log("Registering with API:", API_URL);

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          password,
          role,
        }),
      });

      const data = await readApiResponse(response);

      console.log("Registration HTTP status:", response.status);
      console.log("Registration response:", data);

      if (!response.ok) {
        const detail =
          data &&
          typeof data === "object" &&
          "detail" in data &&
          typeof data.detail === "string"
            ? data.detail
            : `Registration failed (HTTP ${response.status}).`;

        Alert.alert("Registration Failed", detail);
        return;
      }

      router.replace({
        pathname: "/verify-email",
        params: { email: cleanEmail },
      });
    } catch (error) {
      console.error("Registration error:", error);

      const reason =
        getApiConnectionError(error) ??
        (error instanceof Error ? error.message : String(error));

      Alert.alert(
        "Connection Error",
        `Could not complete registration.\n\nAPI: ${API_URL}\nError: ${reason}\n\nCheck your backend terminal for details.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
        editable={!isSubmitting}
        autoCapitalize="words"
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isSubmitting}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isSubmitting}
      />

      <Text style={styles.label}>Select Role</Text>

      <View style={styles.roleContainer}>
        <Pressable
          style={[
            styles.roleButton,
            role === "VOLUNTEER" && styles.selectedRole,
          ]}
          disabled={isSubmitting}
          onPress={() => setRole("VOLUNTEER")}
        >
          <Text
            style={[
              styles.roleText,
              role === "VOLUNTEER" && styles.selectedRoleText,
            ]}
          >
            Volunteer
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.roleButton,
            role === "ORGANIZER" && styles.selectedRole,
          ]}
          disabled={isSubmitting}
          onPress={() => setRole("ORGANIZER")}
        >
          <Text
            style={[
              styles.roleText,
              role === "ORGANIZER" && styles.selectedRoleText,
            ]}
          >
            Organizer
          </Text>
        </Pressable>
      </View>

      <Pressable
        style={[
          styles.registerButton,
          isSubmitting && styles.disabledButton,
        ]}
        onPress={handleRegister}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.registerButtonText}>
            Create Account
          </Text>
        )}
      </Pressable>

      <Text style={styles.separator}>or sign up with</Text>
      <GoogleSignInButton role={role} disabled={isSubmitting} />

      <Pressable
        style={styles.loginButton}
        disabled={isSubmitting}
        onPress={() => router.replace("/login")}
      >
        <Text style={styles.loginButtonText}>
          Already have an account? Login
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  roleContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#000000",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  selectedRole: {
    backgroundColor: "#000000",
  },
  roleText: {
    fontSize: 15,
    fontWeight: "600",
  },
  selectedRoleText: {
    color: "#ffffff",
  },
  registerButton: {
    backgroundColor: "#000000",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
    minHeight: 50,
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  loginButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
  loginButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  separator: {
    textAlign: "center",
    color: "#666666",
    marginVertical: 2,
  },
});
