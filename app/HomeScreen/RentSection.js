import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePermissions } from "../../Utils/ConetextApi";
import { SafeAreaView } from "react-native-safe-area-context";
import { ismServices } from "../../services/ismServices";

const ResidentProfile = () => {
  const { nightMode } = usePermissions();

  const [userDetails, setUserDetails] = useState();
  const [bill, setBill] = useState();
  const [loading, setLoading] = useState(true);

  const colors = {
    background: nightMode ? "#0b1220" : "#F8FAFC",
    card: nightMode ? "#111827" : "#FFFFFF",
    text: nightMode ? "#F9FAFB" : "#0F172A",
    subText: nightMode ? "#9CA3AF" : "#64748B",
    primary: "#0EA5E9",
    primaryDark: "#0284C7",
    online: "#22C55E",
    border: nightMode ? "#1F2937" : "#E5E7EB",
  };

  const loadData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("userInfo");

      if (!storedUser) {
        console.log("No user found in storage");
        return;
      }

      // ✅ Fetch full user details from API
      const detailsRes = await ismServices.getUserDetails();
      setUserDetails(detailsRes);

      // ✅ Fetch balance
      const billRes = await ismServices.getMyBalance();
      setBill(billRes.data);

    } catch (err) {
      console.log("Profile Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);


  if (loading) {
    return (
      <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.safeArea, { backgroundColor: colors.background }]}

    >
      <View style={styles.container}>

        {/* PROFILE CARD */}
        <LinearGradient
          colors={[colors.primaryDark, colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <Text style={styles.greeting}>
            Hi, {userDetails?.name || "Resident"}
          </Text>

          <View style={styles.profileRow}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{
                  uri:
                    userDetails?.image_src ||
                    "https://i.pravatar.cc/150",
                }}
                style={styles.avatar}
              />
              <View
                style={[styles.onlineDot, { backgroundColor: colors.online }]}
              />
            </View>

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

        {/* BILL CARD */}
        <View
          style={[
            styles.billCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.billHeader}>
            <Ionicons
              name="receipt-outline"
              size={18}
              color={colors.subText}
            />
            <Text style={[styles.billLabel, { color: colors.subText }]}>
              {bill?.bill_type || " Bill"}
            </Text>
          </View>

          <Text style={[styles.billAmount, { color: colors.text }]}>
            ₹{bill?.balance?.toLocaleString("en-IN") ?? "0"} 
          </Text>

          <TouchableOpacity
            style={[styles.payButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.payButtonText}>Pay Now</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
};

export default ResidentProfile;

const styles = StyleSheet.create({
  safeArea: { flex: 1 ,
     paddingHorizontal: 10,
    paddingTop: 5,
    paddingBottom: 15,

    gap: 12,
    marginTop:5
   },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingTop: 5,
    paddingBottom: 50,
    gap: 12,
    marginTop:5
  },

  profileCard: {
    flex: 6,
    borderRadius: 20,
    padding: 10,
    elevation: 6,
    justifyContent: "flex-start",
    paddingLeft:15
    

    
  },

  greeting: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
  },

  avatarWrapper: { position: "relative" },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#fff",
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

  profileDetails: { gap: 5 },

badge: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "rgba(255,255,255,0.25)",
  paddingHorizontal: 10,
  paddingVertical: 3,
  borderRadius: 10,
  width: "100%",
  alignSelf: "stretch",
},
  badgeText: {
    color: "#fff",
    fontSize: 11.5,
    fontWeight: "600",
    marginLeft: 6,
  },

  billCard: {
    flex: 3,
    borderRadius: 18,
  
    borderWidth: 1,
    elevation: 4,
    justifyContent: "space-between",
  },

  billHeader: {
    flexDirection: "row",
    alignItems: "center",
      paddingTop: 10,
    paddingLeft:15,
    gap: 6,
  },

  billLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },

  billAmount: {
    fontSize: 18,
    fontWeight: "800",
    paddingLeft:15,
    marginTop: 4,
  },

  payButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "content",
    padding: 10,
    borderEndEndRadius: 18,
    borderBottomLeftRadius: 18,
    marginBottom:-1
  
  },

  payButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});