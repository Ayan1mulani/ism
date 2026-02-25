import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { otherServices } from "../../services/otherServices";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import AppCard from "../components/AppCard";
import AppSearchBar from "../components/AppSearchBar";
const COLORS = {
  primary: "#1996D3",
  light: {
    background: "#FFFFFF",
    surface: "#ffffff",
    text: "#212529",
    textSecondary: "#6C757D",
    border: "#DEE2E6",
  },
  dark: {
    background: "#121212",
    surface: "#1E1E1E",
    text: "#FFFFFF",
    textSecondary: "#9E9E9E",
    border: "#2C2C2C",
  },
};

const MyStaffScreen = ({ nightMode }) => {
  const navigation = useNavigation();

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const theme = nightMode ? COLORS.dark : COLORS.light;
  const styles = createStyles(theme);

  useFocusEffect(
    useCallback(() => {
      fetchStaff();
    }, [])
  );

  const fetchStaff = async () => {
    try {
      setLoading(true);

      const res = await otherServices.getAllStaffs();

      if (res?.status === "success") {
        const staffData = res.data.map((staff) => {
          let avgRating = null;

          try {
            if (staff.avg_rating) {
              const parsed = JSON.parse(staff.avg_rating);
              avgRating = parsed?.[0]?.average_rating
                ? parseFloat(parsed[0].average_rating)
                : null;
            }
          } catch {
            avgRating = null;
          }

          return { ...staff, avgRating };
        });

        setStaffList(staffData);
      } else {
        setStaffList([]);
      }
    } catch (error) {
      console.log("My Staff fetch error:", error);
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = useMemo(() => {
    if (!search.trim()) return staffList;
    const q = search.toLowerCase();

    return staffList.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.designation?.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q) ||
        s.code?.toString().includes(q)
    );
  }, [search, staffList]);

  const renderStars = (rating) => {
    const rounded = Math.round(rating);

    return [1, 2, 3, 4, 5].map((star) => (
      <Ionicons
        key={star}
        name={star <= rounded ? "star" : "star-outline"}
        size={12}
        color={star <= rounded ? "#FACC15" : theme.textSecondary}
      />
    ));
  };

  const renderItem = ({ item }) => (
    <AppCard theme={theme}>
      <TouchableOpacity
        style={styles.cardContent}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate("MyStaffDetailScreen", { staff: item })
        }
      >
        <View style={styles.leftRow}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={22} color={theme.textSecondary} />
          </View>

          <View>
            <Text style={[styles.name, { color: theme.text }]}>
              {item.name}
            </Text>

            <Text style={[styles.role, { color: theme.textSecondary }]}>
              {item.designation || item.category || "No Role"}
            </Text>

            {item.avgRating !== null && (
              <View style={styles.starsRow}>
                {renderStars(item.avgRating)}
              </View>
            )}
          </View>
        </View>

        <View style={styles.rightCol}>
     
          <Text style={[styles.empCode, { color: theme.textSecondary }]}>
            Id-{item.code}
          </Text>
        </View>
      </TouchableOpacity>
    </AppCard>
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <AppSearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search by name, role or ID..."
        theme={theme}
      />

      <FlatList
        data={filteredStaff}
        keyExtractor={(item, index) =>
          item.id ? item.id.toString() : index.toString()
        }
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons
              name="search-outline"
              size={40}
              color={theme.textSecondary}
            />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              {search ? `No results for "${search}"` : "No Staff Found"}
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default MyStaffScreen;

const createStyles = (theme) =>
  StyleSheet.create({
    cardContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    leftRow: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 12,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.surface,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    name: {
      fontSize: 15,
      fontWeight: "600",
    },
    role: {
      fontSize: 12,
      marginTop: 3,
    },
    starsRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 5,
    },
    rightCol: {
      alignItems: "flex-start",
    },
    empCode: {
      fontSize: 11,
      fontWeight: "600",
    },
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 60,
    },
    emptyText: {
      marginTop: 10,
      fontSize: 14,
    },
  });