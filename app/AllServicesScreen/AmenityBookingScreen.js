import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../components/AppHeader";
import StatusModal from "../../app/components/StatusModal";
import { usePermissions } from "../../Utils/ConetextApi";
import { otherServices } from "../../services/otherServices";
import { Ionicons } from "@expo/vector-icons";
import SubmitButton from "../components/SubmitButton";
import BRAND from "../config";

const { width } = Dimensions.get("window");

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const AmenityBookingScreen = ({ route, navigation }) => {
  const { amenity } = route.params;
  const { nightMode } = usePermissions();
const COLORS = BRAND.COLORS;


  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [screenLoading, setScreenLoading] = useState(true);
  const [slotLoading, setSlotLoading] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("loading");
  const [modalTitle, setModalTitle] = useState("");
  const [modalSubtitle, setModalSubtitle] = useState("");

  const theme = {
    background: nightMode ? "#0F172A" : "#F9FAFB",
    card: nightMode ? "#1E293B" : "#FFFFFF",
    text: nightMode ? "#F1F5F9" : "#111827",
    subText: nightMode ? "#94A3B8" : "#6B7280",
    border: nightMode ? "#334155" : "#E5E7EB",
    primary: "#1996D3",
    success: "#10B981",
    danger: "#EF4444",
    disabled: "#9CA3AF",
  };

  useEffect(() => {
    fetchBookings();
  }, []);
  useEffect(() => {
    if (selectedDate) {
      fetchBookingsForDate(selectedDate);
    }
  }, [selectedDate]);

  const fetchBookings = async () => {
    try {
      const res = await otherServices.getAmenityBookingsById(amenity.id);
      setBookings(res?.data || []);
    } catch (err) {
      console.log("Booking fetch error:", err);
    } finally {
      setScreenLoading(false);
    }
  };
  const fetchBookingsForDate = async (date) => {
    try {
      setSlotLoading(true);

      const res = await otherServices.getAmenityBookingsByDate(
        amenity.id,
        date
      );

      setBookings(res?.data || []);

    } catch (err) {
      console.log("Date booking fetch error:", err);
    } finally {
      setSlotLoading(false);
    }
  };
  const parsedSlot = useMemo(() => {
    try { return JSON.parse(amenity.slot || "{}"); } catch { return {}; }
  }, [amenity]);

  const rules = useMemo(() => {
    try { return JSON.parse(amenity.rules || "{}"); } catch { return {}; }
  }, [amenity]);

  const blockedDates = useMemo(() => {
    try { return JSON.parse(amenity.no_availability_days || "[]"); } catch { return []; }
  }, [amenity]);

  const formatDate = (dateObj) => dateObj.toISOString().split("T")[0];

  const getDayBookingCount = (date) =>
    bookings.filter((b) => b.booking_from?.startsWith(date)).length;

  const isDateSelectable = (date) => {
    const today = new Date();
    const selected = new Date(date);
    today.setHours(0, 0, 0, 0);
    if (selected < today) return false;

    if (rules.no_of_future_days) {
      const future = new Date();
      future.setDate(future.getDate() + rules.no_of_future_days);
      if (selected > future) return false;
    }

    if (blockedDates.some((d) => d.d === date)) return false;

    const dayIndex = selected.getDay();
    if (!parsedSlot[dayIndex] || parsedSlot[dayIndex].avl !== true) return false;

    const max = rules?.max_per_day || 0;
    if (max && getDayBookingCount(date) >= max) return false;

    return true;
  };

  const isSlotBooked = (slot) => {
    if (!selectedDate) return false;

    return bookings.some((b) => {
      const bookingStart = b.booking_from.split(" ")[1]; // HH:mm:ss
      const bookingEnd = b.booking_to.split(" ")[1];

      const slotStart = `${slot.from}:00`;
      const slotEnd = `${slot.to}:00`;

      return bookingStart === slotStart && bookingEnd === slotEnd;
    });
  };

  /* ---- CALENDAR HELPERS ---- */

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push(dateStr);
    }
    return cells;
  }, [calendarMonth]);

  const goToPrevMonth = () => {
    const d = new Date(calendarMonth);
    d.setMonth(d.getMonth() - 1);
    setCalendarMonth(d);
  };

  const isSlotPassed = (slot) => {
    if (!selectedDate) return false;

    const today = new Date().toISOString().split("T")[0];

    if (selectedDate !== today) return false;

    const now = new Date();
    const slotStart = new Date(`${selectedDate} ${slot.from}:00`);

    return slotStart <= now;
  };

  const goToNextMonth = () => {
    const d = new Date(calendarMonth);
    d.setMonth(d.getMonth() + 1);
    setCalendarMonth(d);
  };

  /* ---- SLOTS ---- */

  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];
    const dayIndex = new Date(selectedDate).getDay();
    const dayData = parsedSlot[dayIndex];
    if (!dayData || dayData.avl !== true) return [];
    return dayData.hrs || [];
  }, [selectedDate, parsedSlot]);

  /* ---- BOOKING ---- */

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot) {
      setModalType("error");
      setModalTitle("Select Date & Slot");
      setModalSubtitle("");
      setModalVisible(true);
      return;
    }

    try {
      setModalType("loading");
      setModalTitle("Processing...");
      setModalVisible(true);

      const bookingFrom = `${selectedDate} ${selectedSlot.from}:00`;
      const bookingTo = `${selectedDate} ${selectedSlot.to}:00`;
      const res = await otherServices.bookAmenity(amenity.id, bookingFrom, bookingTo);
      console.log("BOOK RESPONSE:", res);

      if (res?.status === "success") {
        setModalType("success");
        setModalTitle("Booking Confirmed");
        setModalSubtitle(`${selectedDate}\n${selectedSlot.from} - ${selectedSlot.to}`);
        setTimeout(() => navigation.goBack(), 2000);
      } else {
        throw new Error();
      }
    } catch {
      setModalType("error");
      setModalTitle("Booking Failed");
      setModalSubtitle("");
    }
  };

  const cellSize = Math.floor((width - 32 - 32) / 7);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <AppHeader title={`Book ${amenity.name}`} />

      {screenLoading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>

          {/* ── CALENDAR ── */}
          <View style={[styles.calendarCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {/* Month Nav */}
            <View style={styles.monthNav}>
              <TouchableOpacity onPress={goToPrevMonth} style={styles.navBtn}>
                <Ionicons name="chevron-back" size={20} color={BRAND.COLORS.icon} />
              </TouchableOpacity>
              <Text style={[styles.monthTitle, { color: theme.text }]}>
                {MONTHS[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
              </Text>
              <TouchableOpacity onPress={goToNextMonth} style={styles.navBtn}>
                <Ionicons name="chevron-forward" size={20} color={BRAND.COLORS.icon} />
              </TouchableOpacity>
            </View>

            {/* Day Headers */}
            <View style={styles.weekRow}>
              {DAYS_OF_WEEK.map((d) => (
                <Text key={d} style={[styles.weekDay, { color: theme.subText, width: cellSize }]}>
                  {d}
                </Text>
              ))}
            </View>

            {/* Date Grid */}
            <View style={styles.grid}>
              {calendarDays.map((date, i) => {
                if (!date) {
                  return <View key={`empty-${i}`} style={{ width: cellSize, height: cellSize }} />;
                }

                const selectable = isDateSelectable(date);
                const isSelected = selectedDate === date;
                const dayNum = parseInt(date.split("-")[2], 10);

                const today = formatDate(new Date());
                const isToday = date === today;

                return (
                  <TouchableOpacity
                    key={date}
                    disabled={!selectable}
                    onPress={() => {
                      setSelectedDate(date);
                      setSelectedSlot(null);
                    }}
                    style={[
                      styles.dayCell,
                      {
                        width: cellSize,
                        height: cellSize,
                        borderRadius: cellSize / 2,
                        backgroundColor: isSelected
                          ? theme.primary
                          : isToday
                            ? `${theme.primary}22`
                            : "transparent",
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: isSelected || isToday ? "700" : "400",
                        color: isSelected
                          ? "#fff"
                          : !selectable
                            ? theme.disabled
                            : selectable
                              ? theme.text
                              : theme.subText,
                      }}
                    >
                      {dayNum}
                    </Text>
                    {/* green dot for available */}
                    {selectable && !isSelected && (
                      <View style={[styles.availDot, { backgroundColor: theme.success }]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Legend */}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: theme.success }]} />
                <Text style={[styles.legendText, { color: theme.subText }]}>Available</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: theme.primary }]} />
                <Text style={[styles.legendText, { color: theme.subText }]}>Selected</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: theme.disabled }]} />
                <Text style={[styles.legendText, { color: theme.subText }]}>Unavailable</Text>
              </View>
            </View>
          </View>

          {/* ── TIME SLOTS (shown only after date selected) ── */}
          {selectedDate && (
            <View style={{ marginTop: 20 }}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Time Slots —{" "}
                <Text style={{ color: theme.primary }}>
                  {new Date(selectedDate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
              </Text>

              {/* 🔥 SLOT LOADING HERE */}
              {slotLoading ? (
                <ActivityIndicator
                  size="small"
                  color={BRAND.COLORS.icon}
                  style={{ marginTop: 20 }}
                />
              ) : availableSlots.length === 0 ? (
                <View
                  style={[
                    styles.emptySlots,
                    { backgroundColor: theme.card, borderColor: theme.border },
                  ]}
                >
                  <Ionicons
                    name="time-outline"
                    size={28}
                    color={theme.subText}
                  />
                  <Text
                    style={[
                      styles.emptyText,
                      { color: theme.subText },
                    ]}
                  >
                    No slots available
                  </Text>
                </View>
              ) : (
                <View style={styles.slotsGrid}>
                  {availableSlots.map((slot, i) => {
                    const booked = isSlotBooked(slot);
                    const passed = isSlotPassed(slot);
                    const isSelected = selectedSlot === slot;

                    return (
                      <TouchableOpacity
                        key={i}
                        disabled={booked || passed}
                        onPress={() => setSelectedSlot(slot)}
                        style={[
                          styles.slotChip,
                          {
                            backgroundColor: isSelected
                              ? theme.primary
                              : theme.card,
                            borderColor: theme.border,
                            opacity: booked || passed ? 0.5 : 1,
                          },
                        ]}
                      >
                        <Ionicons
                          name="time-outline"
                          size={13}
                          color={
                            isSelected
                              ? "#fff"
                              : booked || passed
                                ? theme.subText
                                : theme.primary
                          }
                        />

                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "600",
                            marginLeft: 4,
                            color: isSelected
                              ? "#fff"
                              : booked || passed
                                ? theme.subText
                                : theme.text,
                          }}
                        >
                          {slot.from} - {slot.to}
                        </Text>

                        {/* 🔴 Booked label */}
                        {booked && (
                          <Text style={{ fontSize: 10, color: theme.danger, marginLeft: 4 }}>
                            Booked
                          </Text>
                        )}

                        {/* ⚫ Passed label */}
                        {passed && (
                          <Text style={{ fontSize: 10, color: theme.danger, marginLeft: 4 }}>
                            Passed
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {/* CONFIRM BUTTON */}
          <SubmitButton
            title="Confirm Booking"
            onPress={handleBooking}
            loading={false}
            disabled={!selectedSlot}
          />
        </ScrollView>
      )}

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

  content: {
    padding: 16,
    paddingBottom: 50,
  },

  amenityName: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },

  calendarCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
  },

  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  navBtn: {
    padding: 4,
  },

  monthTitle: {
    fontSize: 14,
    fontWeight: "700",
  },

  weekRow: {
    flexDirection: "row",
    marginBottom: 4,
  },

  weekDay: {
    textAlign: "center",
    fontSize: 10,
    fontWeight: "600",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  dayCell: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },

  availDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    position: "absolute",
    bottom: 4,
  },

  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  legendText: {
    fontSize: 10,
  },



  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },


  /* Slots */
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
  },

  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  slotChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },

  emptySlots: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },

  emptyText: {
    fontSize: 14,
    fontWeight: "500",
  },

  /* Book Button */
  bookBtn: {
    marginTop: 28,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },

  bookText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});