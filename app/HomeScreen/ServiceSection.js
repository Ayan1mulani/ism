import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePermissions } from '../../Utils/ConetextApi';
import { useNavigation } from '@react-navigation/native';

const { width: screenWidth } = Dimensions.get('window');

const ServicesSection = () => {
  const [selectedService, setSelectedService] = useState(null);
  const { nightMode } = usePermissions();
  const navigation = useNavigation();

  // Full list of services
  const allServices = [
    { id: '1', title: 'Accounts', icon: 'card', route: 'Accounts' },
    { id: '2', title: 'Staff', icon: 'checkmark-circle-outline', route: 'StaffScreen' },
    { id: '3', title: 'Visitors', icon: 'people-outline', route: 'VisitorsScreen' },
    { id: '4', title: 'Amenities', icon: 'fitness-outline' },
    { id: '5', title: 'Maintenance', icon: 'construct-outline' },
    { id: '6', title: 'Security', icon: 'shield-checkmark-outline' },
    { id: '7', title: 'Parking', icon: 'car-outline' },
    { id: '8', title: 'Complaints', icon: 'alert-circle-outline' },
    { id: '9', title: 'Events', icon: 'calendar-outline' },
    { id: '10', title: 'Vendors', icon: 'briefcase-outline' },
    { id: '11', title: 'Bills', icon: 'document-text-outline' },
    { id: '12', title: 'Help Desk', icon: 'help-circle-outline' },
    // Removed the 13th item to ensure exactly 3 rows of 4 items.
  ];

  // Limit to exactly 12 items to guarantee only 3 rows (4 items per row)
  const displayedServices = allServices.slice(0, 12);

  // Simplified Theme
  const theme = {
    titleColor: nightMode ? '#F9FAFB' : '#111827',
    iconBgSelected: nightMode ? '#3B82F6' : '#E0F2FE', // Blue tint for selected
    iconBgUnselected: nightMode ? '#1F2937' : '#F3F4F6', // Light gray for unselected
    iconColorSelected: nightMode ? '#FFFFFF' : '#0284C7',
    iconColorUnselected: nightMode ? '#D1D5DB' : '#4B5563',
    textColor: nightMode ? '#D1D5DB' : '#374151',
  };

  const handleServicePress = (service) => {
    setSelectedService(service.id);
    if (service.route) {
      navigation.navigate(service.route);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="construct" size={20} color={theme.titleColor} />
          <Text style={[styles.title, { color: theme.titleColor }]}>
            Service
          </Text>
        </View>
      </View>
      
      {/* 3x4 Grid */}
      <View style={styles.servicesGrid}>
        {displayedServices.map((service) => {
          const isSelected = selectedService === service.id;

          return (
            <TouchableOpacity
              key={service.id}
              style={styles.serviceItem}
              activeOpacity={0.7}
              onPress={() => handleServicePress(service)}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: isSelected
                      ? theme.iconBgSelected
                      : theme.iconBgUnselected,
                  },
                ]}
              >
                <Ionicons
                  name={service.icon}
                  size={22}
                  color={
                    isSelected
                      ? theme.iconColorSelected
                      : theme.iconColorUnselected
                  }
                />
              </View>
              <Text
                style={[styles.serviceTitle, { color: theme.textColor }]}
                numberOfLines={1}
              >
                {service.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: 'transparent', // Matches the plain theme
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 4,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  serviceItem: {
    width: '25%', // 4 items per row exactly
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceTitle: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default ServicesSection;