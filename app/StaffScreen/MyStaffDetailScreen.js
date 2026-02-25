import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { otherServices } from "../../services/otherServices";
import AppHeader from "../components/AppHeader";

const COLORS = {
  primary: "#1565A9",
  background: "#F4F6F9",
  text: "#111827",
  subText: "#6B7280",
  border: "#E5E7EB",
  danger: "#FF5A3C",
};

const USER_SESSION = {
  user_id: 367102,
  group_id: 2265,
  flat_no: "CL1-T112",
  unit_id: 367102,
  society_id: 290,
};

const MyStaffDetailScreen = ({ route }) => {
  const { staff } = route.params;
  const navigation = useNavigation();

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingRating, setExistingRating] = useState(null);
  const [fetchingRating, setFetchingRating] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // ✅ Moved inside component so `staff` is accessible
  const houseCount = (() => {
    try {
      if (staff.work_location) {
        const parsed = JSON.parse(staff.work_location);
        return Array.isArray(parsed) ? parsed.length : 0;
      }
    } catch {}
    return 0;
  })();

  const notifyEnabled = (() => {
    try {
      if (staff.notify_to) {
        const parsed = JSON.parse(staff.notify_to);
        return Array.isArray(parsed) && parsed.length > 0;
      }
    } catch {}
    return false;
  })();

  // ✅ Moved inside component
  const handleCall = (number) => {
    if (!number) return;
    Linking.openURL(`tel:${number}`);
  };

  useEffect(() => {
    fetchExistingRating();
  }, []);

  const fetchExistingRating = async () => {
    try {
      setFetchingRating(true);

      const API_TOKEN = "4bfc17bc65cf55286e45728a4b8c3f0e893bc5cbe4fb518db3961231bb382af7";
      const staffId = staff.staff_id || staff.id;
      const userIdParam = encodeURIComponent(JSON.stringify(USER_SESSION));

      const url = `https://vms-api.isocietymanager.com/v1/society/${USER_SESSION.society_id}/getStaffRatingByStaffId?api-token=${API_TOKEN}&user-id=${userIdParam}&staff_id=${staffId}`;

      const response = await fetch(url, { method: "GET" });
      const res = await response.json();

      if (res?.status === "success" && res.data?.length > 0) {
        const data = res.data[0];
        setExistingRating(data);
        setRating(parseFloat(data.rating) || 0);
        setReview(data.remarks || "");
      } else {
        setExistingRating(null);
      }
    } catch (error) {
      console.log("Fetch rating error:", error);
      setExistingRating(null);
    } finally {
      setFetchingRating(false);
    }
  };

  const handleRelease = () => {
    Alert.alert(
      "Release Staff",
      "Are you sure you want to release this staff?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              setLoading(true);
              const res = await otherServices.unassignStaff(staff.staff_id || staff.id);
              setLoading(false);

              if (res?.status === "success") {
                navigation.goBack();
              } else {
                Alert.alert("Error", res?.message || "Unable to release staff");
              }
            } catch (error) {
              setLoading(false);
              Alert.alert("Error", "Failed to release staff");
            }
          },
        },
      ]
    );
  };

  const handleSubmitRating = async () => {
    if (!rating) {
      Alert.alert("Please select a rating");
      return;
    }

    try {
      setLoading(true);
      const res = await otherServices.addOrUpdateRating(
        staff.staff_id || staff.id,
        rating,
        review
      );
      setLoading(false);

      if (res?.status === "success") {
        Alert.alert("Success", isEditing ? "Rating updated!" : "Rating submitted!");
        setIsEditing(false);
        fetchExistingRating();
      } else {
        Alert.alert("Error", res?.message || "Failed to submit rating");
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Failed to submit rating");
    }
  };

  const renderInteractiveStars = () =>
    [1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity key={star} onPress={() => setRating(star)}>
        <Ionicons
          name={star <= rating ? "star" : "star-outline"}
          size={32}
          color={star <= rating ? "#F59E0B" : "#9CA3AF"}
          style={{ marginHorizontal: 5 }}
        />
      </TouchableOpacity>
    ));

  const renderDisplayStars = (value) => {
    const rounded = Math.round(parseFloat(value) || 0);
    return [1, 2, 3, 4, 5].map((star) => (
      <Ionicons
        key={star}
        name={star <= rounded ? "star" : "star-outline"}
        size={22}
        color={star <= rounded ? "#F59E0B" : "#D1D5DB"}
        style={{ marginHorizontal: 2 }}
      />
    ));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <AppHeader title="Staff Details" onBack={() => navigation.goBack()} />
      <ScrollView>

        {/* PROFILE */}
        <View style={styles.profileContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={70} color="#94A3B8" />
          </View>
          <Text style={styles.name}>{staff.name?.toUpperCase()}</Text>
          <Text style={styles.subInfo}>
            {staff.address || "Pune"} | {staff.category} | {staff.mobile || "N/A"}
          </Text>
        </View>

        {/* ✅ INFO ROW — each stat is its own separate infoItem */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoNumber}>{staff.code || staff.id}</Text>
            <Text style={styles.infoLabel}>Emp ID</Text>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoItem}>
            <Text style={[
              styles.infoNumber,
              { color: staff.status === "PRESENT" ? "#16A34A" : COLORS.danger },
            ]}>
              {staff.status || "N/A"}
            </Text>
            <Text style={styles.infoLabel}>Status</Text>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoItem}>
            <Text style={styles.infoNumber}>{staff.designation || "—"}</Text>
            <Text style={styles.infoLabel}>Role</Text>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoItem}>
            <Text style={styles.infoNumber}> <Text>{houseCount}</Text></Text>
            <Text style={styles.infoLabel}>Houses</Text>
          </View>
        </View>

        {/* ✅ NOTIFICATIONS — its own full-width row, not crammed with buttons */}
        <View style={styles.notifyRow}>
          <View style={styles.notifyLeft}>
            <Ionicons name="notifications-outline" size={18} color={COLORS.primary} />
            <Text style={styles.notifyLabel}>Notifications</Text>
          </View>
          <Switch
            value={notifyEnabled}
            onValueChange={(value) => {
              console.log("Toggle notification:", value);
              // Connect API here later
            }}
            trackColor={{ true: COLORS.primary }}
          />
        </View>

        {/* ✅ ACTION ROW — only buttons here */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.attendanceBtn}
            onPress={() => navigation.navigate("MyStaffAttendanceScreen", { staff })}
          >
            <Text style={styles.attendanceText}>Attendance</Text>
          </TouchableOpacity>

          {staff.mobile && (
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => handleCall(staff.mobile)}
            >
              <Ionicons name="call" size={16} color="#fff" />
              <Text style={styles.callText}>Call</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.releaseBtn, { opacity: loading ? 0.6 : 1 }]}
            onPress={handleRelease}
            disabled={loading}
          >
            <Text style={styles.releaseText}>
              {loading ? "Releasing..." : "Release"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* RATING SECTION */}
        <View style={styles.rateSection}>
          {fetchingRating ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }} />

          ) : existingRating && !isEditing ? (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.rateTitle}>Your Rating</Text>
                <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
                  <Ionicons name="pencil" size={13} color={COLORS.primary} />
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.ratingDisplayCard}>
                <View style={styles.starsRow}>
                  {renderDisplayStars(existingRating.rating)}
                  <Text style={styles.ratingNumber}>
                    {parseFloat(existingRating.rating).toFixed(1)}
                  </Text>
                </View>

                {existingRating.remarks ? (
                  <Text style={styles.reviewDisplay}>"{existingRating.remarks}"</Text>
                ) : (
                  <Text style={styles.noReviewText}>No review written</Text>
                )}
              </View>
            </>

          ) : (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.rateTitle}>
                  {isEditing ? "Edit Rating" : "Rate Your Staff"}
                </Text>
                {isEditing && (
                  <TouchableOpacity onPress={() => setIsEditing(false)}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={{ flexDirection: "row", marginVertical: 12 }}>
                {renderInteractiveStars()}
              </View>

              <TextInput
                placeholder="Write your review (optional)"
                value={review}
                onChangeText={setReview}
                multiline
                style={styles.reviewInput}
              />

              <TouchableOpacity
                style={[styles.submitBtn, { opacity: loading ? 0.6 : 1 }]}
                onPress={handleSubmitRating}
                disabled={loading}
              >
                <Text style={styles.submitText}>
                  {loading ? "Submitting..." : isEditing ? "Update" : "Submit"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </SafeAreaView>
  );
};

export default MyStaffDetailScreen;

const styles = StyleSheet.create({


  profileContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
    color: COLORS.text,
  },
  subInfo: {
    marginTop: 6,
    color: COLORS.subText,
    fontSize: 13,
  },

  // Info row
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#fff",
  },
  infoItem: {
    alignItems: "center",
    flex: 1,
  },

  infoNumber: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.subText,
    marginTop: 4,
  },

  // Notify row — standalone full-width row
  notifyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  notifyLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  notifyLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },

  // Action buttons row
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },
  attendanceBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    justifyContent: "center",
    paddingVertical: 11,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  attendanceText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#16A34A",
    paddingVertical: 11,
    borderRadius: 8,
  },
  callText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  releaseBtn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.danger,
    paddingVertical: 11,
    borderRadius: 8,
  },
  releaseText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  // Rating section
  rateSection: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rateTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  editBtnText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "600",
  },
  cancelText: {
    fontSize: 13,
    color: COLORS.danger,
    fontWeight: "600",
  },
  ratingDisplayCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  ratingNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#B45309",
    marginLeft: 8,
  },
  reviewDisplay: {
    fontSize: 14,
    color: COLORS.subText,
    fontStyle: "italic",
    lineHeight: 20,
  },
  noReviewText: {
    fontSize: 13,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  reviewInput: {
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    height: 120,
    marginTop: 10,
    textAlignVertical: "top",
    fontSize: 14,
    color: COLORS.text,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    alignSelf: "flex-end",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 15,
    marginBottom: 10,
  },
  submitText: {
    color: "#fff",
    fontWeight: "600",
  },
  loaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});