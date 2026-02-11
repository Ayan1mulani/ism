// PassPage.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Theme configuration
const COLORS = {
  primary: '#1996D3',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',

  // Light theme
  light: {
    background: '#FFFFFF',
    surface: '#F8F9FA',
    text: '#212529',
    textSecondary: '#6C757D',
    border: '#DEE2E6',
  },

  // Dark theme
  dark: {
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#9E9E9E',
    border: '#2C2C2C',
  },
};

// Pass status constants
const PASS_STATUS = {
  ACTIVE: '1',
  INACTIVE: '0',
};

// Pass purpose icons mapping
const PURPOSE_ICONS = {
  guest: 'people-outline',
  delivery: 'cube-outline',
  visitor: 'person-outline',
  service: 'construct-outline',
  vendor: 'briefcase-outline',
  cab: 'car-outline',
  taxi: 'car-outline',
  default: 'card-outline',
};

const PassPage = ({ nightMode, passData, loading, onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigation = useNavigation();

  const theme = nightMode ? COLORS.dark : COLORS.light;

  const getPurposeIcon = (purpose) => {
    const key = purpose?.toLowerCase();
    return PURPOSE_ICONS[key] || PURPOSE_ICONS.default;
  };

  const getPassStatus = (status) => {
    const statusStr = String(status);

    if (statusStr === PASS_STATUS.ACTIVE) {
      return {
        label: 'ACTIVE',
        color: COLORS.success,
      };
    } else if (statusStr === PASS_STATUS.INACTIVE) {
      return {
        label: 'INACTIVE',
        color: COLORS.error,
      };
    } else {
      return {
        label: 'PENDING',
        color: COLORS.warning,
      };
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  };

  const getValidityText = (pass) => {
    if (pass.valid_days) {
      return `Valid for ${pass.valid_days} day${pass.valid_days > 1 ? 's' : ''}`;
    }

    if (pass.date_time) {
      const passDate = new Date(pass.date_time);
      const today = new Date();

      if (passDate.toDateString() === today.toDateString()) {
        return 'Valid for today';
      }
      return `Valid until ${formatDate(pass.date_time)}`;
    }

    return 'Validity not specified';
  };

  const isParkingBooked = (pass) => {
    // Check if parking is booked - adjust the property name based on your API
    return pass.parking_booked === 1 ||
      pass.parking_booked === true ||
      pass.has_parking === 1 ||
      pass.has_parking === true;
  };

  const showPassDetails = (pass) => {
    const status = getPassStatus(pass.status);

    const details = [
      `Pass No: ${pass.pass_no}`,
      `Name: ${pass.name}`,
      `Mobile: ${pass.mobile}`,
      `Purpose: ${pass.purpose}`,
      `Status: ${status.label}`,
      `Created: ${formatDate(pass.created_at)}`,
    ];

    if (pass.company_name) {
      details.push(`Company: ${pass.company_name}`);
    }

    if (isParkingBooked(pass)) {
      details.push(`Parking: Booked`);
    }

    if (pass.remarks) {
      details.push(`Remarks: ${pass.remarks}`);
    }

    Alert.alert(
      'Pass Details',
      details.join('\n'),
      [
        {
          text: 'Edit',
          onPress: () => console.log('Edit pass:', pass.id),
        },
        {
          text: 'Share',
          onPress: () => console.log('Share pass:', pass.id),
        },
        {
          text: 'Call',
          onPress: () => console.log('Calling:', pass.mobile),
        },
        {
          text: 'Close',
          style: 'cancel',
        },
      ]
    );
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (onRefresh) {
      await onRefresh();
    }
    setIsRefreshing(false);
  };

  const handleAddPass = () => {
    navigation.navigate('AddVisitor');
  };

  const renderPassCard = ({ item: pass }) => {
    const status = getPassStatus(pass.status);
    const hasParkingBooked = isParkingBooked(pass);

    return (
      <TouchableOpacity
        style={[styles.card, {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        }]}
        onPress={() => showPassDetails(pass)}
        activeOpacity={0.7}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.leftSection}>
            <View style={[styles.iconContainer, {
              backgroundColor: `${COLORS.primary}15`,
            }]}>
              <Ionicons
                name={getPurposeIcon(pass.purpose)}
                size={24}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.passInfo}>
              <Text style={[styles.passTitle, { color: theme.text }]} numberOfLines={1}>
                {pass.purpose.charAt(0).toUpperCase() + pass.purpose.slice(1)} Pass
              </Text>
              <Text style={[styles.passName, { color: theme.textSecondary }]} numberOfLines={1}>
                {pass.name}
              </Text>
              <Text style={[styles.passPhone, { color: theme.textSecondary }]}>
                {pass.mobile}
              </Text>
              {pass.company_name && (
                <Text style={[styles.companyName, { color: COLORS.primary }]} numberOfLines={1}>
                  {pass.company_name}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.rightSection}>
            <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
              <Text style={styles.statusLabel}>{status.label}</Text>
            </View>
            <Text style={[styles.passNumber, { color: COLORS.primary }]}>
              #{pass.pass_no}
            </Text>

            {/* Parking Indicator */}
            {hasParkingBooked && (
              <View style={styles.parkingIndicator}>
                <Ionicons name="car" size={20} color={COLORS.primary} />
              </View>
            )}
          </View>
        </View>

        {/* Card Footer */}
        <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
          <View style={styles.validitySection}>
            <Ionicons name="time-outline" size={16} color={status.color} />
            <Text style={[styles.validityText, { color: status.color }]}>
              {getValidityText(pass)}
            </Text>
          </View>
          <Text style={[styles.createdDate, { color: theme.textSecondary }]}>
            Created: {formatDate(pass.created_at)}
          </Text>
        </View>

        {/* Remarks Section */}
        {pass.remarks && (
          <View style={[styles.remarksSection, { borderTopColor: theme.border }]}>
            <Ionicons name="chatbubble-outline" size={14} color={theme.textSecondary} />
            <Text style={[styles.remarksText, { color: theme.textSecondary }]} numberOfLines={2}>
              {pass.remarks}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="card-outline" size={64} color={theme.textSecondary} />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        No Passes Found
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        Create a new pass to get started
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={[styles.loadingState, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={[styles.loadingText, { color: theme.text }]}>
        Loading passes...
      </Text>
    </View>
  );

  const styles = createStyles(theme, nightMode);

  if (loading) {
    return renderLoadingState();
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Pass List */}
      <FlatList
        data={passData || []}
        renderItem={renderPassCard}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, {
          backgroundColor: COLORS.primary,
          shadowColor: nightMode ? '#000' : COLORS.primary,
        }]}
        onPress={handleAddPass}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme, nightMode) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    loadingState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      fontWeight: '500',
    },
    listContent: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingBottom: 100,
    },
    card: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: nightMode ? 0.3 : 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    leftSection: {
      flexDirection: 'row',
      flex: 1,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    passInfo: {
      flex: 1,
    },
    passTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 2,
    },
    passName: {
      fontSize: 14,
      marginBottom: 2,
    },
    passPhone: {
      fontSize: 13,
      marginBottom: 2,
    },
    companyName: {
      fontSize: 13,
      fontWeight: '500',
      marginTop: 2,
    },
    rightSection: {
      alignItems: 'flex-end',
      gap: 4,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    statusLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: 0.5,
    },
    passNumber: {
      fontSize: 12,
      fontWeight: '600',
    },
    parkingIndicator: {
      marginTop: 4,
      padding: 4,
      backgroundColor: `${COLORS.primary}15`,
      borderRadius: 6,
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 12,
      borderTopWidth: 1,
    },
    validitySection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 6,
    },
    validityText: {
      fontSize: 13,
      fontWeight: '500',
    },
    createdDate: {
      fontSize: 11,
    },
    remarksSection: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingTop: 8,
      marginTop: 8,
      borderTopWidth: 1,
      gap: 6,
    },
    remarksText: {
      fontSize: 12,
      flex: 1,
      fontStyle: 'italic',
      lineHeight: 18,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 80,
      paddingHorizontal: 32,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 15,
      textAlign: 'center',
      lineHeight: 22,
    },
    fab: {
      position: 'absolute',
      bottom: 110,
      right: 30,
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
  });

export default PassPage;