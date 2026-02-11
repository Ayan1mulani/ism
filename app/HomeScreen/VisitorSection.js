import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePermissions } from '../../Utils/ConetextApi';
import { visitorServices } from '../../services/visitorServices';

const VisitorSection = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { nightMode } = usePermissions();

  useEffect(() => {
    const getMyVisitors = async () => {
      try {
        setLoading(true);
        const response = await visitorServices.getMyVisitors();

        if (response?.data?.visits && Array.isArray(response.data.visits)) {
          const visitsData = response.data.visits;
          const mappedVisitors = visitsData.map(visit => ({
            id: visit.id?.toString() || Math.random().toString(),
            name: visit.name || visit.visitor_data?.name || 'Unknown',
            role: visit.purpose || 'Visitor',
            avatar: visit.image || visit.visitor_data?.image || 'https://via.placeholder.com/60',
          }));
          setVisitors(mappedVisitors);
        } else {
          setVisitors([]);
        }
      } catch (error) {
        console.error('Error fetching visitors:', error);
        setVisitors([]);
      } finally {
        setLoading(false);
      }
    };

    getMyVisitors();
  }, []);

  const getRoleColor = (role) => {
    const roleLower = role?.toLowerCase() || '';
    switch (roleLower) {
      case 'guest': return '#9C27B0';
      case 'zomato': return '#FF6B6B';
      case 'swiggy': return '#FF8C00';
      case 'ola': return '#00C853';
      case 'employee': return '#1976D2';
      case 'delivery': return '#FF8C00';
      default: return '#9C27B0';
    }
  };

  // Plain theme matching your transparent setup
  const theme = {
    background: nightMode ? '#111827' : '#FFFFFF',
    textMain: nightMode ? '#F9FAFB' : '#111827',
    textSub: nightMode ? '#9CA3AF' : '#6B7280',
    divider: nightMode ? '#374151' : '#F3F4F6',
    iconBtnBg: nightMode ? '#374151' : '#F9FAFB',
    ringColor: nightMode ? '#374151' : '#E5E7EB',
  };

  if (loading) {
    return (
      <View style={[styles.container, { minHeight: 80, justifyContent: 'center' }]}>
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="people" size={20} color={theme.textMain} />
          <Text style={[styles.title, { color: theme.textMain }]}>Your Visitors</Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.iconBtnBg }]}
          onPress={() => console.log('Add visitor clicked')}
        >
          <Ionicons name="add" size={28}color={theme.textMain} />
        </TouchableOpacity>
      </View>

      {/* Main Divider */}
      <View style={[styles.divider, { backgroundColor: theme.divider }]} />

      {/* Empty State */}
      {visitors.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ color: theme.textSub, fontSize: 13 }}>No visitors yet</Text>
        </View>
      ) : (
        /* Horizontal "Status" Carousel */
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {visitors.map((visitor) => (
            <TouchableOpacity 
              key={visitor.id} 
              style={styles.visitorItem}
              onPress={() => console.log('Visitor pressed:', visitor.name)}
              activeOpacity={0.8}
            >
              {/* Avatar Container with Badge */}
              <View style={styles.avatarWrapper}>
                <View style={[styles.avatarRing, { borderColor: theme.ringColor }]}>
                  <Image source={{ uri: visitor.avatar }} style={styles.avatar} />
                </View>
                
                {/* Role Box attached below image */}
                <View 
                  style={[
                    styles.roleBadge, 
                    { 
                      backgroundColor: getRoleColor(visitor.role),
                      borderColor: theme.background // Creates a cutout effect
                    }
                  ]}
                >
                  <Text style={styles.roleBadgeText} numberOfLines={1}>
                    {visitor.role}
                  </Text>
                </View>
              </View>
              
              <Text style={[styles.name, { color: theme.textMain }]} numberOfLines={1}>
                {visitor.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: -55, // Adjust this based on your layout needs
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
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
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: -10,
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 8,
    paddingRight: 20,
  },
  visitorItem: {
    alignItems: 'center',
    width: 68,
    marginRight: 16,
  },
  avatarWrapper: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 10, // Gives space for the badge and name
  },
  avatarRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  roleBadge: {
    position: 'absolute',
    bottom: -8, // Pulls the badge down so it overlaps the bottom edge
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1.5,
    minWidth: 40,
    alignItems: 'center',
  },
  roleBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default VisitorSection;