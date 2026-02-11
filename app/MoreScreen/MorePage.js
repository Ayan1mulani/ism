import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePermissions } from '../../Utils/ConetextApi';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const { nightMode, setNightMode } = usePermissions();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
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
          await AsyncStorage.removeItem('userInfo');
          await AsyncStorage.removeItem('userDetails');
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

  const SectionCard = ({ title, children }) => (
    <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
      <Text style={[styles.sectionTitle, { color: theme.textMain }]}>
        {title}
      </Text>
      {children}
    </View>
  );

  const ActionRow = ({ icon, title, onPress, danger }) => (
    <TouchableOpacity style={styles.actionRow} onPress={onPress}>
      <View style={styles.actionLeft}>
        <Ionicons
          name={icon}
          size={20}
          color={danger ? theme.danger : theme.textMain}
        />
        <Text
          style={[
            styles.actionText,
            { color: danger ? theme.danger : theme.textMain },
          ]}
        >
          {title}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={theme.textSub}
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.background, justifyContent: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  if (!userProfile) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={nightMode ? 'light-content' : 'dark-content'} />

      <ScrollView contentContainerStyle={{ padding: 16 ,
            paddingBottom: 120, 

      }}>

        {/* Profile Header */}
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

        {/* Unit Details */}
        <SectionCard title="Unit Details">
          <InfoRow label="Tower" value={userProfile.tower} />
          <InfoRow label="Flat No" value={userProfile.flat_no} />
          <InfoRow label="Area (Sq Ft)" value={userProfile.size_sf} />
          <InfoRow label="Category" value={userProfile.fc_name} />
        </SectionCard>

        {/* Owner Details */}
        {/* <SectionCard title="Owner Details">
          <InfoRow label="Owner Name" value={userProfile.name} />
          <InfoRow label="Phone" value={userProfile.phone_no} />
          <InfoRow label="Email" value={userProfile.email} />
        </SectionCard> */}

        {/* Meter Details */}
        <SectionCard title="Meter Details">
          <InfoRow label="Grid Meter No" value={userProfile.grid_meter_no} />
          <InfoRow label="DG Meter No" value={userProfile.dg_meter_no} />
          <InfoRow label="Gas Meter No" value={userProfile.gas_meter_no} />
        </SectionCard>

        {/* My Vehicles */}
        <SectionCard title="My Vehicles">
          <InfoRow label="Primary Vehicle" value={userProfile.vehicle_no} />
          <InfoRow label="Alternate Vehicle" value={userProfile.alt_vehicle_no} />
        </SectionCard>

        {/* Settings */}
        <SectionCard title="Settings">
          <ActionRow
            icon={nightMode ? 'sunny-outline' : 'moon-outline'}
            title={nightMode ? 'Light Mode' : 'Dark Mode'}
            onPress={() => setNightMode(prev => !prev)}
          />
          <ActionRow
            icon="swap-horizontal-outline"
            title="Switch Account"
            onPress={() => navigation.navigate('SwitchAccount')}
          />
          <ActionRow
            icon="log-out-outline"
            title="Logout"
            danger
            onPress={handleLogout}
          />
        </SectionCard>

      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
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

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },

  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  actionText: {
    fontSize: 15,
  },
});