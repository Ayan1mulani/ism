// ServiceRequestTabs.js
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, ScrollView } from 'react-native';
import ComplaintListScreen from './ServiceRequestPage';
import { usePermissions } from '../../Utils/ConetextApi';

// Define the statuses for the tabs
const TABS = ['Pending', 'In Progress', 'Completed'];
const { width } = Dimensions.get('window');
const TAB_WIDTH = (width - 40) / TABS.length; // Subtracting horizontal padding

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

const ServiceRequestTabs = () => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const isScrolling = useRef(false); // Flag to prevent circular updates
  const {nightMode} = usePermissions();

  // Dynamic theme based on night mode
  const currentTheme = {
    backgroundColor: nightMode ? THEME_COLORS.darkBackground : THEME_COLORS.lightBackground,
    componentBackground: nightMode ? THEME_COLORS.darkComponentBackground : THEME_COLORS.componentBackground,
    borderColor: nightMode ? THEME_COLORS.darkBorderColor : THEME_COLORS.borderColor,
    textColor: nightMode ? THEME_COLORS.darkText : THEME_COLORS.darkText,
    inactiveTextColor: nightMode ? THEME_COLORS.darkInactiveText : THEME_COLORS.inactiveText,
    tabsBackground: nightMode ? '#2a2a2a' : '#f0f0f0',
  };

  useEffect(() => {
    const newIndex = TABS.indexOf(activeTab);
    
    // Animate the tab slider
    Animated.spring(slideAnim, {
      toValue: newIndex * TAB_WIDTH,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();

    // Scroll the content view only if not currently scrolling
    if (scrollViewRef.current && !isScrolling.current) {
      scrollViewRef.current.scrollTo({
        x: newIndex * width,
        animated: true,
      });
    }
  }, [activeTab]);

  // Handle scroll events in real-time for smooth synchronization
  const onScroll = (event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    
    // Update slider position in real-time based on scroll
    const progress = scrollX / width;
    const sliderPosition = progress * TAB_WIDTH;
    slideAnim.setValue(sliderPosition);
  };

  // Handle when scrolling momentum ends to update active tab
  const onMomentumScrollEnd = (event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(scrollX / width);
    
    isScrolling.current = false;
    
    if (TABS[pageIndex] && TABS[pageIndex] !== activeTab) {
      setActiveTab(TABS[pageIndex]);
    }
  };

  // Handle when scrolling begins
  const onScrollBeginDrag = () => {
    isScrolling.current = true;
  };

  const renderContentPane = (title, content) => (
    <View style={[styles.contentPane, { backgroundColor: currentTheme.backgroundColor }]}>
      <ComplaintListScreen nightMode={nightMode} />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
      <View style={[styles.header, { 
        backgroundColor: currentTheme.componentBackground,
        borderBottomColor: currentTheme.borderColor
      }]}>
        <View style={[styles.tabsContainer, { backgroundColor: currentTheme.tabsBackground }]}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[
                styles.tabText, 
                { color: currentTheme.inactiveTextColor },
                activeTab === tab && [styles.activeTabText, { color: THEME_COLORS.primaryAccent }]
              ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
          <Animated.View
            style={[
              styles.activeTabSlider,
              {
                width: TAB_WIDTH,
                transform: [{ translateX: slideAnim }],
                backgroundColor: THEME_COLORS.primaryAccent,
              },
            ]}
          />
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollBeginDrag={onScrollBeginDrag}
        scrollEventThrottle={16}
        style={styles.contentContainer}
      >
        {renderContentPane('Pending Requests', 'Loading pending requests...')}
        {renderContentPane('In Progress Requests', 'Loading in-progress requests...')}
        {renderContentPane('Completed Requests', 'Loading completed requests...')}
      </ScrollView>
    </View>
  );
};

// --- STYLES (Updated with dynamic theming) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 90
  },
  header: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    position: 'relative',
    borderRadius: 8,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: 'bold',
  },
  activeTabSlider: {
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: -1,
    left: 0,
  },
  contentContainer: {
    flex: 1,
  },
  contentPane: {
    width: width,
    flex: 1,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  contentText: {
    fontSize: 16,
  },
});

export default ServiceRequestTabs;
