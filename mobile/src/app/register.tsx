import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"VOLUNTEER" | "ORGANIZER">("VOLUNTEER");

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch(
        "http://172.19.51.45:8000/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
            role,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Registration Failed",
          data.detail || "Could not create account."
        );
        return;
      }

      Alert.alert(
        "Success",
        "Account created successfully!",
        [
          {
            text: "OK",
            onPress: () => router.replace("/login"),
          },
        ]
      );
    } catch (error) {
      console.error("Registration error:", error);

      Alert.alert(
        "Connection Error",
        "Could not connect to the backend."
      );
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
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={styles.label}>Select Role</Text>

      <View style={styles.roleContainer}>
        <Pressable
          style={[
            styles.roleButton,
            role === "VOLUNTEER" && styles.selectedRole,
          ]}
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
        style={styles.registerButton}
        onPress={handleRegister}
      >
        <Text style={styles.registerButtonText}>
          Create Account
        </Text>
      </Pressable>

      <Pressable
        style={styles.loginButton}
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
});
