// StaffAttendanceScreen.js

import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import { otherServices } from "../../services/otherServices";

const StaffAttendanceScreen = ({ route, navigation }) => {
  const { staff } = route.params;

  const today = new Date();

  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [attendanceData, setAttendanceData] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAttendance();
  }, [month, year]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);

      const res = await otherServices.getStaffAttendance(
        staff.staff_id || staff.id,
        month,
        year
      );

      if (res?.status === "success") {
        setAttendanceData(res.data || []);
        setMetadata(res.metadata || null);
      }
    } catch (error) {
      console.log("Attendance error:", error);
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((prev) => prev - 1);
    } else {
      setMonth((prev) => prev - 1);
    }
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((prev) => prev + 1);
    } else {
      setMonth((prev) => prev + 1);
    }
    setSelectedDate(null);
  };

  const getMonthName = (monthNumber) => {
    return new Date(0, monthNumber - 1).toLocaleString("en-IN", {
      month: "long",
    });
  };

  const markedDates = useMemo(() => {
    const marked = {};
    const daysInMonth = new Date(year, month, 0).getDate();

    const presentDates = new Set(
      attendanceData.map((item) => item.start_time?.split(" ")[0])
    );

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;

      const isPresent = presentDates.has(dateString);

      marked[dateString] = {
        customStyles: {
          container: {
            backgroundColor: isPresent ? "#16A34A" : "#DC2626",
            borderRadius: 6,
          },
          text: {
            color: "#fff",
            fontWeight: "600",
          },
        },
      };

      if (selectedDate === dateString) {
        marked[dateString].selected = true;
        marked[dateString].selectedColor = "#1668A5";
      }
    }

    return marked;
  }, [attendanceData, selectedDate, month, year]);

  const selectedRecord = attendanceData.find((item) =>
    selectedDate ? item.start_time?.startsWith(selectedDate) : false
  );

  const formatTime = (dateTime) => {
    if (!dateTime || dateTime === "0000-00-00 00:00:00") {
      return "--";
    }

    const d = new Date(dateTime.replace(" ", "T"));

    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Ionicons
          name="arrow-back"
          size={22}
          color="#fff"
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>{staff.name}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* MONTH SELECTOR */}
        <View style={styles.monthRow}>
          <TouchableOpacity onPress={goToPreviousMonth}>
            <Ionicons name="chevron-back" size={24} />
          </TouchableOpacity>

          <Text style={styles.monthText}>
            {getMonthName(month)} {year}
          </Text>

          <TouchableOpacity onPress={goToNextMonth}>
            <Ionicons name="chevron-forward" size={24} />
          </TouchableOpacity>
        </View>

        {/* SUMMARY */}
        {metadata && (
          <View style={styles.summary}>
            <View style={[styles.summaryBox, { backgroundColor: "#16A34A" }]}>
              <Text style={styles.summaryNumber}>{metadata.present}</Text>
              <Text style={styles.summaryLabel}>Present</Text>
            </View>

            <View style={[styles.summaryBox, { backgroundColor: "#DC2626" }]}>
              <Text style={styles.summaryNumber}>{metadata.absent}</Text>
              <Text style={styles.summaryLabel}>Absent</Text>
            </View>
          </View>
        )}

        {/* CALENDAR */}
        {loading ? (
          <ActivityIndicator size="large" color="#1668A5" style={{ marginVertical: 20 }} />
        ) : (
          <Calendar
            current={`${year}-${String(month).padStart(2, "0")}-01`}
            markingType="custom"
            markedDates={markedDates}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            hideArrows
            hideExtraDays
            disableMonthChange
          />
        )}

        {/* ATTENDANCE CARD — shown only after a date is tapped */}
        {selectedDate && (
          <View style={styles.attendanceCard}>
            <Text style={styles.dateTitle}>{selectedDate}</Text>

            <View style={styles.statusRow}>
              <Text style={styles.label}>Status:</Text>
              <Text
                style={[
                  styles.statusText,
                  { color: selectedRecord ? "#16A34A" : "#DC2626" },
                ]}
              >
                {selectedRecord ? "Present" : "Absent"}
              </Text>
            </View>

            <View style={styles.statusRow}>
              <Text style={styles.label}>Entry:</Text>
              <Text style={styles.valueText}>
                {selectedRecord ? formatTime(selectedRecord.start_time) : "--"}
              </Text>
            </View>

            <View style={styles.statusRow}>
              <Text style={styles.label}>Exit:</Text>
              <Text style={styles.valueText}>
                {selectedRecord &&
                selectedRecord.end_time &&
                selectedRecord.end_time !== "0000-00-00 00:00:00"
                  ? formatTime(selectedRecord.end_time)
                  : "--"}
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default StaffAttendanceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

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

  monthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },

  monthText: {
    fontSize: 18,
    fontWeight: "700",
  },

  summary: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },

  summaryBox: {
    width: "40%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  summaryNumber: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },

  summaryLabel: {
    color: "#fff",
    fontWeight: "600",
  },

  attendanceCard: {
    margin: 16,
    padding: 18,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    // Removed fixed height: 180 — let content determine height
  },

  dateTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },

  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  label: {
    fontWeight: "600",
    color: "#333",
  },

  valueText: {
    fontWeight: "600",
    color: "#111",
  },

  statusText: {
    fontWeight: "700",
  },
});