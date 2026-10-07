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
import { router } from "expo-router";

type Event = {
  id: number;
  title: string;
  description: string;
  location: string;
  date: string;
  max_volunteers: number;
  organizer_id: number;
  status: string;
};

export default function MyEventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyEvents = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const role = await AsyncStorage.getItem("user_role");

      if (!token) {
        router.replace("/login");
        return;
      }

      if (role !== "ORGANIZER") {
        Alert.alert(
          "Access Denied",
          "Only organizers can access My Events.",
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
        "http://172.20.97.59:8000/events/my",
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
          data.detail || "Could not load your events."
        );
        return;
      }

      setEvents(data);
    } catch (error) {
      console.error("Fetch my events error:", error);

      Alert.alert(
        "Connection Error",
        "Could not connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchMyEvents();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading your events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Events</Text>

      {events.length === 0 ? (
        <View style={styles.center}>
          <Text>You have not created any events yet.</Text>

          <Pressable
            style={styles.createButton}
            onPress={() => router.push("/create-event")}
          >
            <Text style={styles.buttonText}>
              Create Event
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.eventTitle}>
                {item.title}
              </Text>

              <Text style={styles.description}>
                {item.description}
              </Text>

              <Text>
                Location: {item.location}
              </Text>

              <Text>
                Date:{" "}
                {new Date(item.date).toLocaleString()}
              </Text>

              <Text>
                Maximum Volunteers:{" "}
                {item.max_volunteers}
              </Text>

              <Text style={styles.status}>
                Status: {item.status}
              </Text>

              <Pressable
                style={styles.viewButton}
                onPress={() =>
                router.push({
  pathname: "/event-details",
  params: {
    id: item.id.toString(),
  },
})
                }
              >
                <Text style={styles.buttonText}>
                  View Event
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
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },

  description: {
    marginBottom: 10,
  },

  status: {
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 12,
  },

  viewButton: {
    backgroundColor: "#000000",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },

  createButton: {
    backgroundColor: "#000000",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
});
