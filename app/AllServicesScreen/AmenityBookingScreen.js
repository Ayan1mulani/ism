import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../components/AppHeader";
import CalendarSelector from "../../app/VisitorsScreen/components/Calender";
import StatusModal from "../../app/components/StatusModal";
import { usePermissions } from "../../Utils/ConetextApi";
import { otherServices } from "../../services/otherServices";
import { Ionicons } from "@expo/vector-icons";

const AmenityBookingScreen = ({ route, navigation }) => {
  const { amenity } = route.params;
  const { nightMode } = usePermissions();

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookings, setBookings] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("loading");
  const [modalTitle, setModalTitle] = useState("");
  const [modalSubtitle, setModalSubtitle] = useState("");

  const theme = {
    background: nightMode ? "#0F172A" : "#F9FAFB",
    text: nightMode ? "#F1F5F9" : "#111827",
    border: nightMode ? "#334155" : "#E5E7EB",
    primary: "#1996D3",
  };

  // FETCH EXISTING BOOKINGS
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await otherServices.getMyAmenityBookings();
      setBookings(response?.data || []);
    } catch (err) {
      console.log("Booking fetch error:", err);
    }
  };

  // PARSE SLOT
  const parsedSlot = useMemo(() => {
    try {
      return JSON.parse(amenity.slot || "{}");
    } catch {
      return {};
    }
  }, [amenity]);

  const availableSlots = useMemo(() => {
    if (!startDate) return [];
    const dayIndex = new Date(startDate).getDay();
    return parsedSlot[dayIndex]?.hrs || [];
  }, [startDate, parsedSlot]);

  // CHECK OVERLAP
  const isOverlapping = () => {
    if (!startDate || !endDate) return false;

    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);

    return bookings.some((booking) => {
      const existingStart = new Date(booking.booking_from);
      const existingEnd = new Date(booking.booking_to);

      return (
        newStart <= existingEnd &&
        newEnd >= existingStart
      );
    });
  };

  const handleBooking = async () => {
    if (!startDate || !endDate || !selectedSlot) {
      setModalType("error");
      setModalTitle("Incomplete Details");
      setModalSubtitle("Select dates & slot");
      setModalVisible(true);
      return;
    }

    if (isOverlapping()) {
      setModalType("error");
      setModalTitle("Date Conflict");
      setModalSubtitle("Already booked for selected dates");
      setModalVisible(true);
      return;
    }

    try {
      setModalType("loading");
      setModalTitle("Processing...");
      setModalSubtitle("Booking your slot");
      setModalVisible(true);

      const bookingFrom = `${startDate} ${selectedSlot.from}`;
      const bookingTo = `${endDate} ${selectedSlot.to}`;

      const response = await otherServices.bookAmenity(
        amenity.id,
        bookingFrom,
        bookingTo
      );

      if (response?.status === "success") {
        setModalType("success");
        setModalTitle("Booking Confirmed");
        setModalSubtitle(
          `From ${bookingFrom}\nTo ${bookingTo}`
        );

        setTimeout(() => {
          setModalVisible(false);
          navigation.goBack();
        }, 2000);
      } else {
        throw new Error();
      }
    } catch (error) {
      setModalType("error");
      setModalTitle("Booking Failed");
      setModalSubtitle("Please try again");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <AppHeader title="Book Amenity" />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>
          {amenity.name}
        </Text>

        <CalendarSelector
          selectedDate={startDate}
          onDateSelect={(date) => {
            setStartDate(date);
            setSelectedSlot(null);
          }}
          nightMode={nightMode}
          label="Start Date"
        />

        <CalendarSelector
          selectedDate={endDate}
          onDateSelect={setEndDate}
          nightMode={nightMode}
          label="End Date"
        />

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Available Time Slots
        </Text>

        {availableSlots.map((slot, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.slotCard,
              {
                borderColor:
                  selectedSlot === slot
                    ? theme.primary
                    : theme.border,
              },
            ]}
            onPress={() => setSelectedSlot(slot)}
          >
            <Ionicons
              name="time-outline"
              size={16}
              color={theme.primary}
            />
            <Text style={{ marginLeft: 10 }}>
              {slot.from} - {slot.to}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.bookBtn, { backgroundColor: theme.primary }]}
          onPress={handleBooking}
        >
          <Text style={styles.bookText}>Confirm Booking</Text>
        </TouchableOpacity>
      </ScrollView>

      <StatusModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        subtitle={modalSubtitle}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default AmenityBookingScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 12,
  },
  slotCard: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  bookBtn: {
    marginTop: 30,
    padding: 14,
    borderRadius: 12,
    alignItems: "center", 
  },
  bookText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});