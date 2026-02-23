import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ismServices } from "../../services/ismServices";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "./AppHeader";

const PRIMARY = "#1996D3";

// Extracts URL from <a href="..."> if present
const extractUrl = (html) => {
  const match = html?.match(/<a\b[^>]*href="([^"]*)"[^>]*>/i);
  return match ? match[1] : null;
};

// Strips all HTML tags, converts <br> to newline, cleans entities
const stripHtml = (html) => {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<a\b[^>]*>.*?<\/a>/gi, "")   // remove entire <a> tag (URL shown separately)
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim();
};

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await ismServices.getMyNotifications();
      setNotifications(res?.data || []);
    } catch (error) {
      console.log("Notification Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const renderItem = ({ item }) => {
    const cleanMessage = stripHtml(item.message);
    const url = extractUrl(item.message);

    return (
      <View style={styles.card}>
        <View style={styles.dot} />
        <View style={styles.cardContent}>
          <Text style={styles.message}>{cleanMessage}</Text>

          {/* Tappable link if message had a URL */}
          {url ? (
            <TouchableOpacity
              onPress={() => Linking.openURL(
                url.startsWith("http") ? url : `https://${url}`
              )}
              style={styles.linkRow}
            >
              <Ionicons name="link-outline" size={12} color={PRIMARY} />
              <Text style={styles.linkText} numberOfLines={1}>
                {url.replace(/https?:\/\//, "")}
              </Text>
            </TouchableOpacity>
          ) : null}

          <View style={styles.dateRow}>
            <Ionicons name="time-outline" size={11} color="#9CA3AF" />
            <Text style={styles.date}>{formatDate(item.created_at)}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Notifications" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Notifications" />
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[PRIMARY]}
          />
        }
        contentContainerStyle={[
          styles.list,
          notifications.length === 0 && styles.listEmpty,
        ]}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="notifications-off-outline" size={42} color="#D1D5DB" />
            <Text style={styles.emptyText}>No Notifications</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  list: {
    padding: 12,
  },
  listEmpty: {
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PRIMARY,
    marginTop: 5,
    flexShrink: 0,
  },
  cardContent: {
    flex: 1,
  },
  message: {
    fontSize: 13,
    color: "#1F2937",
    lineHeight: 19,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
    backgroundColor: "#EFF8FD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  linkText: {
    fontSize: 11,
    color: PRIMARY,
    fontWeight: "500",
    maxWidth: 220,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  date: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: "#9CA3AF",
    fontWeight: "500",
  },
});