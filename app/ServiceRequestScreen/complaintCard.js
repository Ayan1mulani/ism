import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5, AntDesign, Feather } from '@expo/vector-icons';
import { usePermissions } from '../../Utils/ConetextApi';

// --- YOUR THEME COLORS ---
const THEME_COLORS = {
  primaryAccent: '#1996D3',
  darkText: '#074B7C',
  inactiveText: '#6c757d',
  cardBackground: '#ffffff',
  borderColor: '#e9ecef',
  successColor: '#28a745',
  lightGray: '#f8f9fa',
  // Night mode colors
  darkBackground: '#121212',
  darkCardBackground: '#1e1e1e',
  darkBorderColor: '#333333',
  darkTextColor: '#ffffff',
  darkInactiveText: '#aaaaaa',
  darkLightGray: '#2a2a2a',
};

const ServiceRequestDetailCard = ({ complaint }) => {
  const {nightMode} = usePermissions();

  // Dynamic theme based on night mode
  const currentTheme = {
    cardBackground: nightMode ? THEME_COLORS.darkCardBackground : THEME_COLORS.cardBackground,
    borderColor: nightMode ? THEME_COLORS.darkBorderColor : THEME_COLORS.borderColor,
    textColor: nightMode ? THEME_COLORS.darkTextColor : THEME_COLORS.darkText,
    inactiveTextColor: nightMode ? THEME_COLORS.darkInactiveText : THEME_COLORS.inactiveText,
    lightGrayBackground: nightMode ? THEME_COLORS.darkLightGray : THEME_COLORS.lightGray,
    descriptionTextColor: nightMode ? '#cccccc' : '#495057',
  };

  // Status configuration with icons
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
      case 'closed':
      case 'completed':
        return {
          color: THEME_COLORS.successColor,
          text: 'Resolved',
          bgColor: nightMode ? '#1a3d2e' : '#d4edda',
          icon: 'checkmark-circle'
        };
      case 'open':
      case 'pending':
        return {
          color: '#ffc107',
          text: 'Pending',
          bgColor: nightMode ? '#3d3a1a' : '#fff3cd',
          icon: 'time-outline'
        };
      case 'in progress':
        return {
          color: THEME_COLORS.primaryAccent,
          text: 'In Progress',
          bgColor: nightMode ? '#1a2d3d' : '#cce7ff',
          icon: 'sync'
        };
      default:
        return {
          color: currentTheme.inactiveTextColor,
          text: status || 'Unknown',
          bgColor: nightMode ? '#2a2a2a' : '#e9ecef',
          icon: 'help-circle-outline'
        };
    }
  };

  // Get category icon based on complaint type
  const getCategoryIcon = (category) => {
    const categoryLower = category?.toLowerCase() || '';
    if (categoryLower.includes('ac') || categoryLower.includes('air')) {
      return { name: 'snowflake', library: 'FontAwesome5', color: THEME_COLORS.primaryAccent };
    } else if (categoryLower.includes('electrical') || categoryLower.includes('wiring')) {
      return { name: 'flash', library: 'Ionicons', color: '#FF8B00' };
    } else if (categoryLower.includes('plumbing') || categoryLower.includes('water')) {
      return { name: 'water', library: 'Ionicons', color: '#0052CC' };
    } else if (categoryLower.includes('light')) {
      return { name: 'lightbulb-outline', library: 'Ionicons', color: '#FFC107' };
    } else if (categoryLower.includes('maintenance')) {
      return { name: 'construct', library: 'Ionicons', color: '#28a745' };
    } else {
      return { name: 'build', library: 'Ionicons', color: currentTheme.inactiveTextColor };
    }
  };

  const statusConfig = getStatusConfig(complaint.status);
  const categoryIcon = getCategoryIcon(complaint.sub_category);

  // Format dates
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const formatDateWithTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `${diffDays} Days`;
  };

  // Render icon based on library
  const renderIcon = (iconConfig, size = 16) => {
    const { name, library, color } = iconConfig;
    switch (library) {
      case 'FontAwesome5':
        return <FontAwesome5 name={name} size={size} color={color} />;
      case 'Ionicons':
        return <Ionicons name={name} size={size} color={color} />;
      case 'MaterialIcons':
        return <MaterialIcons name={name} size={size} color={color} />;
      case 'AntDesign':
        return <AntDesign name={name} size={size} color={color} />;
      case 'Feather':
        return <Feather name={name} size={size} color={color} />;
      default:
        return <Ionicons name={name} size={size} color={color} />;
    }
  };

  return (
    <View style={[styles.container, { 
      backgroundColor: currentTheme.cardBackground,
      borderColor: currentTheme.borderColor 
    }]}>
      {/* Top Row: ID and Status */}
      <View style={styles.topRow}>
        <View style={styles.idSection}>
          <MaterialIcons name="receipt-long" size={16} color={currentTheme.inactiveTextColor} />
          <Text style={[styles.idValue, { color: currentTheme.textColor }]}>
            #{complaint.com_no || complaint.id}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
          <Ionicons name={statusConfig.icon} size={12} color={statusConfig.color} />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.text}
          </Text>
        </View>
      </View>

      {/* Category Title Section */}
      <View style={styles.titleSection}>
        <View style={[styles.categoryIconContainer, { 
          backgroundColor: nightMode ? `${THEME_COLORS.primaryAccent}25` : `${THEME_COLORS.primaryAccent}15`
        }]}>
          {renderIcon(categoryIcon, 18)}
        </View>
        <Text style={[styles.serviceTitle, { color: currentTheme.textColor }]}>
          {complaint.sub_category || 'AC Repairing Services'}
        </Text>
      </View>

      {/* Description with Icon */}
      <View style={styles.descriptionSection}>
        <Text style={[styles.description, { color: currentTheme.descriptionTextColor }]}>
          {complaint.description || 'In publishing and graphic design, Lorem Ipsum is a placeholder text commonly used to demonstrate the visual form of a'}
        </Text>
      </View>

      {/* Date Info with Icons */}
      <View style={[styles.dateInfo, { backgroundColor: currentTheme.lightGrayBackground }]}>
        <View style={styles.dateItem}>
          <View style={styles.dateIconLabel}>
            <MaterialIcons name="schedule" size={12} color={currentTheme.inactiveTextColor} />
            <Text style={[styles.dateLabel, { color: currentTheme.inactiveTextColor }]}>
              Created:
            </Text>
          </View>
          <Text style={[styles.dateValue, { color: currentTheme.textColor }]}>
            {formatDate(complaint.created_at)} ({formatDateWithTime(complaint.created_at)})
          </Text>
        </View>
        <View style={styles.dateItem}>
          <View style={styles.dateIconLabel}>
            <MaterialIcons name="update" size={12} color={currentTheme.inactiveTextColor} />
            <Text style={[styles.dateLabel, { color: currentTheme.inactiveTextColor }]}>
              Last Update:
            </Text>
          </View>
          <Text style={[styles.dateValue, { color: currentTheme.textColor }]}>
            {formatDate(complaint.updated_at)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 10,
    marginVertical: 4,
    width: 350,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  idSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  idValue: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  descriptionSection: {
    marginBottom: 12,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
    marginLeft: 18,
  },
  dateInfo: {
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  dateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  dateIconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 4,
  },
  dateValue: {
    fontSize: 10,
    fontWeight: '600',
  },
});

export default ServiceRequestDetailCard;
