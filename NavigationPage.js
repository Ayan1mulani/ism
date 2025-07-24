import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './app/HomeScreen/HomeScreen';
import ServiceRequestScreen from './app/ServiceRequestScreen/ServiceRequestPage';
import VisitorsScreen from './app/HomeScreen/HomeScreen'; // Check if you want to change Visitors screen import
import ProfileScreen from './app/HomeScreen/HomeScreen';
import Header from './app/Header/Header';
import LoginScreen from './app/Login/Login';
import MoreScreen from './app/MoreScreen/MorePage';
import { PermissionsProvider, usePermissions } from './Utils/ConetextApi';
import { ismServices } from './services/ismServices';
import ServiceRequestTabs from './app/ServiceRequestScreen/ServiceHeader';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const { width } = Dimensions.get('window');

// --- Home Stack ---
const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      {/* Add other child screens for Home tab here */}
      {/* <Stack.Screen name="HomeDetail" component={HomeDetailScreen} /> */}
    </Stack.Navigator>
  );
};

// --- Service Requests Stack ---
const ServiceRequestsStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ServiceRequestsMain" component={ServiceRequestTabs} />
      {/* Add other child screens for Service Requests tab here */}
      {/* <Stack.Screen name="RequestDetail" component={RequestDetailScreen} /> */}
    </Stack.Navigator>
  );
};

// --- Custom Tab Bar ---
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const tabWidth = (width - 40) / state.routes.length;
  const translateX = useRef(new Animated.Value(0)).current;
  const { nightMode } = usePermissions();

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: state.index * tabWidth,
      stiffness: 120,
      damping: 18,
      mass: 1,
      useNativeDriver: true,
    }).start();
  }, [state.index]);

  return (
    <View style={styles.bottomNavContainer}>
      <View style={[styles.bottomNavBar, nightMode && styles.bottomNavBarDark]}>
        <Animated.View
          style={[
            styles.activeTabIndicator,
            { width: tabWidth, transform: [{ translateX }] },
          ]}
        >
          <View
            style={[
              styles.activeTabIndicatorCircle,
              nightMode && styles.activeTabIndicatorCircleDark,
            ]}
          />
        </Animated.View>

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const iconName = options.tabBarIconName;

          const onPress = () => {
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
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isFocused ? iconName : `${iconName}-outline`}
                size={26}
                color={isFocused ? '#FFFFFF' : nightMode ? '#fcfcfcff' : '#f7f7f7ff'}
              />
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
          options={{ tabBarIconName: 'menu' }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

const NavigationPage = () => {
  const getUserDetails = async () => {
    await ismServices.getUserDetails();
    const rr = await AsyncStorage.getItem('userDetails');
    console.log('User Details from AsyncStorage:', JSON.parse(rr));
  };

  useEffect(() => {
    console.log('called get user details');
    getUserDetails();
  }, []);

  return (
    <PermissionsProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="MainApp" component={NavigationTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </PermissionsProvider>
  );
};

// Styles
const styles = StyleSheet.create({
  bottomNavContainer: {
    position: 'absolute',
    bottom: 5,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  bottomNavBar: {
    flexDirection: 'row',
    backgroundColor: '#1996D3',
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  bottomNavBarDark: {
    backgroundColor: '#2A2A2A',
    shadowColor: '#000',
    shadowOpacity: 0.3,
  },
  activeTabIndicator: {
    position: 'absolute',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabIndicatorCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#074B7C',
  },
  activeTabIndicatorCircleDark: {
    backgroundColor: '#4A90E2',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    zIndex: 1,
  },
});

export default NavigationPage;
