// ServiceRequestTabs.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { usePermissions } from '../../Utils/ConetextApi';
import ComplaintListScreen from './ServiceRequestPage';
import { complaintService } from '../../services/complaintService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Tab configuration
const TABS = ['Open', 'Closed', 'All'];
const calculateTabWidth = () => (SCREEN_WIDTH - 32) / TABS.length;

// Theme configuration
const COLORS = {
  primary: '#1996D3',
  
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

// Request status constants
const REQUEST_STATUS = {
  OPEN: 'Open',
  CLOSED: 'Closed',
  ALL: 'All',
};

const ServiceRequestTabs = () => {
  // State management
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [requests, setRequests] = useState({
    open: [],
    closed: [],
    all: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Refs
  const tabIndicatorPosition = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const isUserScrolling = useRef(false);
  
  // Theme and navigation
  const { nightMode } = usePermissions();
  const navigation = useNavigation();
  const theme = nightMode ? COLORS.dark : COLORS.light;

  // Fetch service requests data
  useEffect(() => {
    fetchServiceRequests();
  }, []);

  const fetchServiceRequests = async () => {
    try {
      setIsLoading(true);
      
      // Fetch open requests
      const openResponse = await complaintService.getMyComplaints(REQUEST_STATUS.OPEN);
      const openData = openResponse.data || [];

      // Fetch closed requests
      const closedResponse = await complaintService.getMyComplaints(REQUEST_STATUS.CLOSED);
      const closedData = closedResponse.data || [];

      // Combine for "All" tab
      const allData = [...openData, ...closedData];

      setRequests({
        open: openData,
        closed: closedData,
        all: allData,
      });
      
    } catch (error) {
      console.error('Failed to fetch service requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get current requests based on active tab
  const getCurrentRequests = () => {
    const activeTab = TABS[activeTabIndex];
    
    switch (activeTab) {
      case REQUEST_STATUS.OPEN:
        return requests.open;
      case REQUEST_STATUS.CLOSED:
        return requests.closed;
      case REQUEST_STATUS.ALL:
        return requests.all;
      default:
        return [];
    }
  };

  // Animate tab indicator when active tab changes
  useEffect(() => {
    const tabWidth = calculateTabWidth();
    
    Animated.spring(tabIndicatorPosition, {
      toValue: activeTabIndex * tabWidth,
      useNativeDriver: true,
      tension: 120,
      friction: 10,
    }).start();

    // Scroll to active tab content
    if (scrollViewRef.current && !isUserScrolling.current) {
      scrollViewRef.current.scrollTo({
        x: activeTabIndex * SCREEN_WIDTH,
        animated: true,
      });
    }
  }, [activeTabIndex]);

  // Handle tab press
  const handleTabPress = (index) => {
    setActiveTabIndex(index);
  };

  // Handle scroll events
  const handleScroll = (event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const progress = scrollX / SCREEN_WIDTH;
    const indicatorPosition = progress * calculateTabWidth();
    tabIndicatorPosition.setValue(indicatorPosition);
  };

  const handleScrollBegin = () => {
    isUserScrolling.current = true;
  };

  const handleScrollEnd = (event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(scrollX / SCREEN_WIDTH);
    
    isUserScrolling.current = false;
    
    if (newIndex >= 0 && newIndex < TABS.length && newIndex !== activeTabIndex) {
      setActiveTabIndex(newIndex);
    }
  };

  // Handle add button press
  const handleAddRequest = () => {
    navigation.navigate('CategorySelection');
  };

  // Render tab button
  const renderTab = (label, index) => {
    const isActive = activeTabIndex === index;
    
    return (
      <TouchableOpacity
        key={label}
        style={styles.tab}
        onPress={() => handleTabPress(index)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.tabLabel,
            { color: isActive ? COLORS.primary : theme.textSecondary },
            isActive && styles.tabLabelActive,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  // Render page content
  const renderPage = (tabName) => (
    <View style={[styles.page, { backgroundColor: theme.background }]}>
      <ComplaintListScreen
        nightMode={nightMode}
        status={tabName}
        complaints={getCurrentRequests()}
        isLoading={isLoading}
        onRefresh={fetchServiceRequests}
      />
    </View>
  );

  const styles = createStyles(theme, nightMode);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Tab Bar */}
      <View style={[styles.tabBar, {
        backgroundColor: theme.surface,
        borderBottomColor: theme.border,
      }]}>
        <View style={styles.tabContainer}>
          {TABS.map((label, index) => renderTab(label, index))}
          
          {/* Tab Indicator */}
          <Animated.View
            style={[
              styles.tabIndicator,
              {
                width: calculateTabWidth(),
                backgroundColor: COLORS.primary,
                transform: [{ translateX: tabIndicatorPosition }],
              },
            ]}
          />
        </View>
      </View>

      {/* Page Content */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBegin}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {TABS.map((tab) => renderPage(tab))}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, {
          backgroundColor: COLORS.primary,
          shadowColor: nightMode ? '#000' : COLORS.primary,
        }]}
        onPress={handleAddRequest}
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
    tabBar: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
      borderBottomWidth: 1,
    },
    tabContainer: {
      flexDirection: 'row',
      position: 'relative',
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabLabel: {
      fontSize: 15,
      fontWeight: '600',
      letterSpacing: 0.2,
    },
    tabLabelActive: {
      fontWeight: '700',
    },
    tabIndicator: {
      height: 3,
      borderRadius: 1.5,
      position: 'absolute',
      bottom: 0,
      left: 0,
    },
    scrollView: {
      flex: 1,
    },
    page: {
      width: SCREEN_WIDTH,
      flex: 1,
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

export default ServiceRequestTabs;