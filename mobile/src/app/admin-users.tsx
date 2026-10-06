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

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
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
        "http://172.19.51.45:8000/admin/users",
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
          data.detail || "Could not load users."
        );
        return;
      }

      setUsers(data);
    } catch (error) {
      console.error("Fetch users error:", error);

      Alert.alert(
        "Connection Error",
        "Could not connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, []);

  const changeRole = async (
    userId: number,
    newRole: "ORGANIZER" | "VOLUNTEER"
  ) => {
    try {
      const token = await AsyncStorage.getItem("access_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await fetch(
        `http://172.19.51.45:8000/admin/users/${userId}/role`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: newRole,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Update Failed",
          data.detail || "Could not change user role."
        );
        return;
      }

      Alert.alert(
        "Success",
        "User role updated successfully."
      );

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userId
            ? {
                ...user,
                role: data.role,
              }
            : user
        )
      );
    } catch (error) {
      console.error("Change role error:", error);

      Alert.alert(
        "Connection Error",
        "Could not connect to the backend."
      );
    }
  };

  const confirmRoleChange = (
    user: User,
    newRole: "ORGANIZER" | "VOLUNTEER"
  ) => {
    Alert.alert(
      "Change User Role",
      `Change ${user.name}'s role to ${newRole}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: () => {
            void changeRole(user.id, newRole);
          },
        },
      ]
    );
  };

  const deleteUser = async (userId: number) => {
    Alert.alert(
      "Delete User",
      "Are you sure you want to delete this user?",
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
                `http://172.19.51.45:8000/admin/users/${userId}`,
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
                    "Could not delete user."
                );
                return;
              }

              Alert.alert(
                "Success",
                "User deleted successfully."
              );

              setUsers((currentUsers) =>
                currentUsers.filter(
                  (user) => user.id !== userId
                )
              );
            } catch (error) {
              console.error(
                "Delete user error:",
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
        <Text>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Manage Users
      </Text>

      <Pressable
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>
          Back to Admin Dashboard
        </Text>
      </Pressable>

      {users.length === 0 ? (
        <View style={styles.center}>
          <Text>No users found.</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) =>
            item.id.toString()
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>
                {item.name}
              </Text>

              <Text style={styles.email}>
                {item.email}
              </Text>

              <Text style={styles.role}>
                Role: {item.role}
              </Text>

              {item.role !== "ADMIN" && (
                <>
                  <Pressable
                    style={styles.roleButton}
                    onPress={() =>
                      confirmRoleChange(
                        item,
                        item.role === "ORGANIZER"
                          ? "VOLUNTEER"
                          : "ORGANIZER"
                      )
                    }
                  >
                    <Text style={styles.buttonText}>
                      Change to{" "}
                      {item.role === "ORGANIZER"
                        ? "Volunteer"
                        : "Organizer"}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.deleteButton}
                    onPress={() =>
                      deleteUser(item.id)
                    }
                  >
                    <Text style={styles.buttonText}>
                      Delete User
                    </Text>
                  </Pressable>
                </>
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

  name: {
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 5,
  },

  email: {
    marginBottom: 8,
  },

  role: {
    fontWeight: "bold",
    marginBottom: 12,
  },

  roleButton: {
    backgroundColor: "#000000",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },

  deleteButton: {
    backgroundColor: "#cc0000",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
});
