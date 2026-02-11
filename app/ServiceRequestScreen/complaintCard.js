// ServiceRequestDetailCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { usePermissions } from '../../Utils/ConetextApi';

// Theme configuration
const COLORS = {
  primary: '#1996D3',
  success: '#28A745',
  warning: '#FFC107',
  info: '#0052CC',
  
  // Light theme
  light: {
    background: '#FFFFFF',
    surface: '#F8F9FA',
    text: '#212529',
    textSecondary: '#6C757D',
    border: '#DEE2E6',
    description: '#495057',
  },
  
  // Dark theme
  dark: {
    background: '#1E1E1E',
    surface: '#2A2A2A',
    text: '#FFFFFF',
    textSecondary: '#9E9E9E',
    border: '#2C2C2C',
    description: '#CCCCCC',
  },
};

// Request status configuration
const REQUEST_STATUS = {
  RESOLVED: {
    light: { bg: '#D4EDDA', color: COLORS.success },
    dark: { bg: '#1A3D2E', color: COLORS.success },
    label: 'Resolved',
    icon: 'checkmark-circle',
  },
  PENDING: {
    light: { bg: '#FFF3CD', color: COLORS.warning },
    dark: { bg: '#3D3A1A', color: COLORS.warning },
    label: 'Pending',
    icon: 'time-outline',
  },
  IN_PROGRESS: {
    light: { bg: '#CCE7FF', color: COLORS.primary },
    dark: { bg: '#1A2D3D', color: COLORS.primary },
    label: 'In Progress',
    icon: 'sync',
  },
  UNKNOWN: {
    light: { bg: '#E9ECEF', color: COLORS.light.textSecondary },
    dark: { bg: '#2A2A2A', color: COLORS.dark.textSecondary },
    label: 'Unknown',
    icon: 'help-circle-outline',
  },
};

// Category icon configuration
const CATEGORY_ICONS = {
  AC: { name: 'snowflake', library: 'FontAwesome5', color: COLORS.primary },
  ELECTRICAL: { name: 'flash', library: 'Ionicons', color: '#FF8B00' },
  PLUMBING: { name: 'water', library: 'Ionicons', color: COLORS.info },
  LIGHTING: { name: 'lightbulb-outline', library: 'Ionicons', color: COLORS.warning },
  MAINTENANCE: { name: 'construct', library: 'Ionicons', color: COLORS.success },
  DEFAULT: { name: 'build', library: 'Ionicons', color: COLORS.light.textSecondary },
};

const ServiceRequestDetailCard = ({ complaint }) => {
  const { nightMode } = usePermissions();
  const theme = nightMode ? COLORS.dark : COLORS.light;

  // Get status configuration
  const getStatusConfig = (status) => {
    const statusLower = status?.toLowerCase() || '';
    
    if (['resolved', 'closed', 'completed'].includes(statusLower)) {
      const config = REQUEST_STATUS.RESOLVED;
      const themeConfig = nightMode ? config.dark : config.light;
      return { ...config, ...themeConfig };
    }
    
    if (['open', 'pending'].includes(statusLower)) {
      const config = REQUEST_STATUS.PENDING;
      const themeConfig = nightMode ? config.dark : config.light;
      return { ...config, ...themeConfig };
    }
    
    if (statusLower === 'in progress') {
      const config = REQUEST_STATUS.IN_PROGRESS;
      const themeConfig = nightMode ? config.dark : config.light;
      return { ...config, ...themeConfig };
    }
    
    const config = REQUEST_STATUS.UNKNOWN;
    const themeConfig = nightMode ? config.dark : config.light;
    return { ...config, ...themeConfig, label: status || 'Unknown' };
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const categoryLower = category?.toLowerCase() || '';
    
    if (categoryLower.includes('ac') || categoryLower.includes('air')) {
      return CATEGORY_ICONS.AC;
    }
    if (categoryLower.includes('electrical') || categoryLower.includes('wiring')) {
      return CATEGORY_ICONS.ELECTRICAL;
    }
    if (categoryLower.includes('plumbing') || categoryLower.includes('water')) {
      return CATEGORY_ICONS.PLUMBING;
    }
    if (categoryLower.includes('light')) {
      return CATEGORY_ICONS.LIGHTING;
    }
    if (categoryLower.includes('maintenance')) {
      return CATEGORY_ICONS.MAINTENANCE;
    }
    
    return { ...CATEGORY_ICONS.DEFAULT, color: theme.textSecondary };
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  };

  // Calculate time ago with smart formatting
  const getTimeAgo = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffMonths = Math.floor(diffDays / 30);
      const diffYears = Math.floor(diffDays / 365);

      if (diffMinutes < 60) {
        return diffMinutes === 0 ? 'Just now' : `${diffMinutes}m`;
      }
      if (diffHours < 24) {
        return `${diffHours}h`;
      }
      if (diffDays < 30) {
        return `${diffDays}d`;
      }
      if (diffMonths < 12) {
        return `${diffMonths}mo`;
      }
      return `${diffYears}y`;
    } catch (error) {
      return '';
    }
  };

  // Render icon
  const renderIcon = (iconConfig, size = 16) => {
    const { name, library, color } = iconConfig;
    
    switch (library) {
      case 'FontAwesome5':
        return <FontAwesome5 name={name} size={size} color={color} />;
      case 'MaterialIcons':
        return <MaterialIcons name={name} size={size} color={color} />;
      case 'Ionicons':
      default:
        return <Ionicons name={name} size={size} color={color} />;
    }
  };

  const statusConfig = getStatusConfig(complaint.status);
  const categoryIcon = getCategoryIcon(complaint.sub_category);
  const requestId = complaint.com_no || complaint.id;
  const requestNumber = `#${requestId}`;

  const styles = createStyles(theme, nightMode);

  return (
    <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
      {/* Header: ID and Status */}
      <View style={styles.header}>
        <View style={styles.idSection}>
          <MaterialIcons name="receipt-long" size={16} color={theme.textSecondary} />
          <Text style={[styles.requestId, { color: theme.text }]}>{requestNumber}</Text>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
          <Ionicons name={statusConfig.icon} size={12} color={statusConfig.color} />
          <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Category Section */}
      <View style={styles.categorySection}>
        <View style={[styles.categoryIcon, {
          backgroundColor: nightMode ? `${COLORS.primary}25` : `${COLORS.primary}15`,
        }]}>
          {renderIcon(categoryIcon, 18)}
        </View>
        <Text style={[styles.categoryTitle, { color: theme.text }]} numberOfLines={1}>
          {complaint.sub_category || 'Service Request'}
        </Text>
      </View>

      {/* Description */}
      <View style={styles.descriptionSection}>
        <Text style={[styles.description, { color: theme.description }]} numberOfLines={3}>
          {complaint.description || 'No description provided'}
        </Text>
      </View>

      {/* Date Information */}
      <View style={[styles.dateSection, { backgroundColor: theme.surface }]}>
        <View style={styles.dateRow}>
          <View style={styles.dateLabel}>
            <MaterialIcons name="schedule" size={12} color={theme.textSecondary} />
            <Text style={[styles.dateLabelText, { color: theme.textSecondary }]}>
              Created:
            </Text>
          </View>
          <Text style={[styles.dateValue, { color: theme.text }]}>
            {formatDate(complaint.created_at)} ({getTimeAgo(complaint.created_at)})
          </Text>
        </View>
        
        <View style={styles.dateRow}>
          <View style={styles.dateLabel}>
            <MaterialIcons name="update" size={12} color={theme.textSecondary} />
            <Text style={[styles.dateLabelText, { color: theme.textSecondary }]}>
              Updated:
            </Text>
          </View>
          <Text style={[styles.dateValue, { color: theme.text }]}>
            {formatDate(complaint.updated_at)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme, nightMode) =>
  StyleSheet.create({
    card: {
      borderRadius: 12,
      padding: 16,
      marginVertical: 6,
      width: '90%',
      alignSelf:'center',
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: nightMode ? 0.3 : 0.08,
      shadowRadius: 4,
      elevation: 2,
      borderWidth: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    idSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    requestId: {
      fontSize: 14,
      fontWeight: '600',
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
      gap: 4,
    },
    statusLabel: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.3,
    },
    categorySection: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 8,
    },
    categoryIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    categoryTitle: {
      fontSize: 16,
      fontWeight: '700',
      flex: 1,
    },
    descriptionSection: {
      marginBottom: 12,
    },
    description: {
      fontSize: 13,
      lineHeight: 20,
    },
    dateSection: {
      borderRadius: 8,
      padding: 10,
      gap: 4,
    },
    dateRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dateLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    dateLabelText: {
      fontSize: 11,
      fontWeight: '600',
    },
    dateValue: {
      fontSize: 11,
      fontWeight: '600',
    },
  });

export default ServiceRequestDetailCard;