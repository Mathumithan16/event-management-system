import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/api";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

type Application = {
  id: number;
  event_id: number;
  volunteer_id: number;
  status: string;
  applied_at: string;
  event_title: string;
  volunteer_name: string;
};

export default function AdminApplicationsScreen() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const role = await AsyncStorage.getItem("user_role");

      if (!token) {
        router.replace("/login");
        return;
      }

      if (role !== "ADMIN") {
        Alert.alert(
          "Access Denied",
          "Only administrators can access this page.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/events"),
            },
          ]
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/admin/applications`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Error",
          data.detail || "Could not load applications."
        );
        return;
      }

      setApplications(data);
    } catch (error) {
      console.error("Fetch applications error:", error);

      Alert.alert(
        "Connection Error",
        "Could not connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchApplications();
  }, []);

  const deleteApplication = async (
    applicationId: number
  ) => {
    Alert.alert(
      "Delete Application",
      "Are you sure you want to delete this application?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              const token =
                await AsyncStorage.getItem("access_token");

              if (!token) {
                router.replace("/login");
                return;
              }

              const response = await fetch(
                `${API_URL}/admin/applications/${applicationId}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              const data = await response.json();

              if (!response.ok) {
                Alert.alert(
                  "Delete Failed",
                  data.detail ||
                    "Could not delete application."
                );
                return;
              }

              setApplications(
                (currentApplications) =>
                  currentApplications.filter(
                    (application) =>
                      application.id !== applicationId
                  )
              );

              Alert.alert(
                "Success",
                "Application deleted successfully."
              );
            } catch (error) {
              console.error(
                "Delete application error:",
                error
              );

              Alert.alert(
                "Connection Error",
                "Could not connect to the backend."
              );
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading applications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Manage Applications
      </Text>

      <Pressable
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>
          Back to Admin Dashboard
        </Text>
      </Pressable>

      {applications.length === 0 ? (
        <View style={styles.center}>
          <Text>No applications found.</Text>
        </View>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={(item) =>
            item.id.toString()
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.applicationId}>
                Application #{item.id}
              </Text>

              <Text style={styles.infoText}>
                Event: {item.event_title}
              </Text>

              <Text style={styles.infoText}>
                Volunteer: {item.volunteer_name}
              </Text>

              <Text style={styles.status}>
                Status: {item.status}
              </Text>

              <Text style={styles.infoText}>
                Applied At:{" "}
                {new Date(
                  item.applied_at
                ).toLocaleString()}
              </Text>

              <Pressable
                style={styles.deleteButton}
                onPress={() =>
                  deleteApplication(item.id)
                }
              >
                <Text style={styles.buttonText}>
                  Delete Application
                </Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ffffff",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 15,
  },

  backButton: {
    borderWidth: 1,
    borderColor: "#000000",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },

  backButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },

  card: {
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 10,
    padding: 16,
    marginBottom: 15,
  },

  applicationId: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },

  infoText: {
    fontSize: 15,
    marginBottom: 5,
  },

  status: {
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 8,
  },

  deleteButton: {
    backgroundColor: "#cc0000",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
});