import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePermissions } from "../../Utils/ConetextApi";
import { Common } from "../../services/Common";
import { ismServices } from "../../services/ismServices";
import { SafeAreaView } from "react-native-safe-area-context";

const ResidentProfile = () => {
  const { nightMode } = usePermissions();

  const [userInfo, setUserInfo] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [bill, setBill] = useState(null);

  const colors = {
    background: nightMode ? "#0b1220" : "#F8FAFC",
    card: nightMode ? "#111827" : "#FFFFFF",
    text: nightMode ? "#F9FAFB" : "#0F172A",
    subText: nightMode ? "#9CA3AF" : "#64748B",
    primary: "#0EA5E9",
    primaryDark: "#0284C7",
    online: "#22C55E",
    border: nightMode ? "#1F2937" : "#E5E7EB",
    shadow: nightMode ? "#000" : "#64748B",
  };

  const getUserInfo = async () => {
    try {
      const user = await AsyncStorage.getItem("userInfo");
      if (user) setUserInfo(JSON.parse(user));

      const details = await Common.getUserDetails();
      if (details) setUserDetails(details);
    } catch (err) {
      console.log(err);
    }
  };

  const getMyBalance = async () => {
    try {
      const res = await ismServices.getMyBalance();
      setBill(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getUserInfo();
    getMyBalance();
  }, []);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View style={styles.container}>
        {/* ================= PROFILE CARD ================= */}
        <LinearGradient
          colors={[colors.primaryDark, colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.profileCard,
            {
              shadowColor: colors.shadow,
            },
          ]}
        >
          <Text style={styles.greeting}>
            Hi, {userInfo?.name || "Resident"} 
          </Text>

          <View style={styles.profileRow}>
            {/* Avatar */}
            <View style={styles.avatarWrapper}>
              <Image
                source={{
                  uri: userDetails?.image_src || "https://i.pravatar.cc/150",
                }}
                style={styles.avatar}
              />
              <View
                style={[styles.onlineDot, { backgroundColor: colors.online }]}
              />
            </View>

            {/* Details */}
            <View style={styles.profileDetails}>
              <View style={styles.badge}>
                <Ionicons name="business" size={12} color="#fff" />
                <Text style={styles.badgeText}>
                  {userDetails?.tower || "N/A"}
                </Text>
              </View>

              <View style={styles.badge}>
                <Ionicons name="home" size={12} color="#fff" />
                <Text style={styles.badgeText}>
                  {userDetails?.flat_no || "N/A"}
                </Text>
              </View>

              <View style={styles.badge}>
                <Ionicons name="calendar" size={12} color="#fff" />
                <Text style={styles.badgeText}>
                  {userDetails?.fc_name || "N/A"}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* ================= BILL CARD ================= */}
        <View
          style={[
            styles.billCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <View style={styles.billHeader}>
            <Ionicons
              name="receipt-outline"
              size={20}
              color={colors.subText}
            />
            <Text style={[styles.billLabel, { color: colors.subText }]}>
              {bill?.bill_type || "Pending Bill"}
            </Text>
          </View>

          <Text style={[styles.billAmount, { color: colors.text }]}>
            ₹{bill?.balance?.toLocaleString("en-IN") ?? "0"}
          </Text>

          <TouchableOpacity
            style={[styles.payButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Text style={styles.payButtonText}>Pay Now</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ResidentProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 70,
    gap: 12,
  },

  /* ================= PROFILE ================= */
  profileCard: {
    flex: 6,
    borderRadius: 20,
    padding: 18,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    justifyContent: "space-between",
    alignContent: "center",
  },

  greeting: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginTop:-10
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap:5,
    marginTop: 10
  },


  avatar: {
    width: 60,
    height: 60,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#fff",
    marginBottom: 4,
  },

  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2.5,
    borderColor: "#fff",
  },

  profileDetails: {
    gap: 5,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    width:"auto",
    borderRadius: 10,
    width: "150%",
    alignSelf: "flex-start",
  },

  badgeText: {
    color: "#fff",
    fontSize: 11.5,
    fontWeight: "600",
    marginLeft: 6,
  },

  /* ================= BILL ================= */
  billCard: {
    flex: 3,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    justifyContent: "space-between",
  },

  billHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  billLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  billAmount: {
    fontSize: 25,
    fontWeight: "800",
    marginTop: 4,
    letterSpacing: -0.5,
  },

  payButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    width: "130%",
    padding:10,
    marginLeft: -14,
    borderRadius: 12,
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    marginBottom:-15
  },

  payButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});