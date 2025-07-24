import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePermissions } from '../../Utils/ConetextApi';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Reusable Accordion Item Component ---
const AccordionItem = ({ icon, title, nightMode }) => (
  <TouchableOpacity style={[styles.listItem, nightMode && styles.listItemDark]}>
    <Ionicons name={icon} size={22} color={nightMode ? '#90CAF9' : '#1976D2'} />
    <Text style={[styles.listItemTitle, nightMode && styles.textLight]}>{title}</Text>
    <Ionicons
      name="chevron-forward-outline"
      size={20}
      color={nightMode ? '#AAAAAA' : '#999'}
    />
  </TouchableOpacity>
);

// --- Main ProfileScreen Component ---
const ProfileScreen = () => {
  const { nightMode, setNightMode } = usePermissions();

  const [infoExpanded, setInfoExpanded] = useState(true);
  const [knowledgeExpanded, setKnowledgeExpanded] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
const navigation = useNavigation();
  const toggleAccordion = (setter) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setter(prev => !prev);
  };


const handleLogout = async () => {
  try {
    await AsyncStorage.removeItem('userInfo');
        await AsyncStorage.removeItem('userDetails');


    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }], // Make sure 'Login' matches your route name
    });
  } catch (error) {
    console.error('Error during logout:', error);
  }
};


  return (
    <SafeAreaView style={[styles.container, nightMode && styles.containerDark]}>
      <StatusBar
        barStyle={nightMode ? 'light-content' : 'dark-content'}
        backgroundColor={nightMode ? '#121212' : '#FFFFFF'}
      />

      {/* Header */}
      <View style={[styles.header, nightMode && styles.headerDark]}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={26} color={nightMode ? '#fff' : '#333'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, nightMode && styles.textLight]}>My Profile</Text>
        <TouchableOpacity onPress={() => setNightMode(prev => !prev)}>
          <Ionicons name={nightMode ? 'sunny-outline' : 'moon-outline'} size={24} color="#1976D2" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Profile Card */}
        <View style={[styles.card, nightMode && styles.cardDark, styles.profileCard]}>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
            style={styles.avatar}
          />
          <Text style={[styles.userName, nightMode && styles.textLight]}>John Smith</Text>
          <Text style={[styles.userId, nightMode && styles.textMuted]}>User ID: RES8C019</Text>
          <View style={styles.userLocation}>
            <Ionicons name="location-sharp" size={14} color="#888" />
            <Text style={[styles.locationText, nightMode && styles.textMuted]}>
              Tower A - Unit 304
            </Text>
          </View>
        </View>

        {/* Profile Information */}
        <View style={[styles.card, nightMode && styles.cardDark]}>
          <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleAccordion(setInfoExpanded)}>
            <Text style={[styles.accordionTitle, nightMode && styles.textLight]}>
              Profile Information
            </Text>
            <Ionicons name={infoExpanded ? 'chevron-up' : 'chevron-down'} size={22} color="#1976D2" />
          </TouchableOpacity>
          {infoExpanded && (
            <View>
              <AccordionItem icon="person-outline" title="Personal Details" nightMode={nightMode} />
              <AccordionItem icon="location-outline" title="Address" nightMode={nightMode} />
              <AccordionItem icon="shield-outline" title="Emergency Info" nightMode={nightMode} />
              <AccordionItem icon="business-outline" title="Unit Details" nightMode={nightMode} />
              <AccordionItem icon="card-outline" title="Payment Methods" nightMode={nightMode} />
              <AccordionItem icon="document-attach-outline" title="Documents" nightMode={nightMode} />
            </View>
          )}
        </View>

        {/* Knowledge Centre */}
        <View style={[styles.card, nightMode && styles.cardDark]}>
          <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleAccordion(setKnowledgeExpanded)}>
            <Text style={[styles.accordionTitle, nightMode && styles.textLight]}>
              Knowledge Centre
            </Text>
            <Ionicons name={knowledgeExpanded ? 'chevron-up' : 'chevron-down'} size={22} color="#1976D2" />
          </TouchableOpacity>
          {knowledgeExpanded && (
            <View>
              <AccordionItem icon="book-outline" title="Community Rules" nightMode={nightMode} />
              <AccordionItem icon="help-circle-outline" title="FAQs" nightMode={nightMode} />
            </View>
          )}
        </View>

        {/* App Settings */}
        <View style={[styles.card, nightMode && styles.cardDark]}>
          <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleAccordion(setSettingsExpanded)}>
            <Text style={[styles.accordionTitle, nightMode && styles.textLight]}>
              App Settings
            </Text>
            <Ionicons name={settingsExpanded ? 'chevron-up' : 'chevron-down'} size={22} color="#1976D2" />
          </TouchableOpacity>
          {settingsExpanded && (
            <View>
              <AccordionItem icon="notifications-outline" title="Notifications" nightMode={nightMode} />
              <AccordionItem icon="lock-closed-outline" title="Privacy" nightMode={nightMode} />
              <AccordionItem icon="color-palette-outline" title="Theme" nightMode={nightMode} />
              <TouchableOpacity
                style={styles.toggleItem}
                onPress={() => setNightMode(prev => !prev)}
              >
                <Ionicons name={nightMode ? 'moon' : 'sunny'} size={20} color="#1976D2" />
                <Text style={[styles.listItemTitle, { color: '#1976D2' }]}>
                  {nightMode ? 'Switch to Light Mode' : 'Switch to Night Mode'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Support Card */}
        <View style={[styles.card, nightMode && styles.cardDark, styles.supportCard]}>
          <View style={styles.supportTextContainer}>
            <Ionicons name="help-buoy-outline" size={24} color="#1976D2" />
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.accordionTitle, nightMode && styles.textLight]}>Need Help?</Text>
              <Text style={[styles.supportSubtitle, nightMode && styles.textMuted]}>
                We're here to assist you!
              </Text>
            </View>
          </View>
          <TouchableOpacity>
            <Ionicons name="arrow-forward-circle" size={28} color="#1976D2" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom:70,
    backgroundColor: '#F3F4F6',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  headerDark: {
    backgroundColor: '#1E1E1E',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: '#1E1E1E',
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#1976D2',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    color: '#222',
  },
  userId: {
    fontSize: 14,
    marginTop: 4,
    color: '#777',
  },
  textLight: {
    color: '#f5f5f5',
  },
  textMuted: {
    color: '#888',
  },
  userLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: 14,
    marginLeft: 4,
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
    color: '#333',
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
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
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
    color: '#666',
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
