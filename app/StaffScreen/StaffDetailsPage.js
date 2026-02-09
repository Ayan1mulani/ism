// StaffDetailsScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

const StaffDetailsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { staff, nightMode } = route.params;

  const theme = {
    backgroundColor: nightMode ? THEME_COLORS.darkBackground : THEME_COLORS.lightBackground,
    componentBackground: nightMode ? THEME_COLORS.darkComponentBackground : THEME_COLORS.componentBackground,
    borderColor: nightMode ? THEME_COLORS.darkBorderColor : THEME_COLORS.borderColor,
    textColor: nightMode ? THEME_COLORS.darkTextColor : THEME_COLORS.darkText,
    inactiveText: nightMode ? THEME_COLORS.darkInactiveText : THEME_COLORS.inactiveText,
  };

  const getDesignationIcon = (designation) => {
    const name = designation?.toLowerCase() || '';
    if (name.includes('housekeeping')) return 'broom-outline';
    if (name.includes('security')) return 'shield-outline';
    if (name.includes('executive')) return 'briefcase-outline';
    if (name.includes('manager')) return 'person-circle-outline';
    return 'person-outline';
  };

  const handleCall = (mobile) => {
    if (mobile && mobile.trim()) {
      Linking.openURL(`tel:${mobile}`).catch(() => {
        Alert.alert('Error', 'Unable to make phone call');
      });
    } else {
      Alert.alert('Info', 'Phone number not available');
    }
  };

  const getWorkLocationText = (workLocation) => {
    if (!workLocation) return 'No specific location';
    
    try {
      const locations = JSON.parse(workLocation);
      if (Array.isArray(locations) && locations.length > 0) {
        const firstLocation = locations[0];
        const unit = firstLocation.display_unit_no || firstLocation.flat_no || '';
        const name = firstLocation.name || '';
        
        if (locations.length === 1) {
          return unit ? `Unit ${unit}` : name || 'Assigned location';
        } else {
          return `${locations.length} locations`;
        }
      }
    } catch (error) {
      console.error('Error parsing work location:', error);
    }
    
    return 'Multiple locations';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 30) {
        return `${diffDays} days ago`;
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} ${months === 1 ? 'month' : 'months'} ago`;
      } else {
        const years = Math.floor(diffDays / 365);
        return `${years} ${years === 1 ? 'year' : 'years'} ago`;
      }
    } catch (error) {
      return dateString;
    }
  };

  const getRatingStars = (rating) => {
    const numRating = parseFloat(rating) || 0;
    const stars = [];
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Ionicons key={i} name="star" size={16} color="#FFD700" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Ionicons key={i} name="star-half" size={16} color="#FFD700" />);
      } else {
        stars.push(<Ionicons key={i} name="star-outline" size={16} color="#DDD" />);
      }
    }
    
    return stars;
  };

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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textColor }]}>
          Staff Details
        </Text>
        <TouchableOpacity onPress={() => Alert.alert('More Options', 'Feature coming soon')}>
          <Ionicons name="ellipsis-vertical" size={24} color={theme.textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Main Staff Card */}
        <View style={[styles.staffCard, { 
          backgroundColor: theme.componentBackground,
          borderColor: theme.borderColor,
        }]}>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={[styles.avatarContainer, { 
              backgroundColor: `${THEME_COLORS.primaryAccent}15` 
            }]}>
              {staff.image ? (
                <Image source={{ uri: staff.image }} style={styles.avatar} />
              ) : (
                <Ionicons 
                  name={getDesignationIcon(staff.designation)} 
                  size={40} 
                  color={THEME_COLORS.primaryAccent} 
                />
              )}
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={[styles.staffName, { color: theme.textColor }]}>
                {staff.name}
              </Text>
              <Text style={[styles.staffDesignation, { color: THEME_COLORS.primaryAccent }]}>
                {staff.designation}
              </Text>
              
              {/* Status Badge */}
              <View style={[styles.statusBadge, { 
                backgroundColor: staff.status === 1 ? '#E8F5E8' : '#FFE8E8' 
              }]}>
                <View style={[styles.statusDot, {
                  backgroundColor: staff.status === 1 ? '#34C759' : '#FF3B30'
                }]} />
                <Text style={[styles.statusText, { 
                  color: staff.status === 1 ? '#34C759' : '#FF3B30' 
                }]}>
                  {staff.status === 1 ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
          </View>

          {/* Details Grid - Labels Removed */}
          <View style={styles.detailsGrid}>
            {/* Rating */}
            <View style={styles.detailItem}>
              <View style={styles.detailHeader}>
                <Ionicons name="star" size={20} color="#FFD700" />
              </View>
              <View style={styles.ratingContainer}>
                <View style={styles.starsContainer}>
                  {getRatingStars(staff.avg_rating)}
                </View>
                <Text style={[styles.ratingText, { color: theme.textColor }]}>
                  {staff.avg_rating ? `${staff.avg_rating}/5` : 'No rating'}
                </Text>
              </View>
            </View>

            {/* Location */}
            <View style={styles.detailItem}>
              <View style={styles.detailHeader}>
                <Ionicons name="location" size={20} color={THEME_COLORS.primaryAccent} />
              </View>
              <Text style={[styles.detailValue, { color: theme.textColor }]}>
                {getWorkLocationText(staff.work_location)}
              </Text>
            </View>

            {/* Working Time */}
            <View style={styles.detailItem}>
              <View style={styles.detailHeader}>
                <Ionicons name="time" size={20} color={THEME_COLORS.primaryAccent} />
              </View>
              <Text style={[styles.detailValue, { color: theme.textColor }]}>
                {formatDate(staff.working_from)}
              </Text>
            </View>

            {/* Staff ID */}
            <View style={styles.detailItem}>
              <View style={styles.detailHeader}>
                <Ionicons name="card" size={20} color={THEME_COLORS.primaryAccent} />
              </View>
              <Text style={[styles.detailValue, { color: theme.textColor }]}>
                {staff.code || 'N/A'}
              </Text>
            </View>

            {/* Phone */}
            <View style={styles.detailItem}>
              <View style={styles.detailHeader}>
                <Ionicons name="call" size={20} color={THEME_COLORS.primaryAccent} />
              </View>
              <View style={styles.phoneContainer}>
                <Text style={[styles.detailValue, { color: theme.textColor, flex: 1 }]}>
                  {staff.mobile || 'Not provided'}
                </Text>
                {staff.mobile && (
                  <TouchableOpacity 
                    style={styles.callIcon}
                    onPress={() => handleCall(staff.mobile)}
                  >
                    <Ionicons name="call" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Address */}
            <View style={styles.detailItem}>
              <View style={styles.detailHeader}>
                <Ionicons name="home" size={20} color={THEME_COLORS.primaryAccent} />
              </View>
              <Text style={[styles.detailValue, { color: theme.textColor }]} numberOfLines={2}>
                {staff.address || 'Not provided'}
              </Text>
            </View>
          </View>

          {/* Call Button */}
          {staff.mobile && (
            <TouchableOpacity 
              style={[styles.callButton, { backgroundColor: THEME_COLORS.primaryAccent }]}
              onPress={() => handleCall(staff.mobile)}
            >
              <Ionicons name="call" size={20} color="#FFFFFF" />
              <Text style={styles.callButtonText}>Call {staff.name.split(' ')[0]}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme, nightMode) => StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: 20,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
  },
  staffCard: {
    borderRadius: 20,
    padding: 24,
  
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  staffDesignation: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  detailItem: {
    width: '50%',
    display: 'flex',
    flexDirection:"row",
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  ratingContainer: {
    alignItems: 'flex-start',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME_COLORS.primaryAccent,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default StaffDetailsScreen;
