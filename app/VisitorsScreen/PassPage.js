// PassPage.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Updated theme colors
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

const PassPage = ({ nightMode, passData, loading, onRefresh }) => {
  const [refreshing, setRefreshing] = useState(false);

  const currentTheme = {
    backgroundColor: nightMode ? THEME_COLORS.darkBackground : THEME_COLORS.lightBackground,
    componentBackground: nightMode ? THEME_COLORS.darkComponentBackground : THEME_COLORS.componentBackground,
    borderColor: nightMode ? THEME_COLORS.darkBorderColor : THEME_COLORS.borderColor,
    textColor: nightMode ? THEME_COLORS.darkTextColor : THEME_COLORS.darkText,
    inactiveTextColor: nightMode ? THEME_COLORS.darkInactiveText : THEME_COLORS.inactiveText,
  };

  const getPassIcon = (purpose) => {
    switch (purpose?.toLowerCase()) {
      case 'guest': return 'people-outline';
      case 'delivery': return 'cube-outline';
      case 'visitor': return 'person-outline';
      case 'service': return 'construct-outline';
      case 'vendor': return 'briefcase-outline';
      case 'cab': return 'car-outline';  // Added car icon for cab
      case 'taxi': return 'car-outline'; // Also for taxi
      default: return 'card-outline';
    }
  };

  const getStatusColor = (status) => {
    // Convert status to string for comparison
    const statusStr = String(status);
    switch (statusStr) {
      case '1': return '#34C759'; // Active - Green
      case '0': return '#FF3B30'; // Expired/Inactive - Red
      default: return '#FF9500'; // Pending - Orange
    }
  };

  const getStatusText = (status) => {
    const statusStr = String(status);
    switch (statusStr) {
      case '1': return 'ACTIVE';
      case '0': return 'INACTIVE';
      default: return 'PENDING';
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getValidityText = (pass) => {
    if (pass.valid_days) {
      return `Valid for ${pass.valid_days} days`;
    }
    if (pass.date_time) {
      const passDate = new Date(pass.date_time);
      const today = new Date();
      if (passDate.toDateString() === today.toDateString()) {
        return 'Valid for today';
      } else {
        return `Valid until ${formatDate(pass.date_time)}`;
      }
    }
    return 'Validity not specified';
  };

  const handlePassPress = (pass) => {
    Alert.alert(
      'Pass Details',
      `Pass No: ${pass.pass_no}\nName: ${pass.name}\nMobile: ${pass.mobile}\nPurpose: ${pass.purpose}\nStatus: ${getStatusText(pass.status)}\nCreated: ${formatDate(pass.created_at)}${pass.remarks ? `\nRemarks: ${pass.remarks}` : ''}`,
      [
        {
          text: 'Edit',
          onPress: () => console.log('Edit pass:', pass.id),
        },
        {
          text: 'Share',
          onPress: () => console.log('Share pass:', pass.id),
        },
        {
          text: 'Call',
          onPress: () => console.log('Call:', pass.mobile),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (onRefresh) {
      await onRefresh();
    }
    setRefreshing(false);
  };

  const renderPassItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.passItem, { 
        backgroundColor: currentTheme.componentBackground,
        borderColor: currentTheme.borderColor,
      }]}
      onPress={() => handlePassPress(item)}
    >
      <View style={styles.passItemHeader}>
        <View style={styles.passItemLeft}>
          <View style={[styles.iconContainer, { 
            backgroundColor: `${THEME_COLORS.primaryAccent}15` 
          }]}>
            <Ionicons 
              name={getPassIcon(item.purpose)} 
              size={24} 
              color={THEME_COLORS.primaryAccent} 
            />
          </View>
          <View style={styles.passItemInfo}>
            <Text style={[styles.passItemTitle, { 
              color: currentTheme.textColor 
            }]}>
              {item.purpose.charAt(0).toUpperCase() + item.purpose.slice(1)} Pass
            </Text>
            <Text style={[styles.passItemName, { 
              color: currentTheme.inactiveTextColor 
            }]}>
              {item.name}
            </Text>
            <Text style={[styles.passItemMobile, { 
              color: currentTheme.inactiveTextColor 
            }]}>
              {item.mobile}
            </Text>
            {item.company_name && (
              <Text style={[styles.passItemCompany, { 
                color: THEME_COLORS.primaryAccent 
              }]}>
                {item.company_name}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.passItemRight}>
          <View style={[styles.statusBadge, { 
            backgroundColor: getStatusColor(item.status) 
          }]}>
            <Text style={styles.statusText}>
              {getStatusText(item.status)}
            </Text>
          </View>
          <Text style={[styles.passId, { 
            color: THEME_COLORS.primaryAccent 
          }]}>
            #{item.pass_no}
          </Text>
        </View>
      </View>
      
      <View style={[styles.passItemFooter, { 
        borderTopColor: currentTheme.borderColor 
      }]}>
        <View style={styles.validityInfo}>
          <Ionicons name="time-outline" size={16} color={getStatusColor(item.status)} />
          <Text style={[styles.validityText, { 
            color: getStatusColor(item.status) 
          }]}>
            {getValidityText(item)}
          </Text>
        </View>
        <Text style={[styles.issueDate, { 
          color: currentTheme.inactiveTextColor 
        }]}>
          Created: {formatDate(item.created_at)}
        </Text>
      </View>

      {item.remarks && (
        <View style={[styles.remarksContainer, { 
          borderTopColor: currentTheme.borderColor 
        }]}>
          <Ionicons name="chatbubble-outline" size={14} color={currentTheme.inactiveTextColor} />
          <Text style={[styles.remarksText, { 
            color: currentTheme.inactiveTextColor 
          }]}>
            {item.remarks}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const styles = getPassStyles(currentTheme, nightMode);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: currentTheme.backgroundColor }]}>
        <ActivityIndicator size="large" color={THEME_COLORS.primaryAccent} />
        <Text style={[styles.loadingText, { color: currentTheme.textColor }]}>
          Loading passes...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
      {/* Pass List */}
      <FlatList
        data={passData || []}
        renderItem={renderPassItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[THEME_COLORS.primaryAccent]}
            tintColor={THEME_COLORS.primaryAccent}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="card-outline" size={64} color={currentTheme.inactiveTextColor} />
            <Text style={[styles.emptyStateTitle, { 
              color: currentTheme.textColor 
            }]}>
              No Passes Found
            </Text>
            <Text style={[styles.emptyStateSubtitle, { 
              color: currentTheme.inactiveTextColor 
            }]}>
              No passes available
            </Text>
          </View>
        )}
      />

      {/* Add Pass Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: THEME_COLORS.primaryAccent }]}
        onPress={() => Alert.alert('Add Pass', 'Add new pass functionality')}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add New Pass</Text>
      </TouchableOpacity>
    </View>
  );
};

const getPassStyles = (currentTheme, nightMode) => StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 100,
  },
  passItem: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: nightMode ? 0.3 : 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  passItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  passItemLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  passItemInfo: {
    flex: 1,
  },
  passItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  passItemName: {
    fontSize: 14,
    marginBottom: 2,
  },
  passItemMobile: {
    fontSize: 12,
    marginBottom: 2,
  },
  passItemCompany: {
    fontSize: 12,
    fontWeight: '500',
  },
  passItemRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  passId: {
    fontSize: 12,
    fontWeight: '600',
  },
  passItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  validityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  validityText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
    flex: 1,
  },
  issueDate: {
    fontSize: 10,
  },
  remarksContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
  },
  remarksText: {
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default PassPage;
