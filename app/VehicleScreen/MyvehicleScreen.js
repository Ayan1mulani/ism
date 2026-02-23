// MyVehiclesScreen.js

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { otherServices } from "../../services/otherServices";

const MyVehiclesScreen = ({ navigation }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVehicles = async () => {
    try {
      const res = await otherServices.getMyVehicles();
      setVehicles(res?.data || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

const renderItem = ({ item }) => {
  const isApproved = item.is_approved === 1;
  const isIn = item.status === 1;
  const isSubscribed = item.is_subscribed === 1;

  const handlePress = () => {
    if (isApproved) {
      navigation.navigate("VehicleDetailsScreen", { vehicle: item });
    } else {
      navigation.navigate("AddVehicleScreen", { vehicle: item });
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={handlePress}
    >
      <View style={styles.iconWrapper}>
        <Ionicons name="car-outline" size={28} color="#1668A5" />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.vehicleNo}>{item.vehicle_no}</Text>
        <Text style={styles.model}>{item.model || "-"}</Text>

        {/* If Approved → Show IN/OUT */}
        {isApproved ? (
          <View style={styles.statusRow}>
            <View
              style={[
                styles.smallBadge,
                {
                  backgroundColor: isIn ? "#16A34A" : "#DC2626",
                },
              ]}
            >
              <Text style={styles.smallBadgeText}>
                {isIn ? "IN" : "OUT"}
              </Text>
            </View>

            <Ionicons
              name={isSubscribed ? "notifications" : "notifications-off"}
              size={16}
              color={isSubscribed ? "#16A34A" : "#9CA3AF"}
              style={{ marginLeft: 10 }}
            />
          </View>
        ) : (
          // If Pending → Show HOLD
          <View style={styles.statusRow}>
            <Ionicons
              name="time-outline"
              size={16}
              color="#f59e0b"
            />
            <Text style={styles.holdText}> On Hold</Text>
          </View>
        )}
      </View>

      {/* Only show badge if Pending */}
      {!isApproved && (
        <View style={[styles.statusBadge, { backgroundColor: "#f59e0b" }]}>
          <Text style={styles.statusText}>Pending</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#1668A5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name="arrow-back"
          size={22}
          color="#fff"
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>My Vehicles</Text>
      </View>

      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddVehicleScreen")}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default MyVehiclesScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  header: {
    height: 60,
    backgroundColor: "#1668A5",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    elevation: 2,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#eef2f7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  holdText: {
  color: "#f59e0b",
  fontSize: 12,
  fontWeight: "600",
  marginLeft: 4,
},
  vehicleNo: { fontSize: 16, fontWeight: "700" },
  model: { color: "#6b7280", marginTop: 4 },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf:"flex-start"
  },
  statusText: { color: "#fff", fontWeight: "600"},
  fab: {
    position: "absolute",
    bottom: 30,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#1668A5",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  statusRow: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 6,
},

smallBadge: {
  paddingHorizontal: 8,
  paddingVertical: 2,
  borderRadius: 12,
},

smallBadgeText: {
  color: "#fff",
  fontSize: 10,
  fontWeight: "600",
},
});