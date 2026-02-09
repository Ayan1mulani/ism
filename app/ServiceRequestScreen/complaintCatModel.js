// CategorySelectionScreen.js
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    StatusBar,
    TextInput,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { usePermissions } from '../../Utils/ConetextApi';
import { complaintService } from '../../services/complaintService';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 64) / 3; // 3 cards per row with margins

// --- YOUR THEME COLORS ---
const THEME_COLORS = {
    primaryAccent: '#1996D3',
    darkText: '#074B7C',
    inactiveText: '#6c757d',
    lightBackground: '#f4f7f9',
    componentBackground: '#ffffff',
    borderColor: '#e0e0e0',
    // Night mode colors
    darkBackground: '#121212',
    darkComponentBackground: '#1e1e1e',
    darkBorderColor: '#333333',
    darkText: '#ffffff',
    darkInactiveText: '#aaaaaa',
};

// Icon mapper function to assign icons based on category names
const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();

    if (name.includes('electrical') || name.includes('electricity')) {
        return { icon: 'flash', iconType: 'Ionicons', color: '#FF8B00' };
    } else if (name.includes('plumbing')) {
        return { icon: 'water', iconType: 'Ionicons', color: '#0052CC' };
    } else if (name.includes('hvac') || name.includes('heating') || name.includes('cooling') || name.includes('ac')) {
        return { icon: 'snowflake', iconType: 'FontAwesome5', color: '#1996D3' };
    } else if (name.includes('maintenance') || name.includes('general')) {
        return { icon: 'construct', iconType: 'Ionicons', color: '#28a745' };
    } else if (name.includes('cleaning') || name.includes('clean')) {
        return { icon: 'cleaning-services', iconType: 'MaterialIcons', color: '#6f42c1' };
    } else if (name.includes('security')) {
        return { icon: 'shield-checkmark', iconType: 'Ionicons', color: '#dc3545' };
    } else if (name.includes('lighting') || name.includes('light')) {
        return { icon: 'lightbulb-outline', iconType: 'Ionicons', color: '#FFC107' };
    } else {
        return { icon: 'build', iconType: 'Ionicons', color: '#6c757d' };
    }
};

const CategorySelectionScreen = () => {
    const { nightMode } = usePermissions();
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation()
    // Dynamic theme based on night mode
    const currentTheme = {
        backgroundColor: nightMode ? THEME_COLORS.darkBackground : THEME_COLORS.lightBackground,
        componentBackground: nightMode ? THEME_COLORS.darkComponentBackground : THEME_COLORS.componentBackground,
        borderColor: nightMode ? THEME_COLORS.darkBorderColor : THEME_COLORS.borderColor,
        textColor: nightMode ? THEME_COLORS.darkText : "black",
        inactiveTextColor: nightMode ? THEME_COLORS.darkInactiveText : THEME_COLORS.inactiveText,
        searchBackground: nightMode ? THEME_COLORS.darkComponentBackground : '#f8f9fa',
    };

    // Fetch categories from API
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await complaintService.getCategories();

            if (response && typeof response === 'object') {
                // Convert the object response to array format
                const categoriesArray = Object.values(response.data).map(category => {
                    const iconData = getCategoryIcon(category.name);
                    return {
                        id: category.id,
                        name: category.name,
                        icon: iconData.icon,
                        iconType: iconData.iconType,
                        color: iconData.color,
                        description: category.remarks || `${category.name} related issues`,
                        disp_order: category.disp_order,
                        sub_catagory: category.sub_catagory || [],
                        created_at: category.created_at,
                        updated_at: category.updated_at
                    };
                });

                // Sort by display order
                categoriesArray.sort((a, b) => (a.disp_order || 999) - (b.disp_order || 999));
                setCategories(categoriesArray);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
            // Fallback to empty array or show error message
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Filter categories based on search query
    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group categories into rows of 3
    const groupedCategories = [];
    for (let i = 0; i < filteredCategories.length; i += 3) {
        groupedCategories.push(filteredCategories.slice(i, i + 3));
    }

    const renderIcon = (category) => {
        const { icon, iconType, color } = category;
        const size = 20;

        switch (iconType) {
            case 'FontAwesome5':
                return <FontAwesome5 name={icon} size={size} color={color} />;
            case 'MaterialIcons':
                return <MaterialIcons name={icon} size={size} color={color} />;
            case 'Ionicons':
            default:
                return <Ionicons name={icon} size={size} color={color} />;
        }
    };

    const handleCategorySelect = (category) => {
        navigation.navigate('subCategorySelection', { selectedCategory: category });
    };


    const clearSearch = () => {
        setSearchQuery('');
    };

    // Loading state
    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
                <StatusBar
                    barStyle={nightMode ? "light-content" : "dark-content"}
                    backgroundColor={currentTheme.backgroundColor}
                />

                {/* Loading indicator */}
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={THEME_COLORS.primaryAccent} />
                    <Text style={[styles.loadingText, { color: currentTheme.inactiveTextColor }]}>
                        Loading categories...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
            <StatusBar
                barStyle={nightMode ? "light-content" : "dark-content"}
                backgroundColor={currentTheme.backgroundColor}
            />


            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, {
                    backgroundColor: currentTheme.searchBackground,
                    borderColor: currentTheme.borderColor
                }]}>
                    <Ionicons name="search" size={20} color={currentTheme.inactiveTextColor} />
                    <TextInput
                        style={[styles.searchInput, { color: currentTheme.textColor }]}
                        placeholder="Search categories..."
                        placeholderTextColor={currentTheme.inactiveTextColor}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                            <Ionicons name="close-circle" size={20} color={currentTheme.inactiveTextColor} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Categories Grid */}
            <ScrollView
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.categoriesGrid}
            >
                {groupedCategories.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.categoryRow}>
                        {row.map((category) => (
                            <TouchableOpacity
                                key={category.id}
                                style={[
                                    styles.categoryCard,
                                    {
                                        backgroundColor: currentTheme.componentBackground,
                                        borderColor: currentTheme.borderColor,
                                    }
                                ]}
                                onPress={() => handleCategorySelect(category)}
                                activeOpacity={0.7}
                            >
                                <View style={[
                                    styles.categoryIconContainer,
                                    { backgroundColor: `${category.color}15` }
                                ]}>
                                    {renderIcon(category)}
                                </View>

                                <Text style={[styles.categoryName, { color: currentTheme.textColor }]} numberOfLines={2}>
                                    {category.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        {/* Fill empty spaces in the last row */}
                        {row.length < 3 && Array.from({ length: 3 - row.length }).map((_, index) => (
                            <View key={`empty-${index}`} style={styles.emptyCard} />
                        ))}
                    </View>
                ))}

                {/* No Results */}
                {filteredCategories.length === 0 && !loading && (
                    <View style={styles.noResultsContainer}>
                        <Ionicons name="search" size={48} color={currentTheme.inactiveTextColor} />
                        <Text style={[styles.noResultsTitle, { color: currentTheme.textColor }]}>
                            No categories found
                        </Text>
                        <Text style={[styles.noResultsDescription, { color: currentTheme.inactiveTextColor }]}>
                            {searchQuery ? 'Try adjusting your search terms' : 'No categories available'}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerSpacer: {
        width: 32,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
    },
    clearButton: {
        padding: 4,
    },
    scrollContainer: {
        flex: 1,
    },
    categoriesGrid: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    categoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    categoryCard: {
        width: CARD_WIDTH,
        alignItems: 'center',
        paddingVertical: 12,       // Reduced from 16
        paddingHorizontal: 8,
        borderRadius: 12,
        borderWidth: 1,
        marginHorizontal: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        minHeight: 90,            // Changed from fixed height to minHeight
        justifyContent: 'center', // Added to center content vertically
    },
    emptyCard: {
        width: CARD_WIDTH,
        marginHorizontal: 4,
    },
    categoryIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,          // Reduced from 8
    },
    categoryName: {
        fontSize: 11,             // Slightly reduced from 12
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 14,           // Added line height for better spacing
        paddingHorizontal: 2,     // Added horizontal padding
        // Removed flex: 1 which was causing issues
    },
    noResultsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    noResultsTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    noResultsDescription: {
        fontSize: 14,
        textAlign: 'center',
    },
});

export default CategorySelectionScreen;
