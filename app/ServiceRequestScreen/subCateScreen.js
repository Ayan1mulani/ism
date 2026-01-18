// SubCategorySelectionScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { usePermissions } from '../../Utils/ConetextApi';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32; // Full width with margins for single card per row

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

const SubCategorySelectionScreen = ({ navigation, route }) => {
  const { nightMode } = usePermissions();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get category data from navigation params
  const selectedCategory = route?.params?.selectedCategory || route?.params?.category;
  const subCategories = selectedCategory?.sub_catagory || [];
  
  console.log(selectedCategory, 'this are selected category');

  // Dynamic theme based on night mode
  const currentTheme = {
    backgroundColor: nightMode ? THEME_COLORS.darkBackground : THEME_COLORS.lightBackground,
    componentBackground: nightMode ? THEME_COLORS.darkComponentBackground : THEME_COLORS.componentBackground,
    borderColor: nightMode ? THEME_COLORS.darkBorderColor : THEME_COLORS.borderColor,
    textColor: nightMode ? THEME_COLORS.darkText : "black",
    inactiveTextColor: nightMode ? THEME_COLORS.darkInactiveText : THEME_COLORS.inactiveText,
    searchBackground: nightMode ? THEME_COLORS.darkComponentBackground : '#f8f9fa',
  };

  // Filter subcategories based on search query
  const filteredSubCategories = subCategories.filter(subCat =>
    subCat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Use parent category icon for all subcategories, except "other" gets three dots
  const renderCategoryIcon = (subCategory) => {
    // Check if subcategory name is "other"
    if (subCategory.name.toLowerCase().includes('other')) {
      return <Ionicons name="ellipsis-horizontal" size={20} color={selectedCategory?.color || THEME_COLORS.primaryAccent} />;
    }
    
    // Use parent category icon for all other subcategories
    const { icon, iconType, color } = selectedCategory;
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

  const handleSubCategorySelect = (subCategory) => {
    console.log('Selected subcategory:', subCategory);
    console.log('Parent category:', selectedCategory);
    // Navigate to complaint form with selected category and subcategory
    navigation.navigate('complaintInput', { 
      category: selectedCategory, 
      subCategory: subCategory 
    });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
      <StatusBar 
        barStyle={nightMode ? "light-content" : "dark-content"} 
        backgroundColor={currentTheme.backgroundColor}
      />
      
      {/* Category Info */}
      <View style={[styles.categoryInfoContainer, { 
        backgroundColor: currentTheme.componentBackground,
        borderBottomColor: currentTheme.borderColor 
      }]}>
        <View style={styles.categoryInfo}>
          <View style={[
            styles.categoryIconContainer,
            { backgroundColor: `${selectedCategory?.color || THEME_COLORS.primaryAccent}20` }
          ]}>
            {selectedCategory && (
              selectedCategory.iconType === 'FontAwesome5' ? 
                <FontAwesome5 name={selectedCategory.icon} size={20} color={selectedCategory.color} /> :
              selectedCategory.iconType === 'MaterialIcons' ? 
                <MaterialIcons name={selectedCategory.icon} size={20} color={selectedCategory.color} /> :
                <Ionicons name={selectedCategory.icon} size={20} color={selectedCategory.color} />
            )}
          </View>
          <View style={styles.categoryTextContainer}>
            <Text style={[styles.categoryTitle, { color: currentTheme.textColor }]}>
              {selectedCategory?.name || 'Unknown Category'}
            </Text>
            <Text style={[styles.categorySubtitle, { color: currentTheme.inactiveTextColor }]}>
              Choose specific issue type
            </Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { 
          backgroundColor: currentTheme.searchBackground,
          borderColor: currentTheme.borderColor 
        }]}>
          <Ionicons name="search" size={20} color={currentTheme.inactiveTextColor} />
          <TextInput
            style={[styles.searchInput, { color: currentTheme.textColor }]}
            placeholder="Search issue types..."
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

      {/* SubCategories List (Single card per row) */}
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.subCategoriesGrid}
      >
        {filteredSubCategories.map((subCategory) => (
          <TouchableOpacity
            key={subCategory.id}
            style={[
              styles.subCategoryCard,
              {
                backgroundColor: currentTheme.componentBackground,
                borderColor: currentTheme.borderColor,
              }
            ]}
            onPress={() => handleSubCategorySelect(subCategory)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.subCategoryIconContainer,
              { backgroundColor: `${selectedCategory?.color || THEME_COLORS.primaryAccent}15` }
            ]}>
              {renderCategoryIcon(subCategory)}
            </View>
            
            <Text style={[styles.subCategoryName, { color: currentTheme.textColor }]} numberOfLines={2}>
              {subCategory.name}
            </Text>
          </TouchableOpacity>
        ))}
        
        {/* No Results */}
        {filteredSubCategories.length === 0 && (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search" size={48} color={currentTheme.inactiveTextColor} />
            <Text style={[styles.noResultsTitle, { color: currentTheme.textColor }]}>
              No issue types found
            </Text>
            <Text style={[styles.noResultsDescription, { color: currentTheme.inactiveTextColor }]}>
              {searchQuery ? 'Try adjusting your search terms' : 'No subcategories available'}
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
    paddingBottom:70,
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
  categoryInfoContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  categorySubtitle: {
    fontSize: 13,
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
  subCategoriesGrid: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  subCategoryCard: {
    width: CARD_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  subCategoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  subCategoryName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    lineHeight: 20,
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

export default SubCategorySelectionScreen;
