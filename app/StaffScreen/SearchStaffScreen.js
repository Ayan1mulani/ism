// SearchStaffScreen.js

import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { otherServices } from "../../services/otherServices";

const COLORS = {
    primary: "#1996D3",
    light: {
        background: "#FFFFFF",
        surface: "#F8F9FA",
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

const SearchStaffScreen = ({ nightMode }) => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");

    const [staffList, setStaffList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);

    const [search, setSearch] = useState("");

    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [staffLoading, setStaffLoading] = useState(false);

    const theme = nightMode ? COLORS.dark : COLORS.light;
    const styles = createStyles(theme);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setCategoriesLoading(true);

            const res = await otherServices.getStaffCategories();

            if (res?.status === "success" && res.data.length > 0) {
                const categoryNames = res.data.map((item) => item.name);
                setCategories(categoryNames);

                const first = categoryNames[0];
                setSelectedCategory(first);
                fetchStaff(first);
            }
        } catch (error) {
            console.log("Category fetch error:", error);
        } finally {
            setCategoriesLoading(false);
        }
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
            <View style={[styles.card, { backgroundColor: theme.surface }]}>
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

                        {item.code ? (
                            <Text
                                style={[styles.empId, { color: theme.textSecondary }]}
                            >
                                EMP ID: {item.code}
                            </Text>
                        ) : null}
                    </View>

                    <View
                        style={[
                            styles.categoryBadge,
                            { backgroundColor: `${COLORS.primary}15` },
                        ]}
                    >
                        <Text style={[styles.categoryBadgeText, { color: COLORS.primary }]}>
                            {selectedCategory}
                        </Text>
                    </View>
                </View>

                <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
                    {item.mobile ? (
                        <View style={styles.footerRow}>
                            <Ionicons name="call-outline" size={14} color={theme.textSecondary} />
                            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                                {item.mobile}
                            </Text>
                        </View>
                    ) : null}

                    {workLocations.length > 0 && (
                        <View style={styles.footerRow}>
                            <Ionicons name="location-outline" size={14} color={theme.textSecondary} />
                            <Text
                                style={[styles.footerText, { color: theme.textSecondary }]}
                                numberOfLines={1}
                            >
                                {workLocations
                                    .map((loc) => loc.display_unit_no || loc.flat_no)
                                    .join(", ")}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={56} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No Staff Found
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Try another category or search term
            </Text>
        </View>
    );

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: theme.background }}
            edges={["top", "left", "right"]}
        >
            {/* Categories — fixed height row, never stretches */}
            {/* FIX 1: categoriesLoading spinner uses its own fixed-height row so it
          doesn't collapse or expand the layout when switching states */}
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
                        // FIX 2: flexGrow/flexShrink keep the ScrollView from
                        // expanding vertically and pushing other elements around
                        style={styles.categoryScroll}
                        contentContainerStyle={styles.categoryScrollContent}
                    >
                        {categories.map((cat) => {
                            const isActive = selectedCategory === cat;
                            return (
                                <TouchableOpacity
                                    key={cat}
                                    style={[
                                        styles.categoryChip,
                                        {
                                            backgroundColor: isActive ? COLORS.primary : theme.surface,
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

            {/* Search */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: theme.surface }]}>
                    <Ionicons name="search-outline" size={20} color={theme.textSecondary} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.text }]}
                        placeholder="Search staff by name..."
                        placeholderTextColor={theme.textSecondary}
                        value={search}
                        onChangeText={handleSearch}
                    />
                    {search !== "" && (
                        <TouchableOpacity onPress={() => handleSearch("")}>
                            <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Staff List — FIX 3: staffLoading spinner wrapped in flex:1 View
          so it truly centers in the remaining space without blocking layout */}
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
                />
            )}
        </SafeAreaView>
    );
};

const createStyles = (theme) =>
    StyleSheet.create({
        // FIX 1: categoryRow is an explicit fixed-height container so neither
        // the spinner nor the ScrollView can shift the rest of the layout
        categoryRow: {
            height: 52,
            justifyContent: "center",
            marginTop: 6,
        },

        // FIX 2: flexGrow:0 + flexShrink:0 prevent the horizontal ScrollView
        // from stretching vertically and consuming extra space
        categoryScroll: {
            flexGrow: 0,
            flexShrink: 0,
        },

        categoryScrollContent: {
            paddingHorizontal: 16,
            alignItems: "center",
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

        searchContainer: {
            paddingHorizontal: 16,
            paddingVertical: 8,
        },

        searchBar: {
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 10,
            paddingHorizontal: 12,
            height: 45,
        },

        searchInput: {
            flex: 1,
            marginLeft: 8,
            fontSize: 14,
        },

        // FIX 3: proper full-height centered loading for the list area
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

        card: {
            borderRadius: 14,
            marginBottom: 10,
            padding: 14,
            borderWidth: 1,
            borderColor: "rgba(0,0,0,0.08)",
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