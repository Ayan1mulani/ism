import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePermissions } from "../../Utils/ConetextApi";
import { SafeAreaView } from "react-native-safe-area-context";
import { otherServices } from "../../services/otherServices";
import { useNavigation } from "@react-navigation/native";
import AppHeader from "../components/AppHeader";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

const { width } = Dimensions.get("window");

const AmenitiesListScreen = () => {
  const { nightMode } = usePermissions();
  const navigation = useNavigation();
  const [todayBookings, setTodayBookings] = useState({});
  const [loading, setLoading] = useState(true);
  const [amenities, setAmenities] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState({});

  const theme = {
    background: nightMode ? "#0F172A" : "#F3F4F6",
    card: nightMode ? "#1E293B" : "#FFFFFF",
    text: nightMode ? "#F1F5F9" : "#111827",
    subText: nightMode ? "#CBD5E1" : "#6B7280",
    border: nightMode ? "#334155" : "#E5E7EB",
    primary: "#1996D3",
    success: "#10B981",
  };
useFocusEffect(
  useCallback(() => {
     setLoading(true); 
    fetchAmenities();
  }, [])
);

const fetchAmenities = async () => {
  try {
    const response = await otherServices.getAmenities();
    const data = Array.isArray(response) ? response : [];

    await fetchTodayBookings(data);   // 👈 await here
    setAmenities(data);

  } catch (err) {
    console.log("Amenity Error:", err);
  } finally {
    setLoading(false);
  }
};
const fetchTodayBookings = async (amenityList) => {
  const today = new Date().toISOString().split("T")[0];

  const counts = {}; 

  await Promise.all(
    amenityList.map(async (item) => {
      try {
        const res = await otherServices.getAmenityBookingsById(item.id);

        const bookings = res?.data || [];

        const todayCount = bookings.filter(b =>
          b.booking_from?.startsWith(today)
        ).length;

        counts[item.id] = todayCount;

      } catch {
        counts[item.id] = 0;
      }
    })
  );

  setTodayBookings(counts);
};

  const onImageScroll = (event, itemId) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const index = Math.round(contentOffset.x / (width - 32));
    setCurrentImageIndex((prev) => ({ ...prev, [itemId]: index }));
  };

  const renderAmenity = ({ item }) => {
    const isExpanded = expandedId === item.id;
    const imageIndex = currentImageIndex[item.id] || 0;
    const hasImages = item.image && item.image.length > 0;
    const isActive = item.is_booking === 1;
let rules = {};
try {
  rules = JSON.parse(item.rules || "{}");
} catch {
  rules = {};


}
let parsedSlot = {};
try {
  const temp = JSON.parse(item.slot || "{}");
  parsedSlot = temp && typeof temp === "object" ? temp : {};
} catch {
  parsedSlot = {};
}
const maxPerDay = rules?.max_per_day || 0;
const todayCount = todayBookings[item.id] || 0;
const isFull = todayCount >= maxPerDay;

    const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

    return (
      <View
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        {/* IMAGE SECTION */}
        <View style={styles.imageWrapper}>
          {hasImages ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(e) => onImageScroll(e, item.id)}
                scrollEventThrottle={16}
              >
                {item.image.map((img, index) => (
                  <Image key={index} source={{ uri: img }} style={styles.image} />
                ))}
              </ScrollView>

              {item.image.length > 1 && (
                <View style={styles.indicators}>
                  {item.image.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.indicator,
                        {
                          backgroundColor:
                            index === imageIndex ? theme.primary : theme.border,
                        },
                      ]}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={[styles.noImageContainer, { backgroundColor: theme.border }]}>
              <Ionicons name="image-outline" size={36} color={theme.subText} />
              <Text style={[styles.noImageText, { color: theme.subText }]}>
                No images available
              </Text>
            </View>
          )}


        </View>

        {/* CONTENT */}
        <View style={styles.content}>
          {/* TITLE */}
          <Text style={[styles.title, { color: theme.text }]}>{item.name}</Text>
          <View style={{ marginTop: 4 }}>
  <Text
    style={{
      fontSize: 12,
      fontWeight: "600",
      color: isFull ? "#EF4444" : "#10B981",
    }}
  >
    TODAY {todayCount} / {maxPerDay}
  </Text>
</View>
          {/* STATUS BADGE — top right corner over image */}
          <View
            style={[
              styles.badge,
              { backgroundColor: isActive ? "#10B981" : "#6B7280" },
            ]}
          >
            <Text style={styles.badgeText}>
              {isActive ? "Open" : "Closed"}
            </Text>
          </View>

          {/* DESCRIPTION */}
          {item.description && (
            <View style={{ marginTop: 4 }}>
              <Text
                numberOfLines={isExpanded ? undefined : 2}
                style={[styles.description, { color: theme.subText }]}
              >
                {item.description}
              </Text>

            </View>
          )}

          {/* DAYS ROW + BOOK BUTTON */}
          <View style={styles.bottomRow}>
            {/* S M T W T F S */}
            <View style={styles.daysRow}>
              {weekDays.map((day, index) => {
                const isAvailable = parsedSlot[index]?.avl === true;
                return (
                  <Text
                    key={index}
                    style={[
                      styles.dayLabel,
                      { color: isAvailable ? "#10B981" : theme.subText },
                    ]}
                  >
                    {day}
                  </Text>
                );
              })}
            </View>

            {/* BOOK BUTTON */}
            {isActive && (
              <TouchableOpacity
                style={[styles.bookBtn, { backgroundColor: theme.primary }]}
                onPress={() =>
                  navigation.navigate("AmenityBooking", { amenity: item })
                }
              >
                <Ionicons name="calendar-outline" size={14} color="#fff" />
                <Text style={styles.bookText}>Book Now</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <AppHeader title={"Ameneties"} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (

        <FlatList
          data={amenities}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderAmenity}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default AmenitiesListScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  listContent: {
    padding: 12,
    paddingBottom: 30,
    gap: 12,
  },

  card: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
  },

  imageWrapper: {
    position: "relative",
  },

  image: {
    width: width - 24,
    height: 180,
    resizeMode: "cover",
  },

  noImageContainer: {
    width: "100%",
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },

  noImageText: {
    fontSize: 13,
    marginTop: 6,
    fontWeight: "500",
  },

  indicators: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
  },

  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 7,
  },

  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },

  content: {
    padding: 12,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },

  description: {
    fontSize: 13,
    lineHeight: 19,
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },

  daysRow: {
    flexDirection: "row",
    gap: 5,
  },

  dayLabel: {
    fontSize: 11,
    fontWeight: "700",
  },

  bookBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  bookText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
});