import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePermissions } from '../../Utils/ConetextApi';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const { nightMode, setNightMode } = usePermissions();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dropdown States
  const [unitOpen, setUnitOpen] = useState(true); // 👈 Open by default
  const [meterOpen, setMeterOpen] = useState(false);
  const [vehicleOpen, setVehicleOpen] = useState(false);

  const navigation = useNavigation();

  const theme = {
    background: nightMode ? '#111827' : '#FFFFFF',
    textMain: nightMode ? '#F9FAFB' : '#111827',
    textSub: nightMode ? '#9CA3AF' : '#6B7280',
    divider: nightMode ? '#374151' : '#E5E7EB',
    cardBg: nightMode ? '#1F2937' : '#F9FAFB',
    danger: '#EF4444',
    primary: '#3B82F6',
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const data = await AsyncStorage.getItem('userDetails');
      if (data) setUserProfile(JSON.parse(data));
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.clear();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        },
      },
    ]);
  };

  const getAvatarUri = () => {
    if (userProfile?.image_src) return { uri: userProfile.image_src };
    const name = encodeURIComponent(userProfile?.name || 'User');
    return {
      uri: `https://ui-avatars.com/api/?name=${name}&background=3B82F6&color=fff&size=200`,
    };
  };

  const InfoRow = ({ label, value }) => (
    <View style={[styles.infoRow, { borderBottomColor: theme.divider }]}>
      <Text style={[styles.infoLabel, { color: theme.textSub }]}>
        {label}
      </Text>
      <Text style={[styles.infoValue, { color: theme.textMain }]}>
        {value || 'N/A'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!userProfile) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>

        {/* PROFILE HEADER */}
        <View style={[styles.profileCard, { backgroundColor: theme.cardBg }]}>
          <Image source={getAvatarUri()} style={styles.avatar} />
          <View style={{ marginLeft: 14, flex: 1 }}>
            <Text style={[styles.userName, { color: theme.textMain }]}>
              {userProfile.name}
            </Text>
            <Text style={[styles.userSub, { color: theme.textSub }]}>
              {userProfile.phone_no}
            </Text>
            <Text style={[styles.userSub, { color: theme.textSub }]}>
              {userProfile.email}
            </Text>
          </View>
        </View>

        {/* UNIT DETAILS (OPEN BY DEFAULT) */}
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <TouchableOpacity
            style={styles.dropdownHeader}
            onPress={() => setUnitOpen(prev => !prev)}
          >
            <Text style={[styles.sectionTitle, { color: theme.textMain }]}>
              Unit Details
            </Text>
            <Ionicons
              name={unitOpen ? 'chevron-up-outline' : 'chevron-down-outline'}
              size={20}
              color={theme.textSub}
            />
          </TouchableOpacity>

          {unitOpen && (
            <View style={styles.dropdownContent}>
              <InfoRow label="Tower" value={userProfile.tower} />
              <InfoRow label="Flat No" value={userProfile.flat_no} />
              <InfoRow label="Area (Sq Ft)" value={userProfile.size_sf} />
              <InfoRow label="Category" value={userProfile.fc_name} />
            </View>
          )}
        </View>

        {/* METER DETAILS */}
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <TouchableOpacity
            style={styles.dropdownHeader}
            onPress={() => setMeterOpen(prev => !prev)}
          >
            <Text style={[styles.sectionTitle, { color: theme.textMain }]}>
              Meter Details
            </Text>
            <Ionicons
              name={meterOpen ? 'chevron-up-outline' : 'chevron-down-outline'}
              size={20}
              color={theme.textSub}
            />
          </TouchableOpacity>

          {meterOpen && (
            <View style={styles.dropdownContent}>
              <InfoRow label="Grid Meter No" value={userProfile.grid_meter_no} />
              <InfoRow label="DG Meter No" value={userProfile.dg_meter_no} />
              <InfoRow label="Gas Meter No" value={userProfile.gas_meter_no} />
            </View>
          )}
        </View>

        {/* MY VEHICLES */}
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <TouchableOpacity
            style={styles.dropdownHeader}
            onPress={() => setVehicleOpen(prev => !prev)}
          >
            <Text style={[styles.sectionTitle, { color: theme.textMain }]}>
              My Vehicles
            </Text>
            <Ionicons
              name={vehicleOpen ? 'chevron-up-outline' : 'chevron-down-outline'}
              size={20}
              color={theme.textSub}
            />
          </TouchableOpacity>

          {vehicleOpen && (
            <View style={styles.dropdownContent}>
              <InfoRow label="Primary Vehicle" value={userProfile.vehicle_no} />
              <InfoRow label="Alternate Vehicle" value={userProfile.alt_vehicle_no} />
            </View>
          )}
        </View>

        {/* SETTINGS */}
        <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.sectionTitle, { color: theme.textMain }]}>
            Settings
          </Text>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => setNightMode(prev => !prev)}
          >
            <Ionicons
              name={nightMode ? 'sunny-outline' : 'moon-outline'}
              size={20}
              color={theme.textMain}
            />
            <Text style={[styles.actionText, { color: theme.textMain }]}>
              {nightMode ? 'Light Mode' : 'Dark Mode'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigation.navigate('SwitchAccount')}
          >
            <Ionicons name="swap-horizontal-outline" size={20} color={theme.textMain} />
            <Text style={[styles.actionText, { color: theme.textMain }]}>
              Switch Account
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color={theme.danger} />
            <Text style={[styles.actionText, { color: theme.danger }]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },

  userName: {
    fontSize: 18,
    fontWeight: '700',
  },

  userSub: {
    fontSize: 13,
    marginTop: 4,
  },

  card: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    elevation: 0.2,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },

  infoLabel: {
    fontSize: 14,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },

  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  dropdownContent: {
    marginTop: 10,
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
  },

  actionText: {
    fontSize: 15,
    marginLeft: 10,
  },
});