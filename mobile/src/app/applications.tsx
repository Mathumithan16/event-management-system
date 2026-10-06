import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ActivityIndicator,
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
  event_title: string;
  event_location: string;
  event_date: string;
};

export default function ApplicationsScreen() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");

      if (!token) {
        console.log("No access token found");
        return;
      }

      const response = await fetch(
        "http://172.19.51.45:8000/applications/my",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseText = await response.text();
      let data: unknown;

      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch {
        throw new Error(
          `Applications API returned a non-JSON response (${response.status}): ${responseText.slice(
            0,
            200
          )}`
        );
      }

      if (!response.ok) {
        const detail =
          typeof data === "object" &&
          data !== null &&
          "detail" in data &&
          typeof data.detail === "string"
            ? data.detail
            : `Request failed with status ${response.status}`;

        throw new Error(detail);
      }

      if (!Array.isArray(data)) {
        throw new Error(
          "Applications API returned an invalid response."
        );
      }

      setApplications(data as Application[]);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchApplications();
  }, []);

  const cancelApplication = async (applicationId: number) => {
    Alert.alert(
      "Cancel Application",
      "Are you sure you want to cancel this application?",
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
              const token = await AsyncStorage.getItem(
                "access_token"
              );

              if (!token) {
                Alert.alert("Error", "Please login again");
                return;
              }

              const response = await fetch(
                `http://172.19.51.45:8000/applications/${applicationId}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              const responseText = await response.text();

              let data: any = null;

              try {
                data = responseText
                  ? JSON.parse(responseText)
                  : null;
              } catch {
                data = null;
              }

              if (!response.ok) {
                Alert.alert(
                  "Cancel Failed",
                  data?.detail ||
                    "Could not cancel application"
                );
                return;
              }

      Alert.alert(
  "Success",
  "Application cancelled successfully!"
);

setApplications((currentApplications) =>
  currentApplications.filter(
    (application) => application.id !== applicationId
  )
);
            } catch (error) {
              console.error(
                "Cancel application error:",
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
      <Text style={styles.title}>My Applications</Text>

      {applications.length === 0 ? (
        <View style={styles.center}>
          <Text>No applications found.</Text>
        </View>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.eventTitle}>
                {item.event_title}
              </Text>

              <Text style={styles.location}>
                Location: {item.event_location}
              </Text>

              <Text>
                Date:{" "}
                {new Date(item.event_date).toLocaleString()}
              </Text>

              <Text style={styles.status}>
                Status: {item.status}
              </Text>

              <Text>
                Applied At:{" "}
                {new Date(
                  item.applied_at
                ).toLocaleString()}
              </Text>

              {item.status === "PENDING" && (
                <Pressable
                  style={styles.cancelButton}
                  onPress={() =>
                    cancelApplication(item.id)
                  }
                >
                  <Text style={styles.cancelButtonText}>
                    Cancel Application
                  </Text>
                </Pressable>
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
    marginBottom: 20,
  },

  card: {
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 10,
    padding: 16,
    marginBottom: 15,
  },

  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  location: {
    marginBottom: 8,
  },

  status: {
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 8,
  },

  cancelButton: {
    backgroundColor: "#cc0000",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },

  cancelButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
});