import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "../components/AppHeader";
import { usePermissions } from "../../Utils/ConetextApi";
import { otherServices } from "../../services/otherServices";

const MyNoticesScreen = ({ navigation }) => {
  const { nightMode } = usePermissions();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const theme = {
    background: nightMode ? "#1A1A1A" : "#F3F4F6",
    card: nightMode ? "#2A2A2A" : "#FFFFFF",
    title: nightMode ? "#FFFFFF" : "#111827",
    preview: nightMode ? "#CFCFCF" : "#6B7280",
    category: "#1565A9",
    date: "#9CA3AF",
    calendarHeader: "#1565A9",
    calendarBody: nightMode ? "#1F1F1F" : "#FFFFFF",
  };

  const stripHtml = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, "");
  };

  const fetchNotices = async () => {
    try {
      const res = await otherServices.getMyNotices("");

      if (res?.status === "success") {
        setNotices(res.data || []);
      } else {
        setNotices([]);
      }
    } catch (error) {
      console.log("Fetch Notices Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotices();
  }, []);

  const renderItem = ({ item }) => {
    const preview = stripHtml(item.notice).slice(0, 80);

    const dateObj = new Date(item.published_at);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleDateString("en-US", { month: "short" });

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.card }]}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate("NoticeDetailScreen", { notice: item })
        }
      >
        {/* 🔵 LEFT CALENDAR */}
        <View style={styles.calendarContainer}>
          <View
            style={[
              styles.calendarHeader,
              { backgroundColor: theme.calendarHeader },
            ]}
          >
            <Text style={styles.calendarMonth}>{month}</Text>
          </View>

          <View
            style={[
              styles.calendarBody,
              { backgroundColor: theme.calendarBody },
            ]}
          >
            <Text style={[styles.calendarDay, { color: theme.title }]}>
              {day}
            </Text>
          </View>
        </View>

        {/* 🔹 RIGHT CONTENT */}
        <View style={styles.rightContent}>
          <View style={styles.topRow}>
            <Text style={[styles.category, { color: theme.category }]}>
              {item.category}
            </Text>

            {!item.is_read && <View style={styles.unreadDot} />}
          </View>

          <Text
            style={[styles.title, { color: theme.title }]}
            numberOfLines={2}
          >
            {item.subject}
          </Text>

          <Text
            style={[styles.preview, { color: theme.preview }]}
            numberOfLines={2}
          >
            {preview}
          </Text>

          <Text style={[styles.date, { color: theme.date }]}>
            {dateObj.toLocaleDateString("en-GB")}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <AppHeader title="My Notices" />

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#1565A9" />
        </View>
      ) : (
        <FlatList
          data={notices}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#1565A9"]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default MyNoticesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    flexDirection: "row", // 🔥 IMPORTANT FOR CALENDAR
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },

  /* 🔵 Calendar Styles */
  calendarContainer: {
    width: 60,
    height: 70,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 16,
    elevation: 3,
  },

  calendarHeader: {
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },

  calendarMonth: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  calendarBody: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  calendarDay: {
    fontSize: 20,
    fontWeight: "800",
  },

  /* Right Content */
  rightContent: {
    flex: 1,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  category: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF3B30",
  },

  title: {
    fontSize: 17,
    fontWeight: "700",
    marginTop: 6,
  },

  preview: {
    fontSize: 15,
    marginTop: 4,
  },

  date: {
    marginTop: 10,
    fontSize: 14,
  },
});