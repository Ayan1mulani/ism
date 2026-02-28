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
import AppHeader from "../components/AppHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import { otherServices } from "../../services/otherServices";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const AmenitiesListScreen = () => {
  const { nightMode } = usePermissions();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [amenities, setAmenities] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState({});

  const theme = {
    background: nightMode ? "#0F172A" : "#F9FAFB",
    card: nightMode ? "#1E293B" : "#FFFFFF",
    text: nightMode ? "#F1F5F9" : "#111827",
    subText: nightMode ? "#CBD5E1" : "#6B7280",
    border: nightMode ? "#334155" : "#E5E7EB",
    primary: "#1996D3",
    success: "#10B981",
  };

  useEffect(() => {
    fetchAmenities();
  }, []);

  const fetchAmenities = async () => {
    try {
      const response = await otherServices.getAmenities();

      // Depending on your ApiCommon structure
      const data = response?.data || response || [];

      setAmenities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Amenity Error:", err);
      setAmenities([]);
    } finally {
      setLoading(false);
    }
  };

  const onImageScroll = (event, itemId) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const index = Math.round(contentOffset.x / (width - 32));

    setCurrentImageIndex((prev) => ({
      ...prev,
      [itemId]: index,
    }));
  };

  const renderAmenity = ({ item }) => {
    const isExpanded = expandedId === item.id;
    const imageIndex = currentImageIndex[item.id] || 0;
    const hasImages = item.image && item.image.length > 0;

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
          },
        ]}
      >
        {/* IMAGE CAROUSEL */}
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
                <Image
                  key={index}
                  source={{ uri: img }}
                  style={styles.image}
                  resizeMode="cover"
                />
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
                          index === imageIndex
                            ? theme.primary
                            : theme.border,
                      },
                    ]}
                  />
                ))}
              </View>
            )}
          </>
        ) : (
          <View
            style={[
              styles.noImageContainer,
              { backgroundColor: theme.border },
            ]}
          >
            <Ionicons
              name="image-outline"
              size={40}
              color={theme.subText}
            />
            <Text
              style={[
                styles.noImageText,
                { color: theme.subText },
              ]}
            >
              No images available
            </Text>
          </View>
        )}

        {/* CONTENT */}
        <View style={styles.content}>
          {/* HEADER */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.title, { color: theme.text }]}
              >
                {item.name}
              </Text>
            </View>

            {item.is_booking === 1 && (
              <View
                style={[
                  styles.bookingBadge,
                  { backgroundColor: theme.success },
                ]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color="#fff"
                />
                <Text style={styles.bookingText}>
                  Bookable
                </Text>
              </View>
            )}
          </View>

          {/* DESCRIPTION */}
          {item.description && (
            <View style={styles.descriptionSection}>
              <Text
                numberOfLines={isExpanded ? undefined : 2}
                style={[
                  styles.description,
                  { color: theme.subText },
                ]}
              >
                {item.description}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setExpandedId(isExpanded ? null : item.id)
                }
                style={styles.readMoreBtn}
              >
                <Text
                  style={{
                    color: theme.primary,
                    fontSize: 13,
                    fontWeight: "600",
                  }}
                >
                  {isExpanded
                    ? "Show Less"
                    : "Read More"}
                </Text>
                <Ionicons
                  name={
                    isExpanded
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  size={16}
                  color={theme.primary}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* ADDRESS */}
          {item.address && (
            <View style={styles.addressRow}>
              <Ionicons
                name="location-sharp"
                size={16}
                color={theme.primary}
              />
              <Text
                style={[
                  styles.smallText,
                  { color: theme.subText },
                ]}
              >
                {item.address}
              </Text>
            </View>
          )}

          {/* BOOK BUTTON */}
          {item.is_booking === 1 && (
            <TouchableOpacity
              style={[
                styles.bookBtn,
                { backgroundColor: theme.primary },
              ]}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate("AmenityBooking", {
                  amenity: item,
                })
              }
            >
              <Ionicons
                name="calendar-outline"
                size={18}
                color="#fff"
              />
              <Text style={styles.bookText}>
                Book Now
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.background },
        ]}
      >
        <AppHeader title="Amenities" />
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color={theme.primary}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!amenities.length) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.background },
        ]}
      >
        <AppHeader title="Amenities" />
        <View style={styles.emptyContainer}>
          <Ionicons
            name="folder-open-outline"
            size={60}
            color={theme.subText}
          />
          <Text
            style={[
              styles.emptyText,
              { color: theme.text },
            ]}
          >
            No Amenities Available
          </Text>
          <Text
            style={[
              styles.emptySubText,
              { color: theme.subText },
            ]}
          >
            Check back later for available amenities
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      <AppHeader title="Amenities" />

      <FlatList
        data={amenities}
        keyExtractor={(item) =>
          item.id.toString()
        }
        renderItem={renderAmenity}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={5}
        windowSize={5}
        removeClippedSubviews
      />
    </SafeAreaView>
  );
};

export default AmenitiesListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  listContent: {
    padding: 16,
    paddingBottom: 32,
  },

  card: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
  },

  image: {
    width: width - 32,
    height: 200,
  },

  noImageContainer: {
    width: width - 32,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },

  noImageText: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: "500",
  },

  indicators: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    gap: 6,
  },

  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  content: {
    padding: 16,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 8,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
  },

  bookingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  bookingText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },

  descriptionSection: {
    marginBottom: 12,
  },

  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },

  readMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },

  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 8,
  },

  smallText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },

  bookBtn: {
    marginTop: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  bookText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },

  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
    textAlign: "center",
  },

  emptySubText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
});