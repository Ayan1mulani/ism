import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { usePermissions } from '../../Utils/ConetextApi';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Theme colors
const THEME_COLORS = {
  primaryAccent: '#1996D3',
  darkText: '#074B7C',
  inactiveText: '#6c757d',
  lightBackground: '#f4f7f9',
  componentBackground: '#ffffff',
  borderColor: '#e0e0e0',
  darkBackground: '#121212',
  darkComponentBackground: '#1e1e1e',
  darkBorderColor: '#333333',
  darkTextColor: '#ffffff',
  darkInactiveText: '#aaaaaa',
};

// --- Detail Card Component ---
const DetailCard = ({ title, data, icon, isExpanded, onToggle, nightMode, theme }) => {
  const styles = getStyles(theme, nightMode);
  
  return (
    <View style={[styles.detailCard, { backgroundColor: theme.componentBackground, borderColor: theme.borderColor }]}>
      <TouchableOpacity style={styles.detailHeader} onPress={onToggle}>
        <View style={styles.detailHeaderLeft}>
          <Ionicons name={icon} size={22} color={THEME_COLORS.primaryAccent} />
          <Text style={[styles.detailTitle, { color: theme.textColor }]}>{title}</Text>
        </View>
        <Ionicons 
          name={isExpanded ? 'chevron-up' : 'chevron-down'} 
          size={22} 
          color={THEME_COLORS.primaryAccent} 
        />
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={[styles.detailContent, { borderTopColor: theme.borderColor }]}>
          {data.map((item, index) => (
            <View key={index} style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.inactiveText }]}>{item.label}:</Text>
              <Text style={[styles.detailValue, { color: theme.textColor }]}>{item.value}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

// --- Reusable Accordion Item Component ---
const AccordionItem = ({ icon, title, nightMode, onPress, theme }) => {
  const styles = getStyles(theme, nightMode);
  
  return (
    <TouchableOpacity 
      style={[styles.listItem, nightMode && styles.listItemDark]} 
      onPress={onPress}
    >
      <Ionicons name={icon} size={22} color={THEME_COLORS.primaryAccent} />
      <Text style={[styles.listItemTitle, nightMode && styles.textLight]}>{title}</Text>
      <Ionicons
        name="chevron-forward-outline"
        size={20}
        color={nightMode ? '#AAAAAA' : '#999'}
      />
    </TouchableOpacity>
  );
};

// --- Main ProfileScreen Component ---
const ProfileScreen = () => {
  const { nightMode, setNightMode } = usePermissions();
  const [userDetails, setUserDetails] = useState(null);
  const [infoExpanded, setInfoExpanded] = useState(true);
  const [knowledgeExpanded, setKnowledgeExpanded] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  
  // Detail card expansion states
  const [personalExpanded, setPersonalExpanded] = useState(false);
  const [addressExpanded, setAddressExpanded] = useState(false);
  const [unitExpanded, setUnitExpanded] = useState(false);
  const [contactExpanded, setContactExpanded] = useState(false);
  
  const navigation = useNavigation();

  const theme = {
    backgroundColor: nightMode ? THEME_COLORS.darkBackground : THEME_COLORS.lightBackground,
    componentBackground: nightMode ? THEME_COLORS.darkComponentBackground : THEME_COLORS.componentBackground,
    borderColor: nightMode ? THEME_COLORS.darkBorderColor : THEME_COLORS.borderColor,
    textColor: nightMode ? THEME_COLORS.darkTextColor : THEME_COLORS.darkText,
    inactiveText: nightMode ? THEME_COLORS.darkInactiveText : THEME_COLORS.inactiveText,
  };

  const styles = getStyles(theme, nightMode);

  const toggleAccordion = (setter) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setter(prev => !prev);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userInfo');
              await AsyncStorage.removeItem('userDetails');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Error during logout:', error);
            }
          },
        },
      ]
    );
  };

  const getUserProfile = async () => {
    try {
      const response = await AsyncStorage.getItem('userDetails');
      if (response) {
        const userData = JSON.parse(response);
        setUserDetails(userData);
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
    }
  };

  useEffect(() => {
    getUserProfile();
  }, []);

  const getProfileImageSource = () => {
    if (userDetails?.image_src) {
      return { uri: userDetails.image_src };
    }
    return { uri: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userDetails?.name || 'User') + '&background=1996D3&color=fff&size=400' };
  };

  const formatUnitDisplay = () => {
    if (!userDetails) return '';
    const tower = userDetails.tower || '';
    const unit = userDetails.display_unit_no || userDetails.flat_no || '';
    const block = userDetails.block || '';
    
    if (tower && unit) {
      return `${tower} - Unit ${unit}`;
    } else if (block && unit) {
      return `${block} - Unit ${unit}`;
    } else if (unit) {
      return `Unit ${unit}`;
    }
    return 'Unit information not available';
  };

  // Prepare data for detail cards
  const getPersonalData = () => [
    { label: 'Full Name', value: userDetails?.name || 'N/A' },
    { label: 'Salutation', value: userDetails?.salutation || 'N/A' },
    { label: 'User ID', value: userDetails?.user_id || 'N/A' },
    { label: 'Account Status', value: userDetails?.activated === 1 ? 'Active' : 'Inactive' },
  ];

  const getContactData = () => [
    { label: 'Phone Number', value: userDetails?.phone_no || 'N/A' },
    { label: 'Email Address', value: userDetails?.email || 'N/A' },
    { label: 'Alt Phone', value: userDetails?.alt_phone_no || 'N/A' },
    { label: 'Alt Email', value: userDetails?.alt_email || 'N/A' },
  ];

  const getAddressData = () => [
    { label: 'Tower', value: userDetails?.tower || 'N/A' },
    { label: 'Block', value: userDetails?.block || 'N/A' },
    { label: 'Flat Number', value: userDetails?.flat_no || 'N/A' },
    { label: 'Display Unit', value: userDetails?.display_unit_no || 'N/A' },
    { label: 'Address', value: userDetails?.address || 'N/A' },
  ];

  const getUnitData = () => [
    { label: 'Flat Category', value: userDetails?.fc_name || 'N/A' },
    { label: 'Size (sq ft)', value: userDetails?.size_sf || 'N/A' },
    { label: 'Tenant Status', value: userDetails?.tenant ? 'Yes' : 'No' },
    { label: 'Vacant Status', value: userDetails?.is_vacant ? 'Yes' : 'No' },
    { label: 'Parking Slots', value: userDetails?.no_of_parking || 'N/A' },
    { label: 'Parking Number', value: userDetails?.parking_no || 'N/A' },
    { label: 'Vehicle Number', value: userDetails?.vehicle_no || 'N/A' },
  ];

  if (!userDetails) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
        <StatusBar
          barStyle={nightMode ? 'light-content' : 'dark-content'}
          backgroundColor={theme.backgroundColor}
        />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.textColor }]}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Full Profile Image Card with Blur Background */}
        <View style={styles.profileImageCard}>
          <ImageBackground
            source={getProfileImageSource()}
            style={styles.backgroundImage}
            blurRadius={20}
          >
            <BlurView intensity={80} tint={nightMode ? 'dark' : 'light'} style={styles.blurOverlay}>
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                  <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Profile</Text>
                <TouchableOpacity onPress={() => setNightMode(prev => !prev)} style={styles.headerButton}>
                  <Ionicons name={nightMode ? 'sunny-outline' : 'moon-outline'} size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Profile Content */}
              <View style={styles.profileContent}>
                <View style={styles.profileImageContainer}>
                  <Image
                    source={getProfileImageSource()}
                    style={styles.profileImage}
                  />
                  {userDetails.activated === 1 && (
                    <View style={styles.verificationBadge}>
                      <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
                    </View>
                  )}
                </View>
                
                <Text style={styles.userName}>
                  {userDetails.salutation} {userDetails.name}
                </Text>
                
                <Text style={styles.userLocation}>
                  <Ionicons name="location-sharp" size={16} color="#FFFFFF" />
                  {'  '}{formatUnitDisplay()}
                </Text>

                {userDetails.fc_name && (
                  <View style={styles.unitTypeBadge}>
                    <Text style={styles.unitTypeText}>{userDetails.fc_name}</Text>
                  </View>
                )}
              </View>
            </BlurView>
          </ImageBackground>
        </View>

        {/* Detail Cards */}
        <View style={styles.detailCardsContainer}>
          <DetailCard
            title="Personal Information"
            data={getPersonalData()}
            icon="person-outline"
            isExpanded={personalExpanded}
            onToggle={() => toggleAccordion(setPersonalExpanded)}
            nightMode={nightMode}
            theme={theme}
          />

          <DetailCard
            title="Contact Information"
            data={getContactData()}
            icon="call-outline"
            isExpanded={contactExpanded}
            onToggle={() => toggleAccordion(setContactExpanded)}
            nightMode={nightMode}
            theme={theme}
          />

          <DetailCard
            title="Address Details"
            data={getAddressData()}
            icon="location-outline"
            isExpanded={addressExpanded}
            onToggle={() => toggleAccordion(setAddressExpanded)}
            nightMode={nightMode}
            theme={theme}
          />

          <DetailCard
            title="Unit Details"
            data={getUnitData()}
            icon="business-outline"
            isExpanded={unitExpanded}
            onToggle={() => toggleAccordion(setUnitExpanded)}
            nightMode={nightMode}
            theme={theme}
          />
        </View>

        {/* Knowledge Centre */}
        <View style={[styles.card, { backgroundColor: theme.componentBackground, borderColor: theme.borderColor }]}>
          <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleAccordion(setKnowledgeExpanded)}>
            <Text style={[styles.accordionTitle, { color: theme.textColor }]}>
              Knowledge Centre
            </Text>
            <Ionicons name={knowledgeExpanded ? 'chevron-up' : 'chevron-down'} size={22} color={THEME_COLORS.primaryAccent} />
          </TouchableOpacity>
          {knowledgeExpanded && (
            <View>
              <AccordionItem 
                icon="book-outline" 
                title="Community Rules" 
                nightMode={nightMode} 
                theme={theme}
                onPress={() => Alert.alert('Community Rules', 'Feature coming soon')}
              />
              <AccordionItem 
                icon="help-circle-outline" 
                title="FAQs" 
                nightMode={nightMode} 
                theme={theme}
                onPress={() => Alert.alert('FAQs', 'Feature coming soon')}
              />
            </View>
          )}
        </View>

        {/* App Settings */}
        <View style={[styles.card, { backgroundColor: theme.componentBackground, borderColor: theme.borderColor }]}>
          <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleAccordion(setSettingsExpanded)}>
            <Text style={[styles.accordionTitle, { color: theme.textColor }]}>
              App Settings
            </Text>
            <Ionicons name={settingsExpanded ? 'chevron-up' : 'chevron-down'} size={22} color={THEME_COLORS.primaryAccent} />
          </TouchableOpacity>
          {settingsExpanded && (
            <View>
              <AccordionItem 
                icon="notifications-outline" 
                title="Notifications" 
                nightMode={nightMode} 
                theme={theme}
                onPress={() => Alert.alert('Notifications', 'Feature coming soon')}
              />
              <AccordionItem 
                icon="lock-closed-outline" 
                title="Privacy" 
                nightMode={nightMode} 
                theme={theme}
                onPress={() => Alert.alert('Privacy', 'Feature coming soon')}
              />
              <TouchableOpacity
                style={[styles.toggleItem, { borderTopColor: theme.borderColor }]}
                onPress={() => setNightMode(prev => !prev)}
              >
                <Ionicons name={nightMode ? 'moon' : 'sunny'} size={20} color={THEME_COLORS.primaryAccent} />
                <Text style={[styles.listItemTitle, { color: THEME_COLORS.primaryAccent }]}>
                  {nightMode ? 'Switch to Light Mode' : 'Switch to Night Mode'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Support Card */}
        <View style={[styles.card, { backgroundColor: theme.componentBackground, borderColor: theme.borderColor }, styles.supportCard]}>
          <View style={styles.supportTextContainer}>
            <Ionicons name="help-buoy-outline" size={24} color={THEME_COLORS.primaryAccent} />
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.accordionTitle, { color: theme.textColor }]}>Need Help?</Text>
              <Text style={[styles.supportSubtitle, { color: theme.inactiveText }]}>
                We're here to assist you!
              </Text>
            </View>
          </View>
          <TouchableOpacity>
            <Ionicons name="arrow-forward-circle" size={28} color={THEME_COLORS.primaryAccent} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <View style={[styles.card, styles.logoutCard]}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={22} color="#D32F2F" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme, nightMode) => StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 70,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  profileImageCard: {
    height: 400,
    marginBottom: 16,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
  },
  blurOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  verificationBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  userLocation: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  unitTypeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backdropFilter: 'blur(10px)',
  },
  unitTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  detailCardsContainer: {
    paddingHorizontal: 16,
  },
  detailCard: {
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: nightMode ? 0.3 : 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
  },
  detailHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  detailContent: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderTopWidth: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    flex: 1.5,
    textAlign: 'right',
    fontWeight: '600',
  },
  card: {
    borderRadius: 15,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: nightMode ? 0.3 : 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    alignItems: 'center',
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#EDEDED',
  },
  listItemDark: {
    borderTopColor: '#333',
  },
  listItemTitle: {
    flex: 1,
    fontSize: 15,
    marginLeft: 12,
    color: '#444',
  },
  textLight: {
    color: '#f5f5f5',
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  supportCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  supportTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supportSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  logoutCard: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FFD6D6',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#D32F2F',
  },
});

export default ProfileScreen;
