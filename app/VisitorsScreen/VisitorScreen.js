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
import { useNavigation } from '@react-navigation/native';
import AddPreVisitorModal from './components/AddPreVisitorModal'
import SingleEntry from './SingleEntry';
import { visitorServices } from '../../services/visitorServices';
import PreApprovedPage from './PreApprovedPage';
import { Ionicons } from '@expo/vector-icons';
import SlidingTabs from '../components/SlidingTabs';
import MyParkingPage from './singleMultiVisits/MyParkingPage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TABS = ['Visit Requests', 'Entry Passes',
  //  'Frequent Entry'
  ];

const calculateTabWidth = () => (SCREEN_WIDTH - 32) / TABS.length;

const COLORS = {
  primary: '#1996D3',
  light: {
    background: '#FFFFFF',
    surface: '#F8F9FA',
    text: '#212529',
    textSecondary: '#6C757D',
    border: '#DEE2E6',
  },
  dark: {
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#9E9E9E',
    border: '#2C2C2C',
  },
};


const VisitorScreen = () => {
  const navigation = useNavigation();
  // Tab state
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [visits, setVisits] = useState(null);
  const [passes, setPasses] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [parkingBookings, setParkingBookings] = useState([]);

  // Dynamic Tabs
const TABS = React.useMemo(() => {
  return [
    'Visit Requests',
    'Entry Passes',
    ...(parkingBookings?.length > 0 ? ['Parking'] : [])
  ];
}, [parkingBookings]);

const calculateTabWidth = () => (SCREEN_WIDTH - 32) / TABS.length;

  // ✅ Modal state — shared across all 3 tabs
  const [showPreApproveModal, setShowPreApproveModal] = useState(false);

  const tabIndicatorPosition = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const isUserScrolling = useRef(false);

  const { nightMode } = usePermissions();
  const theme = nightMode ? COLORS.dark : COLORS.light;

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



  useEffect(() => {
    const tabWidth = calculateTabWidth();

    Animated.spring(tabIndicatorPosition, {
      toValue: activeTabIndex * tabWidth,
      useNativeDriver: true,
      tension: 120,
      friction: 10,
    }).start();

    if (scrollViewRef.current && !isUserScrolling.current) {
      scrollViewRef.current.scrollTo({
        x: activeTabIndex * SCREEN_WIDTH,
        animated: true,
      });
    }
  }, [activeTabIndex]);

  const handleTabPress = (index) => setActiveTabIndex(index);

  const handleScroll = (event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const progress = scrollX / SCREEN_WIDTH;
    tabIndicatorPosition.setValue(progress * calculateTabWidth());
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

  const fetchParkingBookings = async () => {
  const response = await visitorServices.getParkingBookings();
  console.log("🔥 PARKING BOOKINGS RESPONSE:", response.data);
  setParkingBookings(response?.data || []);
  }
  const fetchpass = async () => {
  const response = await visitorServices.getMyPasses();
  console.log("🔥 MY PASSES RESPONSE:", response.data);
  setPasses(response?.data || []);
};

useEffect(() => {
  const loadData = async () => {
    setIsLoading(true);

    const [visitsRes, passesRes, parkingRes] = await Promise.all([
      visitorServices.getMyVisitors(),
      visitorServices.getMyPasses(),
      visitorServices.getParkingBookings(),
    ]);

    setVisits(visitsRes.data || []);
    setPasses(passesRes.data || []);
    setParkingBookings(parkingRes.data || []);

    setIsLoading(false);
  };

  loadData();
}, []);

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

  const renderPage = (tabName) => (
  <View style={[styles.page, { backgroundColor: theme.background }]}>
    {tabName === 'Visit Requests' ? (
      <VisitRequest
        nightMode={nightMode}
        visitorData={visits}
        loading={isLoading}
        onRefresh={fetchVisits}
      />
    ) : tabName === 'Entry Passes' ? (
      <SingleEntry
        nightMode={nightMode}
        passData={passes}
        loading={isLoading}
        onRefresh={async () => {
          await fetchpass();
          await fetchParkingBookings();
        }}
      />
    ) : (
      <MyParkingPage
        nightMode={nightMode}
        parkingBookings={parkingBookings}
        loading={isLoading}
        onRefresh={fetchParkingBookings}
      />
    )}
  </View>
);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={nightMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />

      {/* Tab Bar */}
      <SlidingTabs
        tabs={TABS}
        activeIndex={activeTabIndex}
        onTabPress={setActiveTabIndex}
        primaryColor={COLORS.primary}
        inactiveColor={theme.textSecondary}
        containerStyle={{
          backgroundColor: theme.surface,
        }}
      />

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
       {TABS.map((tab, index) => (
  <View key={tab} style={{ width: SCREEN_WIDTH }}>
    {renderPage(tab)}
  </View>
))}
      </ScrollView>

      {/* ✅ Single FAB shared across all 3 tabs */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: COLORS.primary }]}
        onPress={() => setShowPreApproveModal(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />

      </TouchableOpacity>





      {/* ✅ Step 2 — Delivery / Guest / Cab / Others */}
      <AddPreVisitorModal
        visible={showPreApproveModal}
        nightMode={nightMode}
        onClose={() => setShowPreApproveModal(false)}
        onDelivery={() => {
          setShowPreApproveModal(false);
          setTimeout(() => navigation.navigate('AddVisitor', { type: 'delivery' }), 200);
        }}

        onGuest={() => {
          setShowPreApproveModal(false);
          setTimeout(() => navigation.navigate('AddVisitor', { type: 'guest' }), 200);
        }}

        onCab={() => {
          setShowPreApproveModal(false);
          setTimeout(() => navigation.navigate('AddVisitor', { type: 'cab' }), 200);
        }}
        onOthers={() => {
          setShowPreApproveModal(false);
          setTimeout(() => navigation.navigate('AddVisitor', { type: 'others' }), 200);
        }}
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    bottom: 100,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  fabIcon: {
    color: '#fff',
    fontSize: 32,
    lineHeight: 34,
    fontWeight: '300',
  },
});

export default VisitorScreen;