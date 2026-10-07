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
import { API_URL } from "../config/api";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  is_approved: boolean;
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
        `${API_URL}/admin/users`,
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



  const approveUser = async (userId: number) => {
    try {
      const token = await AsyncStorage.getItem("access_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/admin/users/${userId}/approve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Approval Failed",
          data.detail || "Could not approve organizer."
        );
        return;
      }

      Alert.alert(
        "Success",
        "Organizer approved successfully."
      );

      // Update the user in the current list
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userId
            ? {
                ...user,
                is_approved: true,
              }
            : user
        )
      );
    } catch (error) {
      console.error("Approve user error:", error);

      Alert.alert(
        "Connection Error",
        "Could not connect to the backend."
      );
    }
  };



  const confirmApproval = (user: User) => {
    Alert.alert(
      "Approve Organizer",
      `Approve ${user.name}'s organizer account?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Approve",
          onPress: () => {
            void approveUser(user.id);
          },
        },
      ]
    );
  };



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
        `${API_URL}/admin/users/${userId}/role`,
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
                is_approved: data.is_approved,
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
                `${API_URL}/admin/users/${userId}`,
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

  

  useEffect(() => {
    void fetchUsers();
  }, []);



  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Loading users...
        </Text>
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
          renderItem={({ item }) => {
            const isAdmin = item.role === "ADMIN";
            const isOrganizer =
              item.role === "ORGANIZER";

            const canApprove =
              isOrganizer && !item.is_approved;

            return (
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

                {/* Approval status */}
                {!isAdmin && (
                  <Text style={styles.status}>
                    Status:{" "}
                    {item.is_approved
                      ? "Approved"
                      : isOrganizer
                      ? "Pending Approval"
                      : "Not Required"}
                  </Text>
                )}

                {/* Approve Organizer */}
                {canApprove && (
                  <Pressable
                    style={styles.approveButton}
                    onPress={() =>
                      confirmApproval(item)
                    }
                  >
                    <Text style={styles.buttonText}>
                      Approve Organizer
                    </Text>
                  </Pressable>
                )}

                {/* Role change and delete */}
                {!isAdmin && (
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
            );
          }}
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

  loadingText: {
    marginTop: 10,
    fontSize: 16,
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
    marginBottom: 8,
  },

  status: {
    marginBottom: 12,
    fontWeight: "600",
  },

  approveButton: {
    backgroundColor: "#008000",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
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