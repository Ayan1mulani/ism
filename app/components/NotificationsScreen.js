import React, { useEffect, useState, useCallback } from "react";
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

// ─── Constants ───────────────────────────────────────────────────────────────
const PRIMARY = "#1996D3";

const ICON_MAP = {
  payment:      { name: "card-outline",           color: "#8B5CF6" },
  maintenance:  { name: "construct-outline",       color: "#F59E0B" },
  visitor:      { name: "person-add-outline",      color: "#10B981" },
  security:     { name: "shield-checkmark-outline", color: "#EF4444" },
  meeting:      { name: "people-outline",          color: "#3B82F6" },
  notice:       { name: "megaphone-outline",       color: "#F97316" },
  default:      { name: "notifications-outline",   color: PRIMARY   },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extracts the first URL from an <a href> OR bare text like app.factech.co.in/… */
const extractUrl = (raw) => {
  if (!raw) return null;
  const hrefMatch = raw.match(/<a\b[^>]*href="([^"]*)"[^>]*>/i);
  if (hrefMatch) return hrefMatch[1];
  const urlMatch = raw.match(/(https?:\/\/[^\s,<]+|app\.factech\.co\.in\/[^\s,<]+)/i);
  return urlMatch ? urlMatch[1] : null;
};

/** Returns OTP digits if present */
const extractOtp = (raw) => {
  const m = raw?.match(/\bOTP[:\s]+(\d{4,6})\b/i);
  return m ? m[1] : null;
};

const stripHtml = (html) => {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<a\b[^>]*>.*?<\/a>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim();
};

/** Makes raw API message text human-readable */
const humanizeMessage = (raw) => {
  if (!raw) return "";
  let text = stripHtml(raw);

  // Strip bare URLs (shown as tappable button)
  text = text.replace(/(https?:\/\/[^\s,]+|app\.factech\.co\.in\/[^\s,]+)/gi, "").trim();
  // Strip OTP fragment (shown as badge)
  text = text.replace(/,?\s*OTP[:\s]+\d{4,6}/i, "").trim();

  // Fix "Dear ," with missing name
  text = text.replace(/\bDear\s*,/g, "Dear Resident,");

  // Friendlier complaint copy
  text = text.replace(/Your complaint is registered\s*\.?/i, "Your complaint has been registered.");

  // Parking: "Parking Visitor BOOKED Timing 22-02-2026 09:02 22-02-2026 23:19"
  const p = text.match(
    /Parking Visitor BOOKED Timing\s+(\d{2}-\d{2}-\d{4})\s+(\d{2}:\d{2})\s+(\d{2}-\d{2}-\d{4})\s+(\d{2}:\d{2})/i
  );
  if (p) {
    const [, fd, ft, td, tt] = p;
    text = fd === td
      ? `Visitor parking booked on ${fd} from ${ft} to ${tt}.`
      : `Visitor parking booked from ${fd} ${ft} to ${td} ${tt}.`;
  }

  return text.replace(/\s{2,}/g, " ").replace(/,\s*$/, "").trim();
};



const formatDateTime = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const time = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isToday) return `Today • ${time}`;
  if (isYesterday) return `Yesterday • ${time}`;

  const formattedDate = date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });

  return `${formattedDate} • ${time}`;
};
const getIconConfig = (message = "") => {
  const lower = message.toLowerCase();
  for (const [key, config] of Object.entries(ICON_MAP)) {
    if (key !== "default" && lower.includes(key)) return config;
  }
  return ICON_MAP.default;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const NotificationIcon = ({ message }) => {
  const { name, color } = getIconConfig(message);
  return (
    <View style={[styles.iconWrapper, { backgroundColor: color + "18" }]}>
      <Ionicons name={name} size={20} color={color} />
    </View>
  );
};

const LinkButton = ({ url }) => {
  if (!url) return null;

  const handlePress = () =>
    Linking.openURL(url.startsWith("http") ? url : `https://${url}`);

  // Extract only domain
  const getDomain = (link) => {
    try {
      const formatted = link.startsWith("http") ? link : `https://${link}`;
      const parsed = new URL(formatted);
      return parsed.hostname;
    } catch {
      return "Open Link";
    }
  };

  const displayText = getDomain(url);

  return (
    <TouchableOpacity
      style={styles.linkRow}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Ionicons name="open-outline" size={12} color={PRIMARY} />
      <Text style={styles.linkText}>
        {displayText}
      </Text>
    </TouchableOpacity>
  );
};

const NotificationCard = ({ item }) => {
  const cleanMessage = humanizeMessage(item.message);
  const url = extractUrl(item.message);
  const otp = extractOtp(item.message);
  const formattedOtp = otp?.split("").join(" ");

  return (
    <View style={styles.card}>
      <NotificationIcon message={cleanMessage} />

      <View style={styles.cardBody}>
        {/* Message + OTP inline */}
        <Text style={styles.message}>
          {cleanMessage}
          {otp && (
            <Text style={styles.inlineOtp}>
              {"  "} {formattedOtp}
            </Text>
          )}
        </Text>

        {/* Footer Row */}
        <View style={styles.footerRow}>
          {url ? <LinkButton url={url} /> : <View />}
          <Text style={styles.dateText}>
           {formatDateTime(item.created_at)}
          </Text>
        </View>
      </View>
    </View>
  );
};
const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconWrapper}>
      <Ionicons name="notifications-off-outline" size={36} color="#9CA3AF" />
    </View>
    <Text style={styles.emptyTitle}>All Caught Up</Text>
    <Text style={styles.emptySubtitle}>You have no notifications right now.</Text>
  </View>
);

const LoadingState = () => (
  <View style={styles.center}>
    <ActivityIndicator size="large" color={PRIMARY} />
    <Text style={styles.loadingText}>Loading notifications...</Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await ismServices.getMyNotifications();
      console.log("Fetched Notifications:", res?.data || []);
      setNotifications(res?.data || []);
    } catch (error) {
      console.log("Notification Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Notifications" />

      {loading ? (
        <LoadingState />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <NotificationCard item={item} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[PRIMARY]}
              tintColor={PRIMARY}
            />
          }
          contentContainerStyle={[
            styles.list,
            notifications.length === 0 && styles.listEmpty,
          ]}
          ListEmptyComponent={<EmptyState />}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      )}
    </SafeAreaView>
  );
};

export default NotificationsScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  list: {
    padding: 16,
    paddingBottom: 30,
  },

  listEmpty: {
    flexGrow: 1,
  },

  card: {
    backgroundColor: "#FFFFFF", // ✅ REQUIRED for Android elevation
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8, // ✅ instead of ItemSeparator gap
    elevation: 0,
  },

  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12, // ✅ instead of gap
  },

  cardBody: {
    flex: 1,
  },

  message: {
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 21,
  },

  inlineOtp: {
    fontSize: 14,
    fontWeight: "700",
    color: "#C2410C",
    letterSpacing: 2,
  },

  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },

  dateText: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
  },

  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF8FD",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 6, // instead of gap
  },

  linkText: {
    fontSize: 11,
    color: PRIMARY,
    fontWeight: "600",
    maxWidth: 200,
    marginLeft: 6,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
  },

  emptyIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 6,
  },

  emptySubtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 10,
  },
});