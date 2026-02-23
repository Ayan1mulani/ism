// MyStaffScreen.js

import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const dummyStaff = [
  { id: "1", name: "Ramesh Kumar", role: "Security" },
  { id: "2", name: "Sunita Sharma", role: "Maid" },
];

const MyStaffScreen = () => {

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.role}>{item.role}</Text>
      </View>

      <TouchableOpacity>
        <Ionicons name="chevron-forward" size={18} />
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={dummyStaff}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 16 }}
    />
  );
};

export default MyStaffScreen;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
  },
  role: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
});