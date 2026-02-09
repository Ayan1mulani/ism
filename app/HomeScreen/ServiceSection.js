import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePermissions } from '../../Utils/ConetextApi';
import { useNavigation } from '@react-navigation/native';

const { width: screenWidth } = Dimensions.get('window');

const ServicesSection = () => {
  const fadeAnims = useRef([]).current;
  const [selectedService, setSelectedService] = useState(null);
  const {nightMode} = usePermissions()
 const navigation = useNavigation()
  const services = [
    { id: '1', title: 'Accounts', icon: 'card' ,route:"Accounts" },
    { id: '2', title: 'Staff', icon: 'checkmark-circle-outline',  route:"StaffScreen" },
    { id: '3', title: 'Help Desk', icon: 'help-circle-outline' },
    { id: '4', title: 'Amenities', icon: 'fitness-outline' },
    { id: '5', title: 'Maintenance', icon: 'construct-outline' },
    { id: '6', title: 'Security', icon: 'shield-checkmark-outline' },
    { id: '7', title: 'Parking', icon: 'car-outline' },
    { id: '8', title: 'Complaints', icon: 'alert-circle-outline' },
    { id: '9', title: 'Events', icon: 'calendar-outline' },
    { id: '10', title: 'Vendors', icon: 'briefcase-outline' },
    { id: '11', title: 'Bills', icon: 'document-text-outline' },
    { id: '12', title: 'Contacts', icon: 'call-outline' },
  ];

  // Theme colors
  const theme = {
    light: {
      background: '#FFFFFF',
      titleColor: '#111827',
      titleIconColor: '#000000',
      cardGradient: {
        selected: ['#E0F2FE', '#B9E0FF'],
        unselected: ['#F7FBFF', '#FFFFFF'],
      },
      iconGradient: {
        selected: ['#074B7C', '#053A62'],
        unselected: ['#F0F9FF', '#E0F2FE'],
      },
      iconColor: {
        selected: '#FFFFFF',
        unselected: '#074B7C',
      },
      textColor: {
        selected: '#074B7C',
        unselected: '#374151',
      },
    },
    dark: {
      background: '#070707ff',
      titleColor: '#F9FAFB',
      titleIconColor: '#F9FAFB',
      cardGradient: {
        selected: ['#2985beff', '#58a7e9ff'],
        unselected: ['#1e242dff', '#2f343cff'],
      },
      iconGradient: {
        selected: ['#60bcfaff', '#3b9cf6ff'],
        unselected: ['#6B7280', '#9CA3AF'],
      },
      iconColor: {
        selected: '#FFFFFF',
        unselected: '#FFFFFF',
      },
      textColor: {
        selected: '#D1D5DB',
        unselected: '#D1D5DB',
      },
    },
  };

  const currentTheme = nightMode ? theme.dark : theme.light;

  useEffect(() => {
    fadeAnims.length = 0; // Clear the array
    services.forEach(() => {
      fadeAnims.push(new Animated.Value(0));
    });

    const animations = services.map((_, index) =>
      Animated.timing(fadeAnims[index], {
        toValue: 1,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
      })
    );

    Animated.stagger(50, animations).start();
  }, []);

  const renderServiceItem = (service, index) => {
    const fadeAnim = fadeAnims[index] || new Animated.Value(1);
    const isSelected = selectedService === service.id;

    // Define gradient colors based on selection state and theme
    const cardGradient = isSelected
      ? currentTheme.cardGradient.selected
      : currentTheme.cardGradient.unselected;

    const iconGradient = isSelected
      ? currentTheme.iconGradient.selected
      : currentTheme.iconGradient.unselected;

    const iconColor = isSelected
      ? currentTheme.iconColor.selected
      : currentTheme.iconColor.unselected;

    const textColor = isSelected
      ? currentTheme.textColor.selected
      : currentTheme.textColor.unselected;

      const serviceClick = (service) =>{
     navigation.navigate(service.route)
      }

    return (
      <Animated.View
        key={service.id}
        style={[styles.serviceItem, { opacity: fadeAnim }]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setSelectedService(serviceClick(service))}
        >
          <LinearGradient
            colors={cardGradient}
            style={styles.serviceCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <LinearGradient
              colors={iconGradient}
              style={styles.iconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons
                name={service.icon}
                size={24}
                color={iconColor}
              />
            </LinearGradient>
            <Text style={[styles.serviceTitle, { color: textColor }]}>
              {service.title}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={styles.header}>
        <View style={styles.inline}>
          <Ionicons name="construct" size={24} color={currentTheme.titleIconColor} />
          <Text style={[styles.title, { color: currentTheme.titleColor }]}>
            Service
          </Text>
        </View>
        
    
      </View>
      
      <View style={styles.servicesGrid}>
        {services.map((service, index) => renderServiceItem(service, index))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 8,
  },
  inline: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  themeToggle: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  toggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceItem: {
    width: (screenWidth - 48) / 4,
    marginBottom: 16,
  },
  serviceCard: {
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,

  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceTitle: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 12,
  },
});

export default ServicesSection;