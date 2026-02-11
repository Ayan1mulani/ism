import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";

const CalendarSelector = ({
  selectedDate,
  onDateSelect,
  label = "Scheduled Date",
  required = true,
  nightMode = false,
}) => {
  const [showCalendar, setShowCalendar] = useState(false);

  const THEME = {
    primary: "#1D9BF0",
    textPrimary: nightMode ? "#FFFFFF" : "#1F2937",
    textSecondary: nightMode ? "#9CA3AF" : "#6B7280",
    border: nightMode ? "#374151" : "#E5E7EB",
    background: nightMode ? "#1A1A1A" : "#FFFFFF",
    modalBg: nightMode ? "#1A1A1A" : "#FFFFFF",
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // ✅ Set TODAY by default
  useEffect(() => {
    if (!selectedDate) {
      onDateSelect(getTodayDate());
    }
  }, []);

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "SELECT DATE";

    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);

    tomorrow.setDate(tomorrow.getDate() + 1);
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) return "Today";
    if (date.getTime() === tomorrow.getTime()) return "Tomorrow";

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleDateSelect = (day) => {
    onDateSelect(day.dateString);
    setShowCalendar(false);
  };

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={[styles.sectionTitle, { color: THEME.textPrimary }]}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      {/* Date Row */}
   <View style={styles.dateContainer}>
  {/* SELECT DATE */}
  <TouchableOpacity
    style={[
      styles.dateButton,
      { backgroundColor: THEME.background, borderColor: THEME.border },
      selectedDate && styles.dateButtonSelected,
    ]}
    onPress={() => setShowCalendar(true)}
  >
    <Text
      style={[
        styles.dateButtonText,
        { color: THEME.textSecondary },
        selectedDate && styles.dateButtonTextSelected,
      ]}
      numberOfLines={1}
    >
      {formatDisplayDate(selectedDate)}
    </Text>
  </TouchableOpacity>

  {/* TOMORROW */}
  <TouchableOpacity
    style={[
      styles.tomorrowButton,
      { backgroundColor: THEME.background, borderColor: THEME.border },
    ]}
    onPress={() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      onDateSelect(tomorrow.toISOString().split("T")[0]);
    }}
  >
    <Text
      style={[
        styles.tomorrowText,
        { color: nightMode ? "#93C5FD" : "#33a0d6" },
      ]}
      numberOfLines={1}
    >
      tomorrow
    </Text>
  </TouchableOpacity>

  {/* CALENDAR ICON */}
  <TouchableOpacity
    style={[
      styles.iconButton,
      { backgroundColor: THEME.background, borderColor: THEME.border },
    ]}
    onPress={() => setShowCalendar(true)}
  >
    <Ionicons name="calendar-outline" size={22} color={THEME.primary} />
  </TouchableOpacity>
</View>

      {/* Calendar Modal */}
      <Modal
        visible={showCalendar}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowCalendar(false)}
          />

          <View style={[styles.calendarModal, { backgroundColor: THEME.modalBg }]}>
            {/* Header */}
            <View style={[styles.modalHeader, { borderBottomColor: THEME.border }]}>
              <Text style={[styles.modalTitle, { color: THEME.textPrimary }]}>
                Select Date
              </Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <Ionicons name="close" size={26} color={THEME.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Calendar */}
            <Calendar
              current={selectedDate || getTodayDate()}
              minDate={getTodayDate()}
              onDayPress={handleDateSelect}
              markedDates={{
                [selectedDate]: {
                  selected: true,
                  selectedColor: THEME.primary,
                },
              }}
              theme={{
                calendarBackground: THEME.modalBg,
                textSectionTitleColor: THEME.textSecondary,
                selectedDayBackgroundColor: THEME.primary,
                selectedDayTextColor: "#fff",
                todayTextColor: "#10B981",
                dayTextColor: THEME.textPrimary,
                arrowColor: THEME.primary,
                monthTextColor: THEME.textPrimary,
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14,
              }}
              style={styles.calendar}
            />

            {/* Quick Select */}
            <View style={styles.quickSelectContainer}>
              <TouchableOpacity
                style={[styles.quickSelectButton, { backgroundColor: THEME.primary }]}
                onPress={() => {
                  onDateSelect(getTodayDate());
                  setShowCalendar(false);
                }}
              >
                <Text style={styles.quickSelectText}>Today</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickSelectButton, { backgroundColor: THEME.primary }]}
                onPress={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  onDateSelect(tomorrow.toISOString().split("T")[0]);
                  setShowCalendar(false);
                }}
              >
                <Text style={styles.quickSelectText}>Tomorrow</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};


const styles = StyleSheet.create({
  container: { marginBottom: 0 },
  sectionTitle: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  required: { color: "#EF4444" },



  dateButtonSelected: {
    backgroundColor: "#339dce",
    borderColor: "#55e5f57b",
  },

  dateButtonText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },

  dateButtonTextSelected: {
    color: "#FFFFFF",
  },

  calendarButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },

  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },

  calendarModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
  },

  modalTitle: { fontSize: 20, fontWeight: "700" },

  calendar: { paddingHorizontal: 10, paddingTop: 10 },

  quickSelectContainer: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
  },

  quickSelectButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  quickSelectText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  dateContainer: {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
},

dateButton: {
  flex: 1,
  paddingVertical: 14,
  paddingHorizontal: 16,
  borderRadius: 12,
  borderWidth: 1,
  width:"70%"
},

tomorrowButton: {
  paddingHorizontal: 14,
  height: 48,
  borderRadius: 12,
  borderWidth: 1,
  justifyContent: "center",
  alignItems: "center",
  width:"20%"
},

tomorrowText: {
  fontSize: 12,
  fontWeight: "10",
  margin:-20
},

iconButton: {
  width: 48,
  height: 48,
  borderRadius: 12,
  borderWidth: 1,
  justifyContent: "center",
  alignItems: "center",
  width:"15%"
},
});
export default CalendarSelector;