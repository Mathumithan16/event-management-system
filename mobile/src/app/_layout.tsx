import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="login"
        options={{
          title: "Login",
        }}
      />

      <Stack.Screen
        name="register"
        options={{ title: "Create Account" }}
      />

      <Stack.Screen
        name="events"
        options={{
          title: "Events",
        }}
      />

      <Stack.Screen
        name="event-details"
        options={{
          title: "Event Details",
        }}
      />

      <Stack.Screen
        name="applications"
        options={{
          title: "My Applications",
        }}
      />

      <Stack.Screen
        name="manage-applications"
        options={{
          title: "Manage Applications",
        }}
      />

      <Stack.Screen
        name="create-event"
        options={{
          title: "Create Event",
        }}
      />

      <Stack.Screen
        name="edit-event"
        options={{
          title: "Edit Event",
        }}
      />

      <Stack.Screen
        name="admin"
        options={{ title: "Admin Dashboard" }}
      />

      <Stack.Screen
        name="admin-users"
        options={{ title: "Manage Users" }}
      />

      <Stack.Screen
        name="admin-applications"
        options={{ title: "Manage Applications" }}
      />

      <Stack.Screen
       name="my-events"
       options={{title: "My Events"}}
       />

      <Stack.Screen
        name="explore"
        options={{
          title: "Explore",
        }}
      />

    </Stack>
  );
}