import { StyleSheet, Text, View, Pressable } from "react-native";
import { Link } from "expo-router";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Event Management</Text>

      <Text style={styles.subtitle}>
        Manage Events and Volunteer Applications
      </Text>

      <Link href="/login" asChild>
        <Pressable style={styles.button} accessibilityRole="button">
          <Text style={styles.buttonText}>Login</Text>
        </Pressable>
      </Link>

      <Link href="/register" asChild>
        <Pressable style={styles.secondaryButton} accessibilityRole="button">
          <Text style={styles.secondaryButtonText}>Create Account</Text>
        </Pressable>
      </Link>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#ffffff",
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666666",
    marginBottom: 40,
  },

  button: {
    width: "100%",
    backgroundColor: "#000000",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },

  secondaryButton: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#000000",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },

  secondaryButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
});