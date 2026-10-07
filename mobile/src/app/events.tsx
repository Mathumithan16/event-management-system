import { useEffect, useState } from "react";
import { router } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/api";

type Event = {
  id: number;
  title: string;
  description: string;
  location: string;
  date: string;
  max_volunteers: number;
  organizer_id: number;
  created_at: string;
  status: string;
};

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/events/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.log("Failed to get events:", data);
        return;
      }

      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserRole = async () => {
    try {
      const role = await AsyncStorage.getItem("user_role");
      setUserRole(role);
    } catch (error) {
      console.error("Error loading user role:", error);
    }
  };

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("access_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      fetchEvents();
      loadUserRole();
    };

    checkLogin();
  }, []);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("access_token");
      await AsyncStorage.removeItem("user_role");
      await AsyncStorage.removeItem("user_id");

      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Events</Text>

      {/* Logout */}
      <Pressable
        style={styles.logoutButton}
        onPress={logout}
      >
        <Text style={styles.logoutButtonText}>
          Logout
        </Text>
      </Pressable>

      {/* Organizer Controls */}
      {userRole === "ORGANIZER" && (
        <>
          <Pressable
            style={styles.createButton}
            onPress={() => router.push("/create-event")}
          >
            <Text style={styles.createButtonText}>
              Create Event
            </Text>
          </Pressable>

          <Pressable
            style={styles.createButton}
            onPress={() => router.push("/my-events")}
          >
            <Text style={styles.createButtonText}>
              My Events
            </Text>
          </Pressable>
        </>
      )}

      {/* Admin Controls */}
      {userRole === "ADMIN" && (
        <Pressable
          style={styles.createButton}
          onPress={() => router.push("/admin")}
        >
          <Text style={styles.createButtonText}>
            Admin Dashboard
          </Text>
        </Pressable>
      )}

      {/* Volunteer - My Applications */}
      {userRole === "VOLUNTEER" && (
        <Pressable
          style={styles.applicationButton}
          onPress={() => router.push("/applications")}
        >
          <Text style={styles.applicationButtonText}>
            My Applications
          </Text>
        </Pressable>
      )}

      {/* Event List */}
      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/event-details",
                params: {
                  id: item.id.toString(),
                },
              })
            }
          >
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
              Status: {item.status}
            </Text>

            <Text>
              Maximum Volunteers:{" "}
              {item.max_volunteers}
            </Text>

            <Text>
              Date:{" "}
              {new Date(item.date).toLocaleString()}
            </Text>
          </Pressable>
        )}
      />
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
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
  },

  logoutButton: {
    borderWidth: 1,
    borderColor: "#000000",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },

  logoutButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },

  createButton: {
    backgroundColor: "#000000",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },

  createButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },

  applicationButton: {
    backgroundColor: "#000000",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },

  applicationButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
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
});
