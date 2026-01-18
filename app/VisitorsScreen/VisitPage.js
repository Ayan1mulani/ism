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

// Updated theme colors
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

const VisitsPage = ({ nightMode, visitorData, loading, onRefresh }) => {
  const [filteredVisits, setFilteredVisits] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const currentTheme = {
    backgroundColor: nightMode ? THEME_COLORS.darkBackground : THEME_COLORS.lightBackground,
    componentBackground: nightMode ? THEME_COLORS.darkComponentBackground : THEME_COLORS.componentBackground,
    borderColor: nightMode ? THEME_COLORS.darkBorderColor : THEME_COLORS.borderColor,
    textColor: nightMode ? THEME_COLORS.darkTextColor : THEME_COLORS.darkText,
    inactiveTextColor: nightMode ? THEME_COLORS.darkInactiveText : THEME_COLORS.inactiveText,
  };

  useEffect(() => {
    if (visitorData?.visits) {
      filterVisits();
    }
  }, [visitorData, searchQuery]);

  const filterVisits = () => {
    if (!visitorData?.visits) {
      setFilteredVisits([]);
      return;
    }

    let filtered = visitorData.visits;
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(visit =>
        visit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        visit.mobile.includes(searchQuery) ||
        visit.purpose.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredVisits(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const getStatusColor = (visit) => {
    const now = new Date();
    const endTime = new Date(visit.end_time);
    
    if (visit.otp_verified === 1) {
      return '#34C759'; // Verified - Green
    } else if (endTime < now) {
      return '#FF3B30'; // Expired - Red
    } else {
      return '#FF9500'; // Pending - Orange
    }
  };

  const getStatusText = (visit) => {
    const now = new Date();
    const endTime = new Date(visit.end_time);
    
    if (visit.otp_verified === 1) {
      return 'VERIFIED';
    } else if (endTime < now) {
      return 'EXPIRED';
    } else {
      return 'PENDING';
    }
  };

  const formatTime = (timeString) => {
    try {
      return new Date(timeString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return timeString;
    }
  };

  const getWhomToMeet = (whomToMeetString) => {
    try {
      const whomToMeetData = JSON.parse(whomToMeetString);
      if (whomToMeetData && whomToMeetData.length > 0) {
        const resident = whomToMeetData[0];
        return {
          name: resident.name,
          unit: resident.display_unit_no || resident.flat_no,
          phone: resident.phone_no
        };
      }
    } catch (error) {
      console.error('Error parsing whom_to_meet:', error);
    }
    return null;
  };

  const handleVisitPress = (visit) => {
    const resident = getWhomToMeet(visit.whom_to_meet);
    
    Alert.alert(
      'Visit Details',
      `Visitor: ${visit.name}\nPhone: ${visit.mobile}\nPurpose: ${visit.purpose}\nOTP: ${visit.otp}\nDuration: ${visit.duration}\n${resident ? `Meeting: ${resident.name}\nUnit: ${resident.unit}` : ''}`,
      [
        {
          text: 'Call Visitor',
          onPress: () => console.log('Call:', visit.mobile),
        },
        {
          text: 'OK',
          style: 'cancel'
        }
      ]
    );
  };

  const renderVisitItem = ({ item }) => {
    const resident = getWhomToMeet(item.whom_to_meet);
    
    return (
      <TouchableOpacity 
        style={[styles.visitCard, { 
          backgroundColor: currentTheme.componentBackground,
          borderColor: currentTheme.borderColor,
        }]}
        onPress={() => handleVisitPress(item)}
      >
        <View style={styles.visitHeader}>
          <Image 
            source={{ uri: item.image || 'https://via.placeholder.com/60' }} 
            style={styles.visitImage} 
          />
          <View style={styles.visitInfo}>
            <Text style={[styles.visitName, { color: currentTheme.textColor }]}>
              {item.name}
            </Text>
            <Text style={[styles.visitMobile, { color: currentTheme.inactiveTextColor }]}>
              {item.mobile}
            </Text>
            <Text style={[styles.visitPurpose, { color: THEME_COLORS.primaryAccent }]}>
              {item.purpose}
            </Text>
            {resident && (
              <Text style={[styles.visitUnit, { color: currentTheme.inactiveTextColor }]}>
                Meeting: {resident.name} - {resident.unit}
              </Text>
            )}
          </View>
          <View style={styles.visitStatus}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item) }]}>
              <Text style={styles.statusText}>
                {getStatusText(item)}
              </Text>
            </View>
            <Text style={[styles.duration, { color: currentTheme.inactiveTextColor }]}>
              {item.duration}
            </Text>
          </View>
        </View>
        
        <View style={[styles.visitFooter, { borderTopColor: currentTheme.borderColor }]}>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={16} color={currentTheme.inactiveTextColor} />
            <Text style={[styles.timeText, { color: currentTheme.inactiveTextColor }]}>
              {formatTime(item.start_time)}
            </Text>
          </View>
          <View style={styles.otpContainer}>
            <Text style={[styles.otpLabel, { color: currentTheme.inactiveTextColor }]}>OTP:</Text>
            <Text style={[styles.otpValue, { color: THEME_COLORS.primaryAccent }]}>
              {item.otp}
            </Text>
          </View>
          {item.extra_visitors > 0 && (
            <View style={styles.extraVisitors}>
              <Ionicons name="people-outline" size={16} color={THEME_COLORS.primaryAccent} />
              <Text style={[styles.extraVisitorsText, { color: THEME_COLORS.primaryAccent }]}>
                +{item.extra_visitors}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color={currentTheme.inactiveTextColor} />
      <Text style={[styles.emptyStateTitle, { color: currentTheme.textColor }]}>
        No Visits Found
      </Text>
      <Text style={[styles.emptyStateSubtitle, { color: currentTheme.inactiveTextColor }]}>
        {searchQuery ? 'Try adjusting your search' : 'No visits available'}
      </Text>
    </View>
  );

  const styles = getVisitsStyles(currentTheme, nightMode);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: currentTheme.backgroundColor }]}>
        <ActivityIndicator size="large" color={THEME_COLORS.primaryAccent} />
        <Text style={[styles.loadingText, { color: currentTheme.textColor }]}>
          Loading visits...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { 
          backgroundColor: currentTheme.componentBackground,
          borderColor: currentTheme.borderColor,
        }]}>
          <Ionicons name="search" size={20} color={currentTheme.inactiveTextColor} />
          <TextInput
            style={[styles.searchInput, { color: currentTheme.textColor }]}
            placeholder="Search visits..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={currentTheme.inactiveTextColor}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={currentTheme.inactiveTextColor} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Visits List */}
      <FlatList
        data={filteredVisits}
        renderItem={renderVisitItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[THEME_COLORS.primaryAccent]}
            tintColor={THEME_COLORS.primaryAccent}
          />
        }
      />
    </View>
  );
};

const getVisitsStyles = (currentTheme, nightMode) => StyleSheet.create({
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  visitCard: {
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
  visitHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  visitImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F2F2F7',
  },
  visitInfo: {
    flex: 1,
    marginLeft: 12,
  },
  visitName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  visitMobile: {
    fontSize: 14,
    marginBottom: 2,
  },
  visitPurpose: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  visitUnit: {
    fontSize: 12,
  },
  visitStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  duration: {
    fontSize: 12,
    textAlign: 'right',
  },
  visitFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    flexWrap: 'wrap',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    marginLeft: 6,
  },
  otpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  otpLabel: {
    fontSize: 14,
    marginRight: 6,
  },
  otpValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  extraVisitors: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  extraVisitorsText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default VisitsPage;
