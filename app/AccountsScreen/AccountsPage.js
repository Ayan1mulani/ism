// AccountsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePermissions } from '../../Utils/ConetextApi';
import { otherServices } from '../../services/otherServices';

const THEME = {
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

export default function AccountsScreen() {
  const { nightMode } = usePermissions();
  const [outstanding, setOutstanding] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const theme = {
    backgroundColor: nightMode ? THEME.darkBackground : THEME.lightBackground,
    componentBackground: nightMode ? THEME.darkComponentBackground : THEME.componentBackground,
    borderColor: nightMode ? THEME.darkBorderColor : THEME.borderColor,
    textColor: nightMode ? THEME.darkTextColor : THEME.darkText,
    inactiveText: nightMode ? THEME.darkInactiveText : THEME.inactiveText,
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch outstanding data
      const outstandingResp = await otherServices.getOutStandings();
      setOutstanding(outstandingResp.data || []);

      // Fetch accounts data
      const accountsResp = await otherServices.getMyAccounts();
      setAccounts(accountsResp.data || accountsResp || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load account data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleDownloadBill = (url, statementNo) => {
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Unable to open the bill URL');
      });
    } else {
      Alert.alert('Info', `Statement: ${statementNo}\nDownload not available`);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getTotalOutstanding = () => {
    return outstanding.reduce((total, item) => total + (item.data?.balance || 0), 0);
  };

  // Function to get appropriate icon based on bill type or statement number
  const getBillIcon = (statementNo, billType) => {
    const statement = statementNo?.toLowerCase() || '';
    
    if (statement.includes('electricity') || statement.includes('electric')) {
      return 'flash-outline';
    } else if (statement.includes('maintenance') || statement.includes('maintain')) {
      return 'construct-outline';
    } else if (statement.includes('water') || statement.includes('plumbing')) {
      return 'water-outline';
    } else if (statement.includes('gas') || statement.includes('cooking')) {
      return 'flame-outline';
    } else if (statement.includes('parking') || statement.includes('vehicle')) {
      return 'car-outline';
    } else if (statement.includes('security') || statement.includes('guard')) {
      return 'shield-outline';
    } else if (statement.includes('cleaning') || statement.includes('housekeeping')) {
      return 'broom-outline';
    } else if (statement.includes('internet') || statement.includes('wifi')) {
      return 'wifi-outline';
    } else if (statement.includes('amenity') || statement.includes('facility')) {
      return 'fitness-outline';
    } else {
      return 'receipt-outline'; // Default bill icon
    }
  };

  const renderOutstandingCard = ({ item }) => (
    <View style={[styles.outstandingCard, { 
      backgroundColor: theme.componentBackground,
      borderColor: theme.borderColor,
    }]}>
      <View style={styles.outstandingHeader}>
        <View style={[styles.iconContainer, { 
          backgroundColor: `${THEME.primaryAccent}15` 
        }]}>
          <Ionicons 
            name={item.name === 'Electricity' ? 'flash-outline' : 'home-outline'} 
            size={24} 
            color={THEME.primaryAccent} 
          />
        </View>
        <View style={styles.outstandingInfo}>
          <Text style={[styles.outstandingName, { color: theme.textColor }]}>
            {item.name}
          </Text>
          <Text style={[styles.outstandingMessage, { color: theme.inactiveText }]}>
            {item.message}
          </Text>
        </View>
        <View style={styles.outstandingAmount}>
          <Text style={[styles.amountText, { color: THEME.primaryAccent }]}>
            {formatCurrency(item.data?.balance)}
          </Text>
          <Text style={[styles.dateText, { color: theme.inactiveText }]}>
            Due: {formatDate(item.data?.bill_date || item.data?.date)}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderAccountCard = ({ item }) => (
    <TouchableOpacity 
      style={[styles.accountCard, { 
        backgroundColor: theme.componentBackground,
        borderColor: theme.borderColor,
      }]}
      onPress={() => handleDownloadBill(item.url, item.statement_no)}
    >
      <View style={styles.accountHeader}>
        {/* Added icon container for bill history */}
        <View style={[styles.billIconContainer, { 
          backgroundColor: `${THEME.primaryAccent}15` 
        }]}>
          <Ionicons 
            name={getBillIcon(item.statement_no, item.bill_type)} 
            size={20} 
            color={THEME.primaryAccent} 
          />
        </View>
        
        <View style={styles.accountLeft}>
          <Text style={[styles.statementNo, { color: theme.textColor }]}>
            {item.statement_no}
          </Text>
          <Text style={[styles.accountDate, { color: theme.inactiveText }]}>
            {formatDate(item.date)}
          </Text>
          <View style={styles.accountAmounts}>
            <Text style={[styles.currentAmount, { color: THEME.primaryAccent }]}>
              Current: {formatCurrency(item.current)}
            </Text>
            {item.arrear > 0 && (
              <Text style={[styles.arrearAmount, { color: '#FF3B30' }]}>
                Arrear: {formatCurrency(item.arrear)}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.accountRight}>
          <Text style={[styles.balanceAmount, { color: theme.textColor }]}>
            {formatCurrency(item.balance)}
          </Text>
          <Text style={[styles.balanceLabel, { color: theme.inactiveText }]}>
            Balance
          </Text>
          {item.url && (
            <View style={styles.downloadButton}>
              <Ionicons name="download-outline" size={16} color={THEME.primaryAccent} />
              <Text style={[styles.downloadText, { color: THEME.primaryAccent }]}>
                Download
              </Text>
            </View>
          )}
        </View>
      </View>
      
      {item.remarks && (
        <View style={[styles.remarksContainer, { borderTopColor: theme.borderColor }]}>
          <Ionicons name="information-circle-outline" size={14} color={theme.inactiveText} />
          <Text style={[styles.remarksText, { color: theme.inactiveText }]}>
            {item.remarks}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const styles = getStyles(theme, nightMode);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
        <StatusBar 
          barStyle={nightMode ? "light-content" : "dark-content"} 
          backgroundColor={theme.backgroundColor}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.primaryAccent} />
          <Text style={[styles.loadingText, { color: theme.textColor }]}>
            Loading account information...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <StatusBar 
        barStyle={nightMode ? "light-content" : "dark-content"} 
        backgroundColor={theme.backgroundColor}
      />
      
      {/* Header */}
      <View style={[styles.header, { 
        backgroundColor: theme.componentBackground,
        borderBottomColor: theme.borderColor 
      }]}>
      
        <View style={[styles.totalContainer, { backgroundColor: `${THEME.primaryAccent}15` }]}>
          <Text style={[styles.totalLabel, { color: theme.inactiveText }]}>
            Total Outstanding
          </Text>
          <Text style={[styles.totalAmount, { color: THEME.primaryAccent }]}>
            {formatCurrency(getTotalOutstanding())}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[THEME.primaryAccent]}
            tintColor={THEME.primaryAccent}
          />
        }
      >
        {/* Outstanding Section */}
        {outstanding.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
              Outstanding Bills
            </Text>
            {outstanding.map((item, index) => (
              <View key={item.id || index}>
                {renderOutstandingCard({ item })}
              </View>
            ))}
          </View>
        )}

        {/* Accounts Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            Bill History
          </Text>
          {accounts.length > 0 ? (
            accounts.map((item, index) => (
              <View key={item.id || index}>
                {renderAccountCard({ item })}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={64} color={theme.inactiveText} />
              <Text style={[styles.emptyStateTitle, { color: theme.textColor }]}>
                No Bills Found
              </Text>
              <Text style={[styles.emptyStateSubtitle, { color: theme.inactiveText }]}>
                Your bill history will appear here
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme, nightMode) => StyleSheet.create({
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  totalContainer: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  outstandingCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: nightMode ? 0.3 : 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  outstandingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  outstandingInfo: {
    flex: 1,
  },
  outstandingName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  outstandingMessage: {
    fontSize: 14,
  },
  outstandingAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 12,
    marginTop: 2,
  },
  accountCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: nightMode ? 0.3 : 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  // New style for bill history icon
  billIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  accountLeft: {
    flex: 1,
  },
  statementNo: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  accountDate: {
    fontSize: 14,
    marginBottom: 8,
  },
  accountAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  currentAmount: {
    fontSize: 14,
    fontWeight: '500',
  },
  arrearAmount: {
    fontSize: 14,
    fontWeight: '500',
  },
  accountRight: {
    alignItems: 'flex-end',
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  balanceLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: `${THEME.primaryAccent}15`,
    borderRadius: 8,
  },
  downloadText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  remarksContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
  },
  remarksText: {
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
