import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

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

export default function EditEventScreen() {
  const { id } = useLocalSearchParams();

  const [event, setEvent] = useState<Event | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [maxVolunteers, setMaxVolunteers] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load event
  const fetchEvent = async () => {
    try {
      const response = await fetch(
        `http://172.19.51.45:8000/events/${id}`
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Error",
          data.detail || "Could not load event"
        );
        return;
      }

      setEvent(data);

      setTitle(data.title);
      setDescription(data.description);
      setLocation(data.location);

      // Convert backend date to editable format
      const eventDate = new Date(data.date);

      const formattedDate =
        `${eventDate.getFullYear()}-` +
        `${String(eventDate.getMonth() + 1).padStart(2, "0")}-` +
        `${String(eventDate.getDate()).padStart(2, "0")}T` +
        `${String(eventDate.getHours()).padStart(2, "0")}:` +
        `${String(eventDate.getMinutes()).padStart(2, "0")}`;

      setDate(formattedDate);
      setMaxVolunteers(
        data.max_volunteers.toString()
      );
    } catch (error) {
      console.error(
        "Error loading event:",
        error
      );

      Alert.alert(
        "Connection Error",
        "Could not connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  // Update event
  const updateEvent = async () => {
    if (
      !title ||
      !description ||
      !location ||
      !date ||
      !maxVolunteers
    ) {
      Alert.alert(
        "Error",
        "Please fill in all fields"
      );
      return;
    }

    const maxVolunteersNumber = Number(maxVolunteers);

    if (
      !Number.isInteger(maxVolunteersNumber) ||
      maxVolunteersNumber <= 0
    ) {
      Alert.alert(
        "Error",
        "Maximum volunteers must be a positive number"
      );
      return;
    }

    const eventDate = new Date(date);

    if (isNaN(eventDate.getTime())) {
      Alert.alert(
        "Error",
        "Please enter a valid date"
      );
      return;
    }

    try {
      setSaving(true);

      const token = await AsyncStorage.getItem(
        "access_token"
      );

      if (!token) {
        Alert.alert(
          "Error",
          "Please login again"
        );
        return;
      }

      const response = await fetch(
        `http://172.20.97.59:8000/events/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title,
            description: description,
            location: location,
            date: eventDate.toISOString(),
            max_volunteers: maxVolunteersNumber,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Update Failed",
          data.detail || "Could not update event"
        );
        return;
      }

      Alert.alert(
        "Success",
        "Event updated successfully!",
        [
          {
            text: "OK",
            onPress: () =>
              router.replace({
                pathname: "/event-details",
                params: {
                  id: id?.toString(),
                },
              }),
          },
        ]
      );
    } catch (error) {
      console.error(
        "Update event error:",
        error
      );

      Alert.alert(
        "Connection Error",
        "Could not connect to the backend."
      );
    } finally {
      setSaving(false);
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
    <ScrollView
      contentContainerStyle={styles.container}
    >
      <Text style={styles.title}>
        Edit Event
      </Text>

      <Text style={styles.label}>
        Event Title
      </Text>

      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Event title"
      />

      <Text style={styles.label}>
        Description
      </Text>

      <TextInput
        style={[
          styles.input,
          styles.descriptionInput,
        ]}
        value={description}
        onChangeText={setDescription}
        placeholder="Event description"
        multiline
      />

      <Text style={styles.label}>
        Location
      </Text>

      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="Event location"
      />

      <Text style={styles.label}>
        Date and Time
      </Text>

      <TextInput
        style={styles.input}
        value={date}
        onChangeText={setDate}
        placeholder="2026-11-15T14:30"
        autoCapitalize="none"
      />

      <Text style={styles.helpText}>
        Use format: YYYY-MM-DDTHH:MM
      </Text>

      <Text style={styles.label}>
        Maximum Volunteers
      </Text>

      <TextInput
        style={styles.input}
        value={maxVolunteers}
        onChangeText={setMaxVolunteers}
        placeholder="Example: 20"
        keyboardType="numeric"
      />

      <Pressable
        style={[
          styles.button,
          saving && styles.disabledButton,
        ]}
        onPress={updateEvent}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          {saving
            ? "Saving Changes..."
            : "Save Changes"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#ffffff",
    flexGrow: 1,
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
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#ffffff",
  },

  descriptionInput: {
    height: 100,
    textAlignVertical: "top",
  },

  helpText: {
    fontSize: 13,
    color: "#666666",
    marginTop: 5,
  },

  button: {
    backgroundColor: "#000000",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
    marginBottom: 30,
  },

  disabledButton: {
    opacity: 0.5,
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});