// VisitorScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ScrollView,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { usePermissions } from '../../Utils/ConetextApi';
import VisitsPage from './VisitPage';
import PassPage from './PassPage';
import { visitorServices } from '../../services/visitorServices';
import { otherServices } from '../../services/otherServices';

const { width } = Dimensions.get('window');

// Define the tabs
const TABS = ['Visits', 'Pass'];
const TAB_WIDTH = (width - 40) / TABS.length;

// Updated theme colors with your specified colors
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
  darkTextColor: '#ffffff',
  darkInactiveText: '#aaaaaa',
};

const VisitorScreen = () => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [visitorData, setVisitorData] = useState(null);
  const [passData, setPassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const isScrolling = useRef(false);
  const { nightMode } = usePermissions();

  // Dynamic theme based on night mode
  const currentTheme = {
    backgroundColor: nightMode ? THEME_COLORS.darkBackground : THEME_COLORS.lightBackground,
    componentBackground: nightMode ? THEME_COLORS.darkComponentBackground : THEME_COLORS.componentBackground,
    borderColor: nightMode ? THEME_COLORS.darkBorderColor : THEME_COLORS.borderColor,
    textColor: nightMode ? THEME_COLORS.darkTextColor : THEME_COLORS.darkText,
    inactiveTextColor: nightMode ? THEME_COLORS.darkInactiveText : THEME_COLORS.inactiveText,
    tabsBackground: nightMode ? '#2a2a2a' : '#f0f0f0',
  };

  useEffect(() => {
    const newIndex = TABS.indexOf(activeTab);
    
    Animated.spring(slideAnim, {
      toValue: newIndex * TAB_WIDTH,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();

    if (scrollViewRef.current && !isScrolling.current) {
      scrollViewRef.current.scrollTo({
        x: newIndex * width,
        animated: true,
      });
    }
  }, [activeTab]);

  useEffect(() => {
    getVisitors();
    getPasses();
  }, []);

  const getVisitors = async () => {
    try {
      setLoading(true);
      const response = await visitorServices.getMyVisitors();
      setVisitorData(response.data);
    } catch (error) {
      console.error('Error fetching visitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPasses = async () => {
    try {
      setLoading(true);
      const response = await visitorServices.getMyPasses();
      setPassData(response.data);
    } catch (error) {
      console.error('Error fetching visitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const onScroll = (event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const progress = scrollX / width;
    const sliderPosition = progress * TAB_WIDTH;
    slideAnim.setValue(sliderPosition);
  };

  const onMomentumScrollEnd = (event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(scrollX / width);
    
    isScrolling.current = false;
    
    if (TABS[pageIndex] && TABS[pageIndex] !== activeTab) {
      setActiveTab(TABS[pageIndex]);
    }
  };

  const onScrollBeginDrag = () => {
    isScrolling.current = true;
  };

  const renderContentPane = (tabName) => (
    <View style={[styles.contentPane, { backgroundColor: currentTheme.backgroundColor }]}>
      {tabName === 'Visits' ? (
        <VisitsPage 
          nightMode={nightMode} 
          visitorData={visitorData}
          loading={loading}
          onRefresh={getVisitors}
        />
      ) : (
        <PassPage 
          nightMode={nightMode} 
          passData={passData} 
          loading={loading} 
          onRefresh={getPasses} 
        />
      )}
    </View>
  );

  const styles = getStyles(currentTheme);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
      <StatusBar 
        barStyle={nightMode ? "light-content" : "dark-content"} 
        backgroundColor={nightMode ? THEME_COLORS.darkBackground : THEME_COLORS.lightBackground} 
      />
      
      {/* Header with Sliding Tabs */}
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

      {/* Scrollable Content */}
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
        {renderContentPane('Visits')}
        {renderContentPane('Pass')}
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (currentTheme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,  // Reduced from 20
    paddingVertical: 8,      // Reduced from 16
    borderBottomWidth: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    position: 'relative',
    borderRadius: 8,         // Reduced from 12
    padding: 2,              // Reduced from 4
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,      // Reduced from 12
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 14,            // Reduced from 16
    fontWeight: '600',
  },
  activeTabText: {
    fontWeight: '700',
  },
  activeTabSlider: {
    height: 3,               // Reduced from 4
    borderRadius: 1.5,       // Reduced from 2
    position: 'absolute',
    bottom: 1,               // Reduced from 2
    left: 2,                 // Adjusted to match new padding
  },
  contentContainer: {
    flex: 1,
  },
  contentPane: {
    width: width,
    flex: 1,
  },
});

export default VisitorScreen;
