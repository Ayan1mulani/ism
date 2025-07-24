import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePermissions } from '../../Utils/ConetextApi';
import { Common } from '../../services/Common';

const { width } = Dimensions.get('window');

const ResidentHeader = () => {
  // Night mode toggle - change to false for light mode
  const {nightMode} = usePermissions();
  const [userDetails,setUserDetails]  = useState()
  const [userInfo,setUserInfo] = useState()
  const [societyInfo,setSocietyInfo]  = useState()
  // Theme colors
  const theme = {
    light: {
      safeAreaBackground: '#ffffff',
      headerBackground: '#ffffff',
      borderColor: '#f3f4f6',
      iconContainerBackground: '#dbeafe',
      homeIconColor: '#3b82f6',
      greetingTextColor: '#111827',
      locationTextColor: '#6b7280',
      chevronColor: '#6b7280',
      iconButtonColor: '#6b7280',
      statusDotColor: '#10b981',
      notificationBadgeColor: '#ef4444',
      statusBarStyle: 'dark-content',
      shadowColor: '#000',
    },
    dark: {
      safeAreaBackground: '#1f2937',
      headerBackground: '#1f2937',
      borderColor: '#374151',
      iconContainerBackground: '#374151',
      homeIconColor: '#60a5fa',
      greetingTextColor: '#f9fafb',
      locationTextColor: '#d1d5db',
      chevronColor: '#9ca3af',
      iconButtonColor: '#d1d5db',
      statusDotColor: '#34d399',
      notificationBadgeColor: '#f87171',
      statusBarStyle: 'light-content',
      shadowColor: '#000',
    },
  };

  const currentTheme = nightMode ? theme.dark : theme.light;
useEffect(()=>{
const getUserDetails = async() =>{
  const res = await Common.getUserDetails()
  setUserDetails(res)
}
const getUserInfo = async() =>{
  const res = await Common.getLoggedInUser()
  setUserInfo(res)
  const soc = JSON.parse(res.society.data)
  setSocietyInfo(soc)
}
getUserDetails()
getUserInfo()
},[])
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.safeAreaBackground }]}>
      <StatusBar 
        barStyle={currentTheme.statusBarStyle} 
        backgroundColor={currentTheme.safeAreaBackground} 
      />
      <View style={[
        styles.header,
        {
          backgroundColor: currentTheme.headerBackground,
          borderBottomColor: currentTheme.borderColor,
          shadowColor: currentTheme.shadowColor,
        }
      ]}>
        <View style={styles.leftSection}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: currentTheme.iconContainerBackground }
          ]}>
{societyInfo?.logo ? (
  <Image
    source={{ uri: societyInfo.logo }}
    style={styles.logoImage}
    resizeMode="contain"
  />
) : (
  <Ionicons name="person" size={20} color="#888" />
)}

          </View>
          <View style={styles.textContainer}>
            <Text style={[
              styles.greetingText,
              { color: currentTheme.greetingTextColor }
            ]}>
              Hello {userDetails?.name.split(' ')[0]}
            </Text>
            <View style={styles.locationContainer}>
              <View style={[
                styles.statusDot,
                { backgroundColor: currentTheme.statusDotColor }
              ]} />
              <Text style={[
                styles.locationText,
                { color: currentTheme.locationTextColor }
              ]}>
               {userDetails?.flat_no}
              </Text>
              <Ionicons name="chevron-down" size={12} color={currentTheme.chevronColor} />
            </View>
          </View>
        </View>
                
        <View style={styles.rightSection}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search" size={20} color={currentTheme.iconButtonColor} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications" size={20} color={currentTheme.iconButtonColor} />
            <View style={[
              styles.notificationBadge,
              { backgroundColor: currentTheme.notificationBadgeColor }
            ]} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    // backgroundColor handled by theme
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  logoImage: {
  width: 50,
  height: 40,
  borderColor: '#ccc',
  backgroundColor: '#fff',
},
  greetingText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  locationText: {
    fontSize: 14,
    marginRight: 4,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default ResidentHeader;