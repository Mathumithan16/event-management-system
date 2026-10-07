import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Application = {
  id: number;
  event_id: number;
  volunteer_id: number;
  status: string;
  applied_at: string;
};

export default function ManageApplicationsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");

      if (!token) {
        Alert.alert("Error", "Please login again");
        return;
      }

      const response = await fetch(
        `http://172.19.51.45:8000/applications/event/${id}`,
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
          data.detail || "Could not load applications"
        );
        return;
      }

      setApplications(data);
    } catch (error) {
      console.error("Applications error:", error);

      Alert.alert(
        "Connection Error",
        "Could not connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [id]);

  const updateApplication = async (
    applicationId: number,
    status: "ACCEPTED" | "REJECTED"
  ) => {
    try {
      const token = await AsyncStorage.getItem("access_token");

      if (!token) {
        Alert.alert("Error", "Please login again");
        return;
      }

      const response = await fetch(
        `http://172.20.97.59:8000/applications/${applicationId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Update Failed",
          data.detail || "Could not update application"
        );
        return;
      }

      Alert.alert(
        "Success",
        `Application ${status.toLowerCase()} successfully`
      );

      fetchApplications();
    } catch (error) {
      console.error("Update application error:", error);

      Alert.alert(
        "Connection Error",
        "Could not connect to the backend."
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading applications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Event Applications</Text>

      {applications.length === 0 ? (
        <Text style={styles.empty}>
          No applications yet.
        </Text>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.applicationTitle}>
                Application #{item.id}
              </Text>

              <Text>
                Volunteer ID: {item.volunteer_id}
              </Text>

              <Text>
                Status: {item.status}
              </Text>

              <Text>
                Applied At:{" "}
                {new Date(item.applied_at).toLocaleString()}
              </Text>

              {item.status === "PENDING" && (
                <View style={styles.buttons}>
                  <Pressable
                    style={styles.acceptButton}
                    onPress={() =>
                      updateApplication(item.id, "ACCEPTED")
                    }
                  >
                    <Text style={styles.buttonText}>
                      Accept
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.rejectButton}
                    onPress={() =>
                      updateApplication(item.id, "REJECTED")
                    }
                  >
                    <Text style={styles.buttonText}>
                      Reject
                    </Text>
                  </Pressable>
                </View>
              )}
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
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },

  empty: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 30,
  },

  card: {
    backgroundColor: "#f2f2f2",
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
  },

  applicationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  buttons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 15,
  },

  acceptButton: {
    flex: 1,
    backgroundColor: "green",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  rejectButton: {
    flex: 1,
    backgroundColor: "red",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});