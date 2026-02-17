// VisitorScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
  ScrollView,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePermissions } from '../../Utils/ConetextApi';
import VisitRequest from './VisitRequest';
import SingleEntry from './SingleEntry';
import { visitorServices } from '../../services/visitorServices';
import PreApprovedPage from './PreApprovedPage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Tab configuration
const TABS = ['Visit Requests', 'Single Entry', 'Pre-Approved'];const calculateTabWidth = () => (SCREEN_WIDTH - 32) / TABS.length;

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

const VisitorScreen = () => {
  // State management
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [visits, setVisits] = useState(null);
  const [passes, setPasses] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Refs
  const tabIndicatorPosition = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const isUserScrolling = useRef(false);
  
  // Theme
  const { nightMode } = usePermissions();
  const theme = nightMode ? COLORS.dark : COLORS.light;

  // Fetch visits data
  const fetchVisits = async () => {
    try {
      setIsLoading(true);
      const response = await visitorServices.getMyVisitors();
      setVisits(response.data);
    } catch (error) {
      console.error('Error fetching visits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch passes data
  const fetchPasses = async () => {
    try {
      setIsLoading(true);
      const response = await visitorServices.getMyPasses();
      setPasses(response.data);
    } catch (error) {
      console.error('Error fetching passes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchVisits();
    fetchPasses();
  }, []);

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
    {tabName === 'Visit Requests' ? (
      <VisitRequest
        nightMode={nightMode}
        visitorData={visits}
        loading={isLoading}
        onRefresh={fetchVisits}
      />
    ) : tabName === 'Pre-Approved' ? (
      <PreApprovedPage
        nightMode={nightMode}
        loading={false}
      />
    ) : (
      <SingleEntry
        nightMode={nightMode}
        passData={passes}
        loading={isLoading}
        onRefresh={fetchPasses}
      />
    )}
  </View>
);

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={nightMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />

      {/* Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
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
    </SafeAreaView>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    tabBar: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
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
      fontSize: 13,
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
  });

export default VisitorScreen;