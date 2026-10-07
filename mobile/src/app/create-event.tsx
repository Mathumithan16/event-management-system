import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function CreateEventScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [maxVolunteers, setMaxVolunteers] = useState("");
  const [loading, setLoading] = useState(false);

  const createEvent = async () => {
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
      setLoading(true);

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
        "http://172.20.97.59:8000/events/",
        {
          method: "POST",
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
          "Create Event Failed",
          data.detail || "Could not create event"
        );
        return;
      }

      Alert.alert(
        "Success",
        "Event created successfully!",
        [
          {
            text: "OK",
            onPress: () => router.replace("/events"),
          },
        ]
      );
    } catch (error) {
      console.error(
        "Create event error:",
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

  return (
    <ScrollView
      contentContainerStyle={styles.container}
    >
      <Text style={styles.title}>
        Create Event
      </Text>

      <Text style={styles.label}>
        Event Title
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter event title"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>
        Description
      </Text>

      <TextInput
        style={[
          styles.input,
          styles.descriptionInput,
        ]}
        placeholder="Enter event description"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>
        Location
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter event location"
        value={location}
        onChangeText={setLocation}
      />

      <Text style={styles.label}>
        Date and Time
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Example: 2026-11-15T14:30"
        value={date}
        onChangeText={setDate}
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
        placeholder="Example: 20"
        value={maxVolunteers}
        onChangeText={setMaxVolunteers}
        keyboardType="numeric"
      />

      <Pressable
        style={[
          styles.button,
          loading && styles.disabledButton,
        ]}
        onPress={createEvent}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading
            ? "Creating Event..."
            : "Create Event"}
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

  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 30,
  },

  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 15,
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