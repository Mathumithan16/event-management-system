import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

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

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
const [showStatusMenu, setShowStatusMenu] = useState(false);
  const fetchEvent = async () => {
    try {
      const response = await fetch(
        `http://172.19.51.45:8000/events/${id}`
      );

      const data = await response.json();

      if (!response.ok) {
        console.log("Failed to get event:", data);
        return;
      }

      setEvent(data);
    } catch (error) {
      console.error("Error fetching event:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  useEffect(() => {
    const loadUserRole = async () => {
      try {
       const role = await AsyncStorage.getItem("user_role");
const storedUserId = await AsyncStorage.getItem("user_id");

setUserRole(role);

if (storedUserId) {
  setUserId(Number(storedUserId));
}
      } catch (error) {
        console.error("Error loading user role:", error);
      }
    };

    loadUserRole();
  }, []);

  const deleteEvent = async () => {
    if (!event) {
      return;
    }

    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
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
                `http://172.19.51.45:8000/events/${event.id}`,
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
                  data.detail || "Could not delete event"
                );
                return;
              }

              Alert.alert(
                "Success",
                "Event deleted successfully!",
                [
                  {
                    text: "OK",
                    onPress: () =>
                      router.replace("/events"),
                  },
                ]
              );
            } catch (error) {
              console.error(
                "Delete event error:",
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

  const applyForEvent = async () => {
    if (!event) {
      return;
    }

    try {
      const token = await AsyncStorage.getItem(
        "access_token"
      );

      if (!token) {
        Alert.alert("Error", "Please login again");
        return;
      }

      const response = await fetch(
        "http://172.19.51.45:8000/applications/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            event_id: event.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Application Failed",
          data.detail || "Could not apply for event"
        );
        return;
      }

      Alert.alert(
        "Success",
        "Application submitted successfully!"
      );
    } catch (error) {
      console.error("Application error:", error);

      Alert.alert(
        "Connection Error",
        "Could not connect to the backend."
      );
    }
  };

  const updateEventStatus = async (status: string) => {
    if (!event) {
      return;
    }

    try {
      const token = await AsyncStorage.getItem(
        "access_token"
      );

      if (!token) {
        Alert.alert("Error", "Please login again");
        return;
      }

      const response = await fetch(
        `http://172.19.51.45:8000/events/${event.id}/status`,
        {
          method: "PATCH",
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
          data.detail || "Could not update event status"
        );
        return;
      }

      setEvent(data);

      Alert.alert(
        "Success",
        "Event status updated successfully!"
      );
    } catch (error) {
      console.error("Update status error:", error);

      Alert.alert(
        "Connection Error",
        "Could not connect to the backend."
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading event...</Text>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.center}>
        <Text>Event not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{event.title}</Text>

      <Text style={styles.label}>Description</Text>
      <Text style={styles.value}>
        {event.description}
      </Text>

      <Text style={styles.label}>Location</Text>
      <Text style={styles.value}>
        {event.location}
      </Text>

      <Text style={styles.label}>Date</Text>
      <Text style={styles.value}>
        {new Date(event.date).toLocaleString()}
      </Text>

      <Text style={styles.label}>Status</Text>
      <Text style={styles.value}>{event.status}</Text>

      {userRole === "ORGANIZER" &&
  userId === event.organizer_id && (
    <View>
      <Text style={styles.label}>
        Update Status
      </Text>

      <Pressable
        style={styles.statusDropdownButton}
        onPress={() =>
          setShowStatusMenu(!showStatusMenu)
        }
      >
        <Text style={styles.statusDropdownText}>
          {event.status}
        </Text>

        <Text style={styles.dropdownArrow}>
          {showStatusMenu ? "▲" : "▼"}
        </Text>
      </Pressable>

      {showStatusMenu && (
        <View style={styles.statusMenu}>
          <Pressable
            style={styles.statusMenuItem}
            onPress={() => {
              updateEventStatus("UPCOMING");
              setShowStatusMenu(false);
            }}
          >
            <Text style={styles.statusMenuText}>
              Upcoming
            </Text>
          </Pressable>

          <Pressable
            style={styles.statusMenuItem}
            onPress={() => {
              updateEventStatus("ONGOING");
              setShowStatusMenu(false);
            }}
          >
            <Text style={styles.statusMenuText}>
              Ongoing
            </Text>
          </Pressable>

          <Pressable
            style={styles.statusMenuItem}
            onPress={() => {
              updateEventStatus("COMPLETED");
              setShowStatusMenu(false);
            }}
          >
            <Text style={styles.statusMenuText}>
              Completed
            </Text>
          </Pressable>

          <Pressable
            style={styles.statusMenuItem}
            onPress={() => {
              updateEventStatus("CANCELLED");
              setShowStatusMenu(false);
            }}
          >
            <Text style={styles.statusMenuText}>
              Cancelled
            </Text>
          </Pressable>
        </View>
      )}
    </View>
)}

      <Text style={styles.label}>
        Maximum Volunteers
      </Text>

      <Text style={styles.value}>
        {event.max_volunteers}
      </Text>

      {userRole === "VOLUNTEER" && (
        <Pressable
          style={styles.button}
          onPress={applyForEvent}
        >
          <Text style={styles.buttonText}>
            Apply for Event
          </Text>
        </Pressable>
      )}

      {userRole === "ORGANIZER" &&
      userId === event.organizer_id && (
        <Pressable
          style={styles.button}
          onPress={() =>
            router.push({
              pathname: "/edit-event",
              params: {
                id: event.id.toString(),
              },
            })
          }
        >
          <Text style={styles.buttonText}>
            Edit Event
          </Text>
        </Pressable>
      )}

      {userRole === "ORGANIZER" &&
      userId === event.organizer_id && (
        <Pressable
          style={styles.button}
          onPress={() =>
            router.push({
              pathname: "/manage-applications",
              params: {
                id: event.id.toString(),
              },
            })
          }
        >
          <Text style={styles.buttonText}>
            Manage Applications
          </Text>
        </Pressable>
      )}

      {userRole === "ORGANIZER" &&
      userId === event.organizer_id && (
        <Pressable
          style={styles.deleteButton}
          onPress={deleteEvent}
        >
          <Text style={styles.buttonText}>
            Delete Event
          </Text>
        </Pressable>
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
    marginBottom: 30,
  },

  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
  },

  value: {
    fontSize: 16,
  },

  button: {
    backgroundColor: "#000000",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },

  statusButton: {
    backgroundColor: "#000000",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },

  statusButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },

  deleteButton: {
    backgroundColor: "#cc0000",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  statusDropdownButton: {
  borderWidth: 1,
  borderColor: "#cccccc",
  borderRadius: 8,
  paddingVertical: 12,
  paddingHorizontal: 15,
  marginTop: 5,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

statusDropdownText: {
  fontSize: 15,
  fontWeight: "600",
},

dropdownArrow: {
  fontSize: 14,
},

statusMenu: {
  borderWidth: 1,
  borderColor: "#cccccc",
  borderRadius: 8,
  marginTop: 5,
  overflow: "hidden",
},

statusMenuItem: {
  paddingVertical: 12,
  paddingHorizontal: 15,
  borderBottomWidth: 1,
  borderBottomColor: "#eeeeee",
},

statusMenuText: {
  fontSize: 15,
},
});