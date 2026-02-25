// StaffDetailScreen.js

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { otherServices } from "../../services/otherServices";
import AppHeader from "../components/AppHeader";
import StatusModal from "../components/StatusModal";

const COLORS = {
  primary: "#1565A9",
  background: "#F4F6F9",
  text: "#111827",
  subText: "#6B7280",
  border: "#E5E7EB",
};

const StaffDetailScreen = ({ route, navigation }) => {
  const { staff } = route.params;

  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loadingRating, setLoadingRating] = useState(true);
  const [assigning, setAssigning] = useState(false);
  
  // ✅ Status Modal states
  const [statusModal, setStatusModal] = useState({
    visible: false,
    type: "success",
    title: "",
    subtitle: "",
  });

  useEffect(() => {
    fetchRating();
  }, []);

  const fetchRating = async () => {
    try {
      setLoadingRating(true);

      const res = await otherServices.getStaffRatingById(staff.id);

      if (res?.status === "success") {
        const reviewData = res.data || [];

        setReviews(reviewData);

        if (reviewData.length > 0) {
          const total = reviewData.reduce(
            (sum, item) => sum + parseFloat(item.rating),
            0
          );

          setAverageRating((total / reviewData.length).toFixed(1));
        } else {
          setAverageRating(0);
        }
      }
    } catch (error) {
      console.log("Rating fetch error:", error);
    } finally {
      setLoadingRating(false);
    }
  };

  const handleAssociate = async () => {
    try {
      setAssigning(true);

      const res = await otherServices.assignStaff(staff.id);

      if (res?.status === "success") {
        // ✅ Show success modal
        setStatusModal({
          visible: true,
          type: "success",
          title: "Associated!",
          subtitle: `${staff.name} has been added`,
        });

        // ✅ Auto-navigate after 2 seconds
        setTimeout(() => {
               setStatusModal({
          visible: false,
        });
          navigation.navigate("StaffScreen", {
            tabIndex: 0,
          });
        }, 2000);
      } else {
        // ✅ Show error modal
        setStatusModal({
          visible: true,
          type: "error",
          title: "Failed",
          subtitle: res?.message || "Something went wrong",
        });

        // Auto-dismiss error after 2 seconds
        setTimeout(() => {
          setStatusModal({ ...statusModal, visible: false });
        }, 2000);
      }
    } catch (error) {
      // ✅ Show error modal
      setStatusModal({
        visible: true,
        type: "error",
        title: "Error",
        subtitle: "Association failed",
      });

      // Auto-dismiss error after 2 seconds
      setTimeout(() => {
        setStatusModal({ ...statusModal, visible: false });
      }, 2000);
    } finally {
      setAssigning(false);
    }
  };

  const parseWorkLocations = (raw) => {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const workLocations = staff.work_location
    ? parseWorkLocations(staff.work_location)
    : [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <AppHeader title="Staff Detail" onBack={() => navigation.goBack()} />
      <ScrollView>

        {/* Profile */}
        <View style={styles.profileContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={70} color="#94A3B8" />
          </View>

          <Text style={styles.name}>
            {staff.name?.toUpperCase()}{" "}
            {!loadingRating && parseFloat(averageRating) > 0 && (
              <Text style={styles.rating}>
                {"  |  "}
                {averageRating}
              </Text>
            )}
          </Text>

          <Text style={styles.subInfo}>
            {staff.address || "-"} | {staff.category || "-"} |{" "}
            {staff.mobile || "-"}
          </Text>
        </View>

        {/* Info Row */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoNumber}>{staff.id || "-"}</Text>
            <Text style={styles.infoLabel}>ID</Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="home" size={22} color={COLORS.primary} />
            <Text style={styles.infoLabel}>
              {workLocations.length}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoNumber}>
              {staff.access_card_number || "-"}
            </Text>
            <Text style={styles.infoLabel}>Access No.</Text>
          </View>
        </View>

        {/* Associate Button with Loading Label */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.associateButton,
              assigning && styles.associateButtonDisabled,
            ]}
            onPress={handleAssociate}
            disabled={assigning}
          >
            {assigning ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.associateText}>Associate</Text>
            )}
          </TouchableOpacity>

          {/* ✅ Loading label below button */}
          {assigning && (
            <Text style={styles.loadingLabel}>Associating...</Text>
          )}
        </View>

        {/* Reviews Section */}
        <View style={styles.reviewCard}>
          <Text style={styles.reviewTitle}>Reviews</Text>

          {loadingRating ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : reviews.length > 0 ? (
            reviews.map((item, index) => (
              <View key={index} style={{ marginTop: 14 }}>
                <Text style={{ fontSize: 16 }}>
                  {"⭐".repeat(Math.round(item.rating))}
                </Text>

                <Text style={styles.reviewText}>
                  {item.display_name} On{" "}
                  {item.created_at?.split(" ")[0]}
                </Text>

                {item.remarks ? (
                  <Text style={{ marginTop: 4, color: COLORS.subText }}>
                    {item.remarks}
                  </Text>
                ) : null}
              </View>
            ))
          ) : (
            <Text style={{ color: COLORS.subText, marginTop: 10 }}>
              No Reviews Available
            </Text>
          )}
        </View>

      </ScrollView>

      {/* ✅ Status Modal */}
      <StatusModal
        visible={statusModal.visible}
        type={statusModal.type}
        title={statusModal.title}
        subtitle={statusModal.subtitle}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    marginLeft: 12,
    fontWeight: "600",
  },
  profileContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 16,
    color: COLORS.text,
  },
  rating: {
    color: COLORS.primary,
    fontSize: 18,
  },
  subInfo: {
    marginTop: 6,
    color: COLORS.subText,
    fontSize: 14,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  infoItem: {
    alignItems: "center",
  },
  infoNumber: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.primary,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.subText,
    marginTop: 4,
  },
  buttonContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  associateButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 3,
    minWidth: 130,
  },
  associateButtonDisabled: {
    opacity: 0.7,
  },
  associateText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  // ✅ Loading label style
  loadingLabel: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.subText,
    fontWeight: "500",
  },
  reviewCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 10,
    padding: 16,
    elevation: 3,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  reviewText: {
    marginTop: 6,
    color: COLORS.subText,
  },
});

export default StaffDetailScreen;