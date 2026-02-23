// BookParkingScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { visitorServices } from "../../../services/visitorServices";
import { usePermissions } from "../../../Utils/ConetextApi";
import AppHeader from "../../components/AppHeader";
import CalendarSelector from "../components/Calender";

const BookParkingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { visitDate, onSelectParking } = route.params || {};
  const { nightMode } = usePermissions();

  const [parkingData, setParkingData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [fromDate, setFromDate] = useState(visitDate || null);
  const [toDate, setToDate] = useState(null);

  const theme = {
    bg: nightMode ? "#121212" : "#FFFFFF",
    text: nightMode ? "#FFFFFF" : "#111827",
    sub: nightMode ? "#9CA3AF" : "#6B7280",
    border: nightMode ? "#333" : "#E5E7EB",
    primary: "#1996D3",
  };

  useEffect(() => {
    fetchParking();
  }, []);

  const fetchParking = async () => {
    try {
      const res = await visitorServices.getParkingLocations();

      console.log("Parking API Response:", res);

      if (res?.status === "success" && res?.data?.length > 0) {
        setParkingData(res.data[0]); // first location
      }
    } catch (err) {
      console.log("Parking fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!fromDate || !toDate) {
      Alert.alert("Missing Fields", "Please select both From and To dates.");
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      Alert.alert("Invalid Date", "To Date must be after From Date.");
      return;
    }

    const formattedFrom =
      fromDate instanceof Date
        ? fromDate.toISOString().split("T")[0]
        : fromDate;

    const formattedTo =
      toDate instanceof Date
        ? toDate.toISOString().split("T")[0]
        : toDate;

    const parkingPayload = {
      booking_from: formattedFrom,
      booking_to: formattedTo,
      location_id: parkingData?.id,
    };

    if (onSelectParking) {
      onSelectParking(parkingPayload);
    }

    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar barStyle={nightMode ? "light-content" : "dark-content"} />

      <AppHeader
        title="Book Parking"
        showBack
        nightMode={nightMode}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={{ padding: 16 }}>

        {/* 🔥 Parking Location Card */}
        {parkingData && (
          <View
            style={[
              styles.locationCard,
              { borderColor: theme.border, backgroundColor: nightMode ? "#1E1E1E" : "#F9FAFB" },
            ]}
          >
            <Text style={[styles.locationTitle, { color: theme.text }]}>
              Parking Location
            </Text>

            <Text style={{ color: theme.text, fontWeight: "600" }}>
              {parkingData.name}
            </Text>

            {parkingData.address && (
              <Text style={{ color: theme.sub, marginTop: 4 }}>
                {parkingData.address}
              </Text>
            )}
          </View>
        )}

        {/* From Date */}
        <CalendarSelector
          selectedDate={fromDate}
          onDateSelect={setFromDate}
          label="From Date"
          required
          nightMode={nightMode}
        />

        {/* To Date */}
        <View style={{ marginTop: 20 }}>
          <CalendarSelector
            selectedDate={toDate}
            onDateSelect={setToDate}
            label="To Date"
            required
            nightMode={nightMode}
          />
        </View>

        {/* Confirm Button */}
        <TouchableOpacity
          style={[styles.confirmBtn, { backgroundColor: theme.primary }]}
          onPress={handleConfirm}
        >
          <Text style={styles.confirmText}>Confirm Booking</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default BookParkingScreen;

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  locationCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },

  locationTitle: {
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 8,
  },

  confirmBtn: {
    marginTop: 30,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  confirmText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});