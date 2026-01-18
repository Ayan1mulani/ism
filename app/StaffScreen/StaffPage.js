// StaffScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePermissions } from '../../Utils/ConetextApi';
import { visitorServices } from '../../services/visitorServices';
import { useNavigation } from '@react-navigation/native';

const THEME_COLORS = {
  primaryAccent: '#1996D3',
  darkText: '#074B7C',
  inactiveText: '#6c757d',
  lightBackground: '#f4f7f9',
  componentBackground: '#ffffff',
  borderColor: '#e0e0e0',
  darkBackground: '#121212',
  darkComponentBackground: '#1e1e1e',
  darkBorderColor: '#333333',
  darkTextColor: '#ffffff',
  darkInactiveText: '#aaaaaa',
};

const StaffScreen = () => {
  const { nightMode } = usePermissions();
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const theme = {
    backgroundColor: nightMode ? THEME_COLORS.darkBackground : THEME_COLORS.lightBackground,
    componentBackground: nightMode ? THEME_COLORS.darkComponentBackground : THEME_COLORS.componentBackground,
    borderColor: nightMode ? THEME_COLORS.darkBorderColor : THEME_COLORS.borderColor,
    textColor: nightMode ? THEME_COLORS.darkTextColor : THEME_COLORS.darkText,
    inactiveText: nightMode ? THEME_COLORS.darkInactiveText : THEME_COLORS.inactiveText,
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await visitorServices.getStaffCategories();
      console.log('Categories response:', response);
      setCategories(response.data || []);
      
      if (response.data && response.data.length > 0) {
        const firstCategory = response.data[0];
        setSelectedCategory(firstCategory);
        await fetchStaff(firstCategory.name);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.alert('Error', 'Failed to load staff categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async (categoryId) => {
    try {
      setLoading(true);
      const response = await visitorServices.getMyStaffs(categoryId);
      console.log('Staff response:', response);
      setStaffList(response.data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
      Alert.alert('Error', 'Failed to load staff members');
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = async (category) => {
    setSelectedCategory(category);
    setDropdownVisible(false);
    await fetchStaff(category.name);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (selectedCategory) {
      await fetchStaff(selectedCategory.name);
    }
    setRefreshing(false);
  };

  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    switch (name) {
      case 'security': return 'shield-outline';
      case 'housekeeping': return 'broom-outline';
      case 'horticulture': return 'leaf-outline';
      case 'manpower': return 'people-outline';
      case 'supervisor': return 'person-circle-outline';
      case 'staff': return 'person-outline';
      case 'admin': return 'settings-outline';
      case 'manager': return 'briefcase-outline';
      default: return 'person-outline';
    }
  };

  const getDesignationIcon = (designation) => {
    const name = designation?.toLowerCase() || '';
    if (name.includes('housekeeping')) return 'broom-outline';
    if (name.includes('security')) return 'shield-outline';
    if (name.includes('executive')) return 'briefcase-outline';
    if (name.includes('manager')) return 'person-circle-outline';
    return 'person-outline';
  };

  const handleStaffPress = (staff) => {
    navigation.navigate('StaffDetailsScreen', { staff, nightMode });
  };

  const renderDropdownItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.dropdownItem, { 
        backgroundColor: theme.componentBackground,
        borderBottomColor: theme.borderColor,
      }]}
      onPress={() => handleCategorySelect(item)}
    >
      <Ionicons 
        name={getCategoryIcon(item.name)} 
        size={20} 
        color={THEME_COLORS.primaryAccent} 
      />
      <Text style={[styles.dropdownItemText, { color: theme.textColor }]}>
        {item.name}
      </Text>
      {selectedCategory?.id === item.id && (
        <Ionicons name="checkmark" size={20} color={THEME_COLORS.primaryAccent} />
      )}
    </TouchableOpacity>
  );

  // Simplified Staff Card
  const renderStaffCard = ({ item }) => (
    <TouchableOpacity 
      style={[styles.staffCard, { 
        backgroundColor: theme.componentBackground,
        borderColor: theme.borderColor,
      }]}
      onPress={() => handleStaffPress(item)}
    >
      <View style={styles.staffHeader}>
        <View style={styles.staffLeft}>
          <View style={[styles.avatarContainer, { 
            backgroundColor: `${THEME_COLORS.primaryAccent}15` 
          }]}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.avatar} />
            ) : (
              <Ionicons 
                name={getDesignationIcon(item.designation)} 
                size={32} 
                color={THEME_COLORS.primaryAccent} 
              />
            )}
          </View>
          <View style={styles.staffInfo}>
            <Text style={[styles.staffName, { color: theme.textColor }]}>
              {item.name}
            </Text>
            <Text style={[styles.staffCode, { color: theme.inactiveText }]}>
              ID: {item.code || 'N/A'}
            </Text>
          </View>
        </View>
        <View style={styles.staffRight}>
          <View style={[styles.statusBadge, { 
            backgroundColor: item.status === 1 ? '#E8F5E8' : '#FFE8E8' 
          }]}>
            <Text style={[styles.statusText, { 
              color: item.status === 1 ? '#34C759' : '#FF3B30' 
            }]}>
              {item.status === 1 ? 'ACTIVE' : 'INACTIVE'}
            </Text>
          </View>
          <Ionicons 
            name="chevron-forward-outline" 
            size={20} 
            color={theme.inactiveText}
            style={styles.chevron}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  const styles = getStyles(theme, nightMode);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <StatusBar 
        barStyle={nightMode ? "light-content" : "dark-content"} 
        backgroundColor={theme.backgroundColor}
      />
      
      {/* Header */}
      <View style={[styles.header, { 
        backgroundColor: theme.componentBackground,
        borderBottomColor: theme.borderColor 
      }]}>
        <Text style={[styles.headerTitle, { color: theme.textColor }]}>
          Staff Directory
        </Text>
        <TouchableOpacity onPress={fetchCategories}>
          <Ionicons name="refresh-outline" size={24} color={THEME_COLORS.primaryAccent} />
        </TouchableOpacity>
      </View>

      {/* Category Dropdown */}
      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          style={[styles.dropdownButton, { 
            backgroundColor: theme.componentBackground,
            borderColor: theme.borderColor,
          }]}
          onPress={() => setDropdownVisible(true)}
        >
          <View style={styles.dropdownButtonLeft}>
            <Ionicons 
              name={getCategoryIcon(selectedCategory?.name)} 
              size={20} 
              color={THEME_COLORS.primaryAccent} 
            />
            <Text style={[styles.dropdownButtonText, { color: theme.textColor }]}>
              {selectedCategory?.name || 'Select Category'}
            </Text>
          </View>
          <Ionicons 
            name="chevron-down-outline" 
            size={20} 
            color={theme.inactiveText} 
          />
        </TouchableOpacity>
      </View>

      {/* Staff Count */}
      {selectedCategory && (
        <View style={[styles.countContainer, { backgroundColor: theme.componentBackground }]}>
          <Text style={[styles.countText, { color: theme.textColor }]}>
            {staffList.length} staff members in {selectedCategory.name}
          </Text>
        </View>
      )}

      {/* Staff List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME_COLORS.primaryAccent} />
          <Text style={[styles.loadingText, { color: theme.textColor }]}>
            Loading staff members...
          </Text>
        </View>
      ) : (
        <FlatList
          data={staffList}
          renderItem={renderStaffCard}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.staffList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[THEME_COLORS.primaryAccent]}
              tintColor={THEME_COLORS.primaryAccent}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color={theme.inactiveText} />
              <Text style={[styles.emptyStateTitle, { color: theme.textColor }]}>
                No Staff Found
              </Text>
              <Text style={[styles.emptyStateSubtitle, { color: theme.inactiveText }]}>
                {selectedCategory 
                  ? `No staff members in ${selectedCategory.name} category`
                  : 'Select a category to view staff'
                }
              </Text>
            </View>
          )}
        />
      )}

      {/* Dropdown Modal */}
      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={[styles.dropdownModal, { 
            backgroundColor: theme.componentBackground,
            borderColor: theme.borderColor,
          }]}>
            <View style={[styles.dropdownHeader, { borderBottomColor: theme.borderColor }]}>
              <Text style={[styles.dropdownHeaderText, { color: theme.textColor }]}>
                Select Category
              </Text>
              <TouchableOpacity onPress={() => setDropdownVisible(false)}>
                <Ionicons name="close" size={24} color={theme.inactiveText} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={categories}
              renderItem={renderDropdownItem}
              keyExtractor={(item) => item.id.toString()}
              style={styles.dropdownList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const getStyles = (theme, nightMode) => StyleSheet.create({
  container: {
    flex: 1,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  dropdownContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  dropdownButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  countContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  countText: {
    fontSize: 14,
    fontWeight: '500',
  },
  staffList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  staffCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: nightMode ? 0.3 : 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  staffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  staffLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  staffInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  staffName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  staffCode: {
    fontSize: 14,
  },
  staffRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chevron: {
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  // Dropdown Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    width: '85%',
    maxHeight: '70%',
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  dropdownHeaderText: {
    fontSize: 18,
    fontWeight: '600',
  },
  dropdownList: {
    maxHeight: 400,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
});

export default StaffScreen;
