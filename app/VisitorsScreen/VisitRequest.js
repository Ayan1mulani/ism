// VisitsPage.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
    imagePlaceholder: '#E9ECEF',
  },
  
  // Dark theme
  dark: {
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#9E9E9E',
    border: '#2C2C2C',
    imagePlaceholder: '#2C2C2C',
  },
};

// Visit status constants
const VISIT_STATUS = {
  VERIFIED: 'VERIFIED',
  EXPIRED: 'EXPIRED',
  PENDING: 'PENDING',
};

const VisitsPage = ({ nightMode, visitorData, loading, onRefresh }) => {
  const [filteredVisits, setFilteredVisits] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const theme = nightMode ? COLORS.dark : COLORS.light;

  // Filter visits based on search query
  useEffect(() => {
    if (visitorData?.visits) {
      applySearchFilter();
    }
  }, [visitorData, searchQuery]);

  const applySearchFilter = () => {
    if (!visitorData?.visits) {
      setFilteredVisits([]);
      return;
    }

    let filtered = visitorData.visits;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(visit =>
        visit.name.toLowerCase().includes(query) ||
        visit.mobile.includes(searchQuery) ||
        visit.purpose.toLowerCase().includes(query)
      );
    }
    
    setFilteredVisits(filtered);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Get visit status
  const getVisitStatus = (visit) => {
    const currentTime = new Date();
    const endTime = new Date(visit.end_time);
    
    if (visit.otp_verified === 1) {
      return {
        label: VISIT_STATUS.VERIFIED,
        color: COLORS.success,
      };
    } else if (endTime < currentTime) {
      return {
        label: VISIT_STATUS.EXPIRED,
        color: COLORS.error,
      };
    } else {
      return {
        label: VISIT_STATUS.PENDING,
        color: COLORS.warning,
      };
    }
  };

  const formatTime = (timeString) => {
    try {
      return new Date(timeString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return timeString;
    }
  };

  const parseResidentInfo = (whomToMeetString) => {
    try {
      const data = JSON.parse(whomToMeetString);
      if (data && data.length > 0) {
        const resident = data[0];
        return {
          name: resident.name,
          unit: resident.display_unit_no || resident.flat_no,
          phone: resident.phone_no,
        };
      }
    } catch (error) {
      console.error('Error parsing resident info:', error);
    }
    return null;
  };

  const showVisitDetails = (visit) => {
    const resident = parseResidentInfo(visit.whom_to_meet);
    
    const details = [
      `Visitor: ${visit.name}`,
      `Phone: ${visit.mobile}`,
      `Purpose: ${visit.purpose}`,
      `OTP: ${visit.otp}`,
      `Duration: ${visit.duration}`,
    ];
    
    if (resident) {
      details.push(`Meeting: ${resident.name}`);
      details.push(`Unit: ${resident.unit}`);
    }
    
    Alert.alert(
      'Visit Details',
      details.join('\n'),
      [
        {
          text: 'Call Visitor',
          onPress: () => console.log('Calling:', visit.mobile),
        },
        {
          text: 'Close',
          style: 'cancel',
        },
      ]
    );
  };

  const renderVisitCard = ({ item: visit }) => {
    const resident = parseResidentInfo(visit.whom_to_meet);
    const status = getVisitStatus(visit);
    
    return (
      <TouchableOpacity
        style={[styles.card, {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        }]}
        onPress={() => showVisitDetails(visit)}
        activeOpacity={0.7}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <Image
            source={{ uri: visit.image || 'https://via.placeholder.com/60' }}
            style={[styles.avatar, { backgroundColor: theme.imagePlaceholder }]}
          />
          
          <View style={styles.visitorInfo}>
            <Text style={[styles.visitorName, { color: theme.text }]} numberOfLines={1}>
              {visit.name}
            </Text>
            <Text style={[styles.visitorPhone, { color: theme.textSecondary }]}>
              {visit.mobile}
            </Text>
            <Text style={[styles.purpose, { color: COLORS.primary }]} numberOfLines={1}>
              {visit.purpose}
            </Text>
            {resident && (
              <Text style={[styles.residentInfo, { color: theme.textSecondary }]} numberOfLines={1}>
                Meeting: {resident.name} • {resident.unit}
              </Text>
            )}
          </View>
          
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
              <Text style={styles.statusLabel}>{status.label}</Text>
            </View>
            <Text style={[styles.duration, { color: theme.textSecondary }]}>
              {visit.duration}
            </Text>
          </View>
        </View>
        
        {/* Card Footer */}
        <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
          <View style={styles.footerItem}>
            <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              {formatTime(visit.start_time)}
            </Text>
          </View>
          
          <View style={styles.footerItem}>
            <Text style={[styles.otpLabel, { color: theme.textSecondary }]}>OTP:</Text>
            <Text style={[styles.otpValue, { color: COLORS.primary }]}>
              {visit.otp}
            </Text>
          </View>
          
          {visit.extra_visitors > 0 && (
            <View style={styles.footerItem}>
              <Ionicons name="people-outline" size={16} color={COLORS.primary} />
              <Text style={[styles.extraVisitorsCount, { color: COLORS.primary }]}>
                +{visit.extra_visitors}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color={theme.textSecondary} />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        No Visits Found
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        {searchQuery ? 'Try adjusting your search' : 'You have no visits at the moment'}
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={[styles.loadingState, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={[styles.loadingText, { color: theme.text }]}>
        Loading visits...
      </Text>
    </View>
  );

  const styles = createStyles(theme, nightMode);

  if (loading) {
    return renderLoadingState();
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        }]}>
          <Ionicons name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.textSecondary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Visits List */}
      <FlatList
        data={filteredVisits}
        renderItem={renderVisitCard}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      />
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
    searchSection: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
    },
    searchInput: {
      flex: 1,
      marginLeft: 8,
      fontSize: 15,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 20,
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
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
    },
    visitorInfo: {
      flex: 1,
      marginLeft: 12,
    },
    visitorName: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 2,
    },
    visitorPhone: {
      fontSize: 14,
      marginBottom: 2,
    },
    purpose: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 2,
    },
    residentInfo: {
      fontSize: 12,
      marginTop: 2,
    },
    statusContainer: {
      alignItems: 'flex-end',
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      marginBottom: 4,
    },
    statusLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: 0.5,
    },
    duration: {
      fontSize: 12,
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 12,
      borderTopWidth: 1,
      flexWrap: 'wrap',
      gap: 8,
    },
    footerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    footerText: {
      fontSize: 14,
    },
    otpLabel: {
      fontSize: 14,
    },
    otpValue: {
      fontSize: 16,
      fontWeight: '700',
    },
    extraVisitorsCount: {
      fontSize: 12,
      fontWeight: '600',
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
  });

export default VisitsPage;