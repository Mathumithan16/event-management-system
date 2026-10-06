import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

export default function AdminDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>

      <Pressable
        style={styles.button}
        onPress={() => router.push("/admin-users")}
      >
        <Text style={styles.buttonText}>
          Manage Users
        </Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() => router.push("/admin-applications")}
      >
        <Text style={styles.buttonText}>
          Manage Applications
        </Text>
      </Pressable>

      <Pressable
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>
          Back
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
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
  },

  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
  },

  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },

  backButton: {
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginTop: 10,
  },

  backButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});