import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePermissions } from '../../../Utils/ConetextApi';
import { SafeAreaView } from 'react-native-safe-area-context';
import FlatSwitcherModal from './FlatSwitcherModal';
import { ismServices } from '../../../services/ismServices';
import { Common } from '../../../services/Common';


const ResidentHeader = () => {
  const { nightMode } = usePermissions();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userFlats, setUserFlats] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [userDetails,setUserDetails]  = useState()
  const [userInfo, setUserInfo] = useState(null);
const [societyInfo, setSocietyInfo] = useState(null);
  

  const theme = {
    light: {
      background: '#ffffff',
      text: '#111827',
      subText: '#6b7280',
      border: '#f3f4f6',
      statusBarStyle: 'dark-content',
    },
    dark: {
      background: '#1f2937',
      text: '#f9fafb',
      subText: '#9ca3af',
      border: '#374151',
      statusBarStyle: 'light-content',
    },
  };

  const currentTheme = nightMode ? theme.dark : theme.light;

  const toggleModal = () => setIsModalVisible(prev => !prev);

  const fetchAccounts = async () => {
    try {
      const payload = {
        identity: "sahilmulanioneplus@gmail.com",
        password: "123456",
        tenant: 0,
        user_id: null,
      };

      const response = await ismServices.loginUser(payload);

      if (response.status === "multipleLogin") {
        setUserFlats(response.data);
        setIsModalVisible(true);
      }

    } catch (error) {
      console.log("Switch error:", error);
    }
  };
useEffect(() => {

  const getUserDetails = async () => {
    const res = await Common.getUserDetails();
    setUserDetails(res);
  };

  const getUserInfo = async () => {
    const res = await Common.getLoggedInUser();
    setUserInfo(res);

    // society already object
    setSocietyInfo(res?.society);
  };

  getUserDetails();
  getUserInfo();

}, []);
  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: currentTheme.background }}>
      <StatusBar
        barStyle={currentTheme.statusBarStyle}
        backgroundColor={currentTheme.background}
      />

      <View style={[styles.header, { borderBottomColor: currentTheme.border }]}>
        <View style={styles.leftSection}>

          {/* Logo */}
          <View style={styles.iconContainer}>
            <Image
              source={{ uri: 'https://factech.ai/Final_Logo_white.png' }}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.textContainer}>
            <Text style={[styles.greetingText, { color: currentTheme.text }]}>
  {societyInfo?.name} 
            </Text>

            {/* Switch Account Button */}
            <TouchableOpacity
              style={styles.locationContainer}
              onPress={fetchAccounts}
              activeOpacity={0.7}
            >
              {/* <View style={styles.statusDot} /> */}
              <Text style={styles.locationText}>
              {userDetails?.flat_no || "Switch Account"}
              </Text>
              <Ionicons
                name="chevron-down"
                size={14}
                color={currentTheme.subText}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Right Icon */}
        <View style={styles.rightSection}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons
              name="notifications-outline"
              size={22}
              color={currentTheme.subText}
            />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal */}
      <FlatSwitcherModal
        visible={isModalVisible}
        flats={userFlats}
        selectedAccount={selectedAccount}
        onSelect={(account) => {
          setSelectedAccount(account);
        }}
        onClose={toggleModal}
      />
    </SafeAreaView>
  );
};

export default ResidentHeader;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: '#003366',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: '85%',
    height: '85%',
  },
  textContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: '700',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  locationText: {
    fontSize: 13,
    marginRight: 4,
  },
  rightSection: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1,
    borderColor: '#fff',
  },
});