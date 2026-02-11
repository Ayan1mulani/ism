import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Text,
  Animated,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import HomeScreen from './app/HomeScreen/HomeScreen';
import VisitorsScreen from './app/VisitorsScreen/VisitorScreen';
import Header from './app/Common/Header/Header';
import LoginScreen from './app/Login/Login';
import MoreScreen from './app/MoreScreen/MorePage';
import { PermissionsProvider, usePermissions } from './Utils/ConetextApi';
import { ismServices } from './services/ismServices';
import ServiceRequestTabs from './app/ServiceRequestScreen/ServiceHeader';
import CategorySelectionScreen from './app/ServiceRequestScreen/complaintCatModel';
import SubCategorySelectionScreen from './app/ServiceRequestScreen/subCateScreen';
import ComplaintInputScreen from './app/ServiceRequestScreen/complaintInput';
import NoticesScreen from './app/notices/MyNotices';
import AccountsScreen from './app/AccountsScreen/AccountsPage';
import StaffScreen from './app/StaffScreen/StaffPage';
import StaffDetailsScreen from './app/StaffScreen/StaffDetailsPage';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddVisitor from './app/VisitorsScreen/AddVisitor';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const { width } = Dimensions.get('window');

// --- Home Stack ---
const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Notices" component={NoticesScreen} />
      <Stack.Screen name="Accounts" component={AccountsScreen} />
      <Stack.Screen name="StaffScreen" component={StaffScreen} />
      <Stack.Screen name="StaffDetailsScreen" component={StaffDetailsScreen} />
    </Stack.Navigator>
  );
};

// --- Service Requests Stack ---
const ServiceRequestsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ServiceRequestsMain" component={ServiceRequestTabs} />
      <Stack.Screen 
        name="CategorySelection" 
        component={CategorySelectionScreen}
        options={{ 
          headerShown: false,
          presentation: 'card'
        }}
      />
      <Stack.Screen 
        name="subCategorySelection" 
        component={SubCategorySelectionScreen}
        options={{ 
          headerShown: false,
          presentation: 'card'
        }}
      />
      <Stack.Screen 
        name="complaintInput" 
        component={ComplaintInputScreen}
        options={{ 
          headerShown: false,
          presentation: 'card'
        }}
      />
    </Stack.Navigator>
  );
};

// --- Modern Custom Tab Bar with Sliding Animation ---
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const { nightMode } = usePermissions();
  
  const PRIMARY_COLOR = nightMode ? "#2A2A2Aee" : "#1996D3ee";
  const SECONDARY_COLOR = nightMode ? "#4A90E2" : "#FFFFFF";
  const ICON_COLOR_INACTIVE = nightMode ? "#B0B0B0" : "#E0E0E0";

  // Calculate tab width based on number of routes
  const totalTabs = state.routes.length;
  const containerPadding = 15; // 15px on each side
  const tabGap = 11 * (totalTabs - 1); // gap between tabs
  const availableWidth = width - 40 - containerPadding - tabGap; // total width minus margins and padding
  const tabWidth = availableWidth / totalTabs;

  // Animated value for sliding
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Calculate position including gaps
    const position = state.index * (tabWidth + 10) + 15; // 15 is paddingHorizontal start
    
    Animated.spring(translateX, {
      toValue: position,
      useNativeDriver: true,
      damping: 20,
      stiffness: 150,
      mass: 1,
    }).start();
  }, [state.index, tabWidth]);

  const getIconByRouteName = (routeName, color, isFocused) => {
    const iconSize = isFocused ? 18 : 24;
    
    switch (routeName) {
      case "Home":
        return <Feather name="home" size={iconSize} color={color} />;
      case "Service Requests":
        return <Ionicons name={isFocused ? "build" : "build-outline"} size={iconSize} color={color} />;
      case "Visitors":
        return <Ionicons name={isFocused ? "people" : "people-outline"} size={iconSize} color={color} />;
      case "More":
        return <Ionicons name={isFocused ? "menu" : "menu-outline"} size={iconSize} color={color} />;
      default:
        return <Ionicons name="ellipse-outline" size={iconSize} color={color} />;
    }
  };

  const getShortLabel = (label) => {
    if (label === "Service Requests") return "Requests";
    return label;
  };

  return (
    <View style={styles.bottomNavContainer}>
      <View style={[styles.bottomNavBar, { backgroundColor: PRIMARY_COLOR }]}>
        {/* Sliding White Background Indicator */}
        <Animated.View
          style={[
            styles.slidingIndicator,
            {
              width: tabWidth,
              backgroundColor: SECONDARY_COLOR,
              transform: [{ translateX }],
            },
          ]}
        />

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          
          const label = options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

          const shortLabel = getShortLabel(label);

          const onPress = () => {
            // Haptic feedback
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } catch (error) {
              // Haptics not available
            }

            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`${label} tab`}
              accessibilityState={{ selected: isFocused }}
              activeOpacity={0.7}
              style={[styles.tabItem, { width: tabWidth }]}
            >
              <View style={styles.tabContent}>
                {getIconByRouteName(
                  route.name,
                  isFocused ? PRIMARY_COLOR : ICON_COLOR_INACTIVE,
                  isFocused
                )}
                {isFocused && (
                  <Text
                    style={[styles.tabLabel, { color: PRIMARY_COLOR }]}
                    numberOfLines={1}
                  >
                    {shortLabel}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const NavigationTabs = () => {
  const { nightMode } = usePermissions();

  return (
    <SafeAreaView
      style={[
        { flex: 1 },
        nightMode ? { backgroundColor: '#1A1A1A' } : { backgroundColor: '#F8FAFC' },
      ]}
    >
      <Header />
      <Tab.Navigator
        tabBar={props => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen
          name="Home"
          component={HomeStack}
          options={{ tabBarIconName: 'home' }}
        />
        <Tab.Screen
          name="Service Requests"
          component={ServiceRequestsStack}
          options={{ tabBarIconName: 'build' }}
        />
        <Tab.Screen
          name="Visitors"
          component={VisitorsScreen}
          options={{ tabBarIconName: 'people' }}
        />
        <Tab.Screen
          name="More"
          component={MoreScreen}
          header={false}
          options={{ tabBarIconName: 'menu' }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

const NavigationPage = () => {
  const getUserDetails = async () => {
    await ismServices.getUserDetails();
  };

  useEffect(() => {
    getUserDetails();
  }, []);

  return (
    <PermissionsProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="MainApp" component={NavigationTabs} />
           <Stack.Screen name="AddVisitor" component={AddVisitor} />
        </Stack.Navigator>
      </NavigationContainer>
    </PermissionsProvider>
  );
};

// Styles
const styles = StyleSheet.create({
  bottomNavContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  bottomNavBar: {
    flexDirection: 'row',
    height: 65,
    borderRadius: 35,
    alignItems: 'center',
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 15,
    gap: 10,
  },
  slidingIndicator: {
    position: 'absolute',
    height: 43,
    borderRadius: 26,
  },
  tabItem: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 52,
    zIndex: 1,
  },
  tabContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

export default NavigationPage;