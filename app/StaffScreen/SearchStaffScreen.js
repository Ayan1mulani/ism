import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { otherServices } from "../../services/otherServices";
import { useNavigation } from "@react-navigation/native";
import AppCard from "../components/AppCard";
import AppSearchBar from "../components/AppSearchBar";
import BRAND from '../config'

const myFlatNo = "CL1-T112";
const COLORS = {
  primary: BRAND.COLORS.primary,
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

const SearchStaffScreen = ({ nightMode, categories, categoriesLoading }) => {
  const navigation = useNavigation();

  const [staffList, setStaffList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");
  const [staffLoading, setStaffLoading] = useState(false);

  const theme = nightMode ? COLORS.dark : COLORS.light;
  const styles = createStyles(theme);

  useEffect(() => {
    if (categories?.length > 0 && !selectedCategory) {
      const first = categories[0];
      setSelectedCategory(first);
      fetchStaff(first);
    }
  }, [categories]);

  const isStaffAssociated = (item) => {
  if (!item.work_location) return false;

  const workLocations = parseWorkLocations(item.work_location);

  return workLocations.some(
    (loc) =>
      loc.display_unit_no === myFlatNo ||
      loc.flat_no === myFlatNo
  );
};
  const fetchStaff = async (category) => {
    try {
      setStaffLoading(true);
      setSearch("");

      const res = await otherServices.getStaffByCategory(category);

      if (res?.status === "success") {
        setStaffList(res.data);
        setFilteredList(res.data);
      } else {
        setStaffList([]);
        setFilteredList([]);
      }
    } catch (error) {
      console.log("Staff fetch error:", error);
      setStaffList([]);
      setFilteredList([]);
    } finally {
      setStaffLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    const filtered = staffList.filter((item) =>
      item.name?.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredList(filtered);
  };

  const parseWorkLocations = (raw) => {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const renderItem = ({ item }) => {
    const workLocations = item.work_location
      ? parseWorkLocations(item.work_location)
      : [];

    return (
      <AppCard theme={theme}>
        <TouchableOpacity
          activeOpacity={0.85}
      onPress={() =>
  navigation.navigate(
    isStaffAssociated(item)
      ? "MyStaffDetailScreen"
      : "StaffDetailScreen",
    { staff: item }
  )
}
        >
          <View style={styles.cardHeader}>
            <View style={styles.staffInfo}>
              <Text
                style={[styles.staffName, { color: theme.text }]}
                numberOfLines={1}
              >
                {item.name}
              </Text>

              <Text
                style={[styles.designation, { color: theme.textSecondary }]}
                numberOfLines={1}
              >
                {item.designation || "No Designation"}
              </Text>

              {item.code && (
                <Text
                  style={[styles.empId, { color: theme.textSecondary }]}
                >
                  EMP ID: {item.code}
                </Text>
              )}
            </View>

            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: `${COLORS.primary}15` },
              ]}
            >
              <Text
                style={[
                  styles.categoryBadgeText,
                  { color: COLORS.primary },
                ]}
              >
                {selectedCategory}
              </Text>
            </View>
          </View>

         {(item.mobile || workLocations.length > 0) && (
  <View
    style={[
      styles.cardFooter,
      { borderTopColor: theme.border },
    ]}
  >
    {item.mobile && (
      <View style={styles.footerRow}>
        <Ionicons
          name="call-outline"
          size={14}
          color={theme.textSecondary}
        />
        <Text
          style={[
            styles.footerText,
            { color: theme.textSecondary },
          ]}
        >
          {item.mobile}
        </Text>
      </View>
    )}

    {workLocations.length > 0 && (
      <View style={styles.footerRow}>
        <Ionicons
          name="location-outline"
          size={14}
          color={theme.textSecondary}
        />
        <Text
          style={[
            styles.footerText,
            { color: theme.textSecondary },
          ]}
          numberOfLines={1}
        >
          {workLocations
            .map((loc) => loc.display_unit_no || loc.flat_no)
            .join(", ")}
        </Text>
      </View>
    )}
  </View>
)}
        </TouchableOpacity>
      </AppCard>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="people-outline"
        size={56}
        color={theme.textSecondary}
      />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        No Staff Found
      </Text>
      <Text
        style={[styles.emptySubtitle, { color: theme.textSecondary }]}
      >
        Try another category or search term
      </Text>
    </View>
  );

  return (
    <View
      style={{ flex: 1, backgroundColor: theme.background }}
      edges={["top", "left", "right"]}
    >
      {/* Category Row */}
      <View style={styles.categoryRow}>
  {categoriesLoading ? (
    <ActivityIndicator
      size="small"
      color={COLORS.primary}
      style={{ marginLeft: 16 }}
    />
  ) : (
  <ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={styles.categoryScrollContent}
  scrollEventThrottle={16}
  nestedScrollEnabled={true}
>
      {categories?.map((cat) => {
        const isActive = selectedCategory === cat;
        return (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryChip,
              {
                backgroundColor: isActive
                  ? COLORS.primary
                  : theme.surface,
                borderWidth: isActive ? 0 : 1,
                borderColor: theme.border,
              },
            ]}
            onPress={() => {
              setSelectedCategory(cat);
              fetchStaff(cat);
            }}
          >
            <Text
              style={[
                styles.categoryChipText,
                { color: isActive ? "#fff" : theme.text },
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  )}
</View>

      {/* Reusable Search */}
      <AppSearchBar
        value={search}
        onChangeText={handleSearch}
        placeholder="Search staff by name..."
        theme={theme}
      />

      {/* Staff List */}
      {staffLoading ? (
        <View style={styles.listLoadingState}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={(item, index) =>
            item.id != null ? item.id.toString() : index.toString()
          }
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          nestedScrollEnabled={true}
        />
      )}
    </View>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
categoryRow: {
  paddingVertical: 8,
},

categoryScrollContent: {
  paddingHorizontal: 16,
  paddingVertical: 2,
},

categoryChip: {
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 20,
  marginRight: 8,
},

    categoryChipText: {
      fontSize: 13,
      fontWeight: "600",
      textTransform: "capitalize",
    },

    listLoadingState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },

    listContent: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 40,
    },

    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
    },

    staffInfo: {
      flex: 1,
    },

    staffName: {
      fontSize: 15,
      fontWeight: "700",
      marginBottom: 3,
    },

    designation: {
      fontSize: 13,
    },

    empId: {
      fontSize: 12,
      marginTop: 2,
      fontWeight: "500",
    },

    categoryBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      alignSelf: "flex-start",
    },

    categoryBadgeText: {
      fontSize: 11,
      fontWeight: "700",
    },

    cardFooter: {
      borderTopWidth: 1,
      paddingTop: 10,
    },

    footerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },

    footerText: {
      fontSize: 13,
      marginLeft: 6,
      flex: 1,
    },

    emptyState: {
      paddingTop: 80,
      alignItems: "center",
      gap: 6,
    },

    emptyTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginTop: 10,
    },

    emptySubtitle: {
      fontSize: 14,
      textAlign: "center",
    },
  });

export default SearchStaffScreen;