import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {usePermissions}  from "../../Utils/ConetextApi"
import { Common } from '../../services/Common';
import { ismServices } from '../../services/ismServices';
const ResidentProfile = () => {
  const { nightMode } = usePermissions();
  const [userInfo, setUserInfo] = useState({});
  const [userDetails,setUserDetails]  = useState()
  const [bill,setBill]  = useState()
  const colors = {
    background: nightMode ? 'rgba(9, 9, 10, 0.9)' : '#ffffff',
    card: nightMode ? '#1e293b' : '#ffffff',
    text: nightMode ? '#f1f5f9' : '#1e293b',
    subText: nightMode ? '#cbd5e1' : '#64748B',
    primary: '#0EA5E9',
    highlight: '#1996D3',
    online: '#10b981',
    border: nightMode ? '#334155' : '#E2E8F0',
    badgeBuilding: '#ff6b6b',
    badgeUnit: '#4ecdc4',
    badgeMember: '#45b7d1',
  };

      const getUserInfo = async () => {
      try {
        const user = await AsyncStorage.getItem('userInfo');
        if (user) {
          const userInfoParsed = JSON.parse(user);
          setUserInfo(userInfoParsed);
        }

        const details = await Common.getUserDetails();
        if (details) {
          setUserDetails(details);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

   const getMyBalance = async () => {
      try {
        const response = await ismServices.getMyBalance();
        setBill(response.data)
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };




useEffect(() => {


    getUserInfo();
    getMyBalance();
  }, []);





  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <LinearGradient
            colors={['#1996D3', '#0EA5E9', '#0284C7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 2, y: 2 }}
            style={styles.profileGradient}
          >
            <Text style={styles.greeting}>Hi {userInfo?.name || 'Resident'}</Text>

            <View style={styles.profileRow}>
              <View style={styles.profileImageContainer}>
                {/* Layered card look */}
                <View style={styles.layeredCards}>
                  <View style={[styles.cardLayer, styles.cardLayer1, { backgroundColor: colors.badgeBuilding }]} />
                  <View style={[styles.cardLayer, styles.cardLayer2, { backgroundColor: colors.badgeUnit }]} />
                  <View style={[styles.cardLayer, styles.cardLayer3, { backgroundColor: colors.badgeMember }]} />
                </View>
                <Image
                  source={
                  { uri: userDetails?.image_src ? userDetails?.image_src :null}
                  }
                  style={styles.profileImage}
                />
                <View style={[styles.onlineIndicator, { backgroundColor: colors.online }]} />
              </View>

              <View style={styles.profileDetails}>
                <View style={[styles.detailBadge, { backgroundColor: 'rgba(255,107,107,0.2)' }]}>
                  <Ionicons name="business" size={12} color="#fff" />
                  <Text style={styles.detailText}>{userDetails?.tower}</Text>
                </View>
                <View style={[styles.detailBadge, { backgroundColor: 'rgba(78,205,196,0.2)' }]}>
                  <Ionicons name="home" size={12} color="#fff" />
                  <Text style={styles.detailText}>{userDetails?.flat_no}</Text>
                </View>
                <View style={[styles.detailBadge, { backgroundColor: 'rgba(69,183,209,0.2)' }]}>
                  <Ionicons name="calendar" size={12} color="#fff" />
                  <Text style={styles.detailText}>{userDetails?.fc_name}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Rent Section */}
        <View style={[styles.rentSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.rentContent}>
            <Text style={[styles.rentLabel, { color: colors.subText }]}>Bill Type {bill?.bill_type}</Text>
            <Text style={[styles.rentAmount, { color: colors.text }]}>₹{bill?.balance}</Text>

            <TouchableOpacity style={[styles.payButton, { backgroundColor: colors.primary }]}>
              <Text style={styles.payButtonText}>Pay Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    height: Platform.OS === 'ios' ? 140 : 120,
  },
  container: {
    flexDirection: 'row',
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  profileSection: {
    flex: 2,
    borderRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },
  profileGradient: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    marginRight: 12,
    position: 'relative',
  },
  layeredCards: {
    position: 'relative',
    width: 52,
    height: 52,
  },
  cardLayer: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 8,
    elevation: 2,
  },
  cardLayer1: { top: 6, left: 6 },
  cardLayer2: { top: 3, left: 3 },
  cardLayer3: { top: 0, left: 0 },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
    position: 'absolute',
    top: 2,
    left: 2,
    zIndex: 10,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 11,
  },
  profileDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  detailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#ffffff',
    marginLeft: 6,
    fontWeight: '500',
  },
  rentSection: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  rentContent: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    flex: 1,
    paddingLeft: 12,
    paddingRight: 10,
    paddingTop: 8,
  },
  rentLabel: {
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 4,
    marginTop: 8,
  },
  rentAmount: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  payButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    width: '100%',
  },
  payButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
});

export default ResidentProfile;
