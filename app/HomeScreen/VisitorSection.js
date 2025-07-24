import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePermissions } from '../../Utils/ConetextApi';
import { visitorServices } from '../../services/visitorServices';

// Enable LayoutAnimation for Android (optional for smoother animations)
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const VisitorSection = () => {
  const [showAll, setShowAll] = useState(false);
  const [visitors, setVisitors] = useState([]);
  const animations = useRef([]).current;
  const { nightMode } = usePermissions();

  // Fetch visitors on mount
  useEffect(() => {
    const getMyVisitors = async () => {
      try {
        const response = await visitorServices.getMyVisitors();

        // response.data.visits is expected to be an array of visitor objects like your example
        const visitsData = response.data.visits;

        // Map the response data to the visitor objects your component expects:
        // id, name, role (using 'purpose'), avatar (using visitor_data.image)
        const mappedVisitors = visitsData.map(visit => ({
          id: visit.id.toString(),
          name: visit.name || visit.visitor_data?.name || 'Unknown',
          role: visit.purpose || 'Visitor',
          avatar: visit.image || visit.visitor_data?.image || 'https://via.placeholder.com/44',
        }));

        setVisitors(mappedVisitors);
      } catch (error) {
        console.error('Error fetching visitors:', error);
      }
    };

    getMyVisitors();
  }, []);

  // Initialize animations whenever visitors change
  useEffect(() => {
    animations.splice(0);
    visitors.forEach(() => {
      animations.push(new Animated.Value(0));
    });
  }, [visitors]);

  // Animation on expanding visitor list
  const startAnimation = () => {
    const anims = visitors.map((_, i) => {
      return Animated.timing(animations[i], {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
        delay: i * 60,
      });
    });
    Animated.stagger(60, anims).start();
  };

  const toggleShowAll = () => {
    if (!showAll) startAnimation();
    setShowAll((prev) => !prev);
  };

  // Only show first 4 visitors initially
  const visible = visitors.slice(0, 4);
  const hidden = visitors.slice(4);

  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case 'zomato': return '#FF6B6B';
      case 'swiggy': return '#FF8C00';
      case 'ola': return '#00C853';
      case 'employee': return '#1976D2';
      default: return '#3B82F6';
    }
  };

  // Dynamic styles based on night mode
  const dynamicStyles = {
    container: {
      backgroundColor: nightMode ? '#1f2225ff' : 'transparent',
      borderRadius:12,
    },
    title: {
      color: nightMode ? '#F9FAFB' : '#111827',
    },
    iconColor: nightMode ? '#F9FAFB' : '#000000',
    addButton: {
      backgroundColor: nightMode ? '#374151' : '#F9FAFB',
      borderColor: nightMode ? '#4B5563' : '#E5E7EB',
    },
    showAll: {
      color: nightMode ? '#60A5FA' : '#3B82F6',
    },
    avatar: {
      borderColor: nightMode ? '#4B5563' : '#E5E7EB',
    },
    name: {
      color: nightMode ? '#D1D5DB' : '#374151',
    },
    countBadge: {
      backgroundColor: nightMode ? '#4B5563' : '#F9FAFB',
      borderColor: nightMode ? '#6B7280' : '#E5E7EB',
    },
    countText: {
      color: nightMode ? '#D1D5DB' : '#6B7280',
    },
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.inline}>
          <Ionicons name="people" size={24} color={dynamicStyles.iconColor} />
          <Text style={[styles.title, dynamicStyles.title]}> Your visitors</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.addButton, dynamicStyles.addButton]}
            activeOpacity={0.8}
            onPress={() => console.log('Add visitor')}
          >
            <Ionicons name="add" size={18} color={nightMode ? '#D1D5DB' : '#6B7280'} />
          </TouchableOpacity>
          {visitors.length > 4 && (
            <TouchableOpacity onPress={toggleShowAll} activeOpacity={0.7}>
              <Text style={[styles.showAll, dynamicStyles.showAll]}>
                {showAll ? 'Hide' : 'Show All'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Visitors List */}
      <View style={[styles.cardContainer, dynamicStyles.cardContainer]}>
        <View style={styles.contentContainer}>
          <View style={styles.visitorsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.visitorRow}
            >
              {[...visible, ...(showAll ? hidden : [])].map((visitor, i) => (
                <Animated.View
                  key={visitor.id}
                  style={[
                    styles.visitorWrapper,
                    showAll && {
                      opacity: animations[i],
                      transform: [
                        {
                          translateY: animations[i].interpolate({
                            inputRange: [0, 1],
                            outputRange: [10, 0],
                          }),
                        },
                        {
                          scale: animations[i].interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 1],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <View style={styles.visitorCard}>
                    <View style={styles.avatarContainer}>
                      <Image
                        source={{ uri: visitor.avatar }}
                        style={[styles.avatar, dynamicStyles.avatar]}
                        resizeMode="cover"
                      />
                      <View
                        style={[
                          styles.roleBadge,
                          { backgroundColor: getRoleColor(visitor.role) },
                        ]}
                      >
                        <Text style={styles.roleBadgeText}>{visitor.role}</Text>
                      </View>
                    </View>
                    <Text style={[styles.name, dynamicStyles.name]} numberOfLines={1}>
                      {visitor.name}
                    </Text>
                  </View>
                </Animated.View>
              ))}
            </ScrollView>
          </View>

          {!showAll && hidden.length > 0 && (
            <View style={styles.countBadgeContainer}>
              <View style={[styles.countBadge, dynamicStyles.countBadge]}>
                <Text style={[styles.countText, dynamicStyles.countText]}>+{hidden.length}</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  showAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardContainer: {
    borderRadius: 12,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 1,
    position: 'relative',
  },
  visitorsContainer: {
    flex: 1,
  },
  visitorRow: {
    alignItems: 'center',
    paddingRight: 8,
  },
  visitorWrapper: {
    marginRight: 8,
  },
  visitorCard: {
    alignItems: 'center',
    width: 56,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
  },
  roleBadge: {
    position: 'absolute',
    bottom: -4,
    left: '50%',
    transform: [{ translateX: -20 }],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  roleBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '600',
  },
  name: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 14,
  },
  countBadgeContainer: {
    marginRight: 12,
  },
  countBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default VisitorSection;
