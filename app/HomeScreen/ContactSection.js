import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePermissions } from '../../Utils/ConetextApi';

const importantContacts = [
  {
    id: '1',
    name: 'Emergency',
    phone: '911',
    image: 'https://img.icons8.com/color/96/000000/emergency.png',
  },
  {
    id: '2',
    name: 'Security',
    phone: '1001',
    image: 'https://img.icons8.com/color/96/000000/security-checked.png',
  },
  {
    id: '3',
    name: 'Helpdesk',
    phone: '2002',
    image: 'https://img.icons8.com/color/96/000000/help.png',
  },
  {
    id: '4',
    name: 'Secretary',
    phone: '3003',
    image: 'https://img.icons8.com/color/96/000000/administrator-male.png',
  },
];

export default function ImportantContacts() {
  // Night mode toggle - change to false for light mode
  const {nightMode} = usePermissions();
  
  // Theme colors
  const theme = {
    light: {
      containerBackground: 'rgba(255,255,255,0.9)',
      headerColor: '#074B7C',
      cardBackground: '#f9fafb',
      cardBorder: '#e5e7eb',
      imageWrapperBackground: '#ffffff',
      imageBorder: '#e0e0e0',
      nameColor: '#1f2937',
      phoneColor: '#6b7280',
      callButtonBackground: '#1996D3',
      callButtonIcon: '#ffffff',
    },
    dark: {
      containerBackground: 'rgba(3, 3, 3, 0.9)',
      headerColor: '#60A5FA',
      cardBackground: '#374151',
      cardBorder: '#4B5563',
      imageWrapperBackground: '#4B5563',
      imageBorder: '#6B7280',
      nameColor: '#F3F4F6',
      phoneColor: '#D1D5DB',
      callButtonBackground: '#3B82F6',
      callButtonIcon: '#ffffff',
    },
  };

  const currentTheme = nightMode ? theme.dark : theme.light;

  const handleCall = (phone) => {
    Linking.openURL(`tel:${phone}`).catch(() =>
      Alert.alert('Error', 'Unable to place call')
    );
  };

  const renderItem = ({ item }) => (
    <View style={[
      styles.card,
      {
        backgroundColor: currentTheme.cardBackground,
        borderColor: currentTheme.cardBorder,
      }
    ]}>
      <View style={[
        styles.imageWrapper,
        {
          backgroundColor: currentTheme.imageWrapperBackground,
          borderColor: currentTheme.imageBorder,
        }
      ]}>
        <Image source={{ uri: item.image }} style={styles.image} />
      </View>
      <View style={styles.infoContainer}>
        <Text style={[styles.name, { color: currentTheme.nameColor }]}>
          {item.name}
        </Text>
        <Text style={[styles.phone, { color: currentTheme.phoneColor }]}>
          {item.phone}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => handleCall(item.phone)}
        style={[
          styles.callButton,
          { backgroundColor: currentTheme.callButtonBackground }
        ]}
      >
        <Ionicons
          name="call-outline"
          size={18}
          color={currentTheme.callButtonIcon}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[
      styles.container,
      { backgroundColor: currentTheme.containerBackground }
    ]}>
      <Text style={[styles.header, { color: currentTheme.headerColor }]}>
        Important Contacts
      </Text>
      <FlatList
        data={importantContacts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 12,
    borderRadius: 12,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  imageWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
  },
  phone: {
    fontSize: 13,
    marginTop: 2,
  },
  callButton: {
    padding: 10,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
});