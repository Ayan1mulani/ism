// ServiceRequestTabs.js
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ComplaintListScreen from './ServiceRequestPage';
import { usePermissions } from '../../Utils/ConetextApi';
import ComplaintCategoryModal from './complaintCatModel';
import { useNavigation } from '@react-navigation/native';
import { complaintService } from '../../services/complaintService';

// Define the statuses for the tabs
const TABS = ['Open', 'Closed', 'All'];
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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [openComplaints, setOpenComplaints] = useState([]);
  const [closedComplaints, setClosedComplaints] = useState([]);
  const [allComplaints, setAllComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const isScrolling = useRef(false); // Flag to prevent circular updates
  const { nightMode } = usePermissions();

  const navigation = useNavigation();

  // Dynamic theme based on night mode
  const currentTheme = {
    backgroundColor: nightMode ? THEME_COLORS.darkBackground : THEME_COLORS.lightBackground,
    componentBackground: nightMode ? THEME_COLORS.darkComponentBackground : THEME_COLORS.componentBackground,
    borderColor: nightMode ? THEME_COLORS.darkBorderColor : THEME_COLORS.borderColor,
    textColor: nightMode ? THEME_COLORS.darkText : THEME_COLORS.darkText,
    inactiveTextColor: nightMode ? THEME_COLORS.darkInactiveText : THEME_COLORS.inactiveText,
    tabsBackground: nightMode ? '#2a2a2a' : '#f0f0f0',
  };

  // Fetch complaints data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch open complaints
        const openResponse = await complaintService.getMyComplaints('Open');
        setOpenComplaints(openResponse.data || []);

        // Fetch closed complaints
        const closedResponse = await complaintService.getMyComplaints('Closed');
        setClosedComplaints(closedResponse.data || []);

        // Combine both for "All" tab
        const combinedComplaints = [
          ...(openResponse.data || []),
          ...(closedResponse.data || [])
        ];
        setAllComplaints(combinedComplaints);

      } catch (error) {
        console.error("Failed to fetch complaints:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Get current complaints based on active tab
  const getCurrentComplaints = () => {
    switch (activeTab) {
      case 'Open':
        console.log(openComplaints,'this are open on active')
        return openComplaints;
      case 'Closed':
        return closedComplaints;
      case 'All':
        return allComplaints;
      default:
        return [];
    }
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

  // Handle FAB press
  const handleFABPress = () => {
    // Navigate to category selection page instead of opening modal
    navigation.navigate('CategorySelection');
  };



  const renderContentPane = (tabName) => (
    <View style={[styles.contentPane, { backgroundColor: currentTheme.backgroundColor }]}>
      <ComplaintListScreen 
        nightMode={nightMode} 
        status={tabName}
        complaints={getCurrentComplaints()}
        isLoading={isLoading}
      />
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
        {renderContentPane('Open')}
        {renderContentPane('Closed')}
        {renderContentPane('All')}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: THEME_COLORS.primaryAccent,
            shadowColor: nightMode ? '#000' : THEME_COLORS.primaryAccent,
          }
        ]}
        onPress={handleFABPress}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};

// --- STYLES (Updated with FAB) ---
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
  fab: {
    position: 'absolute',
    bottom: 110, // Above your bottom navigation
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default ServiceRequestTabs;
