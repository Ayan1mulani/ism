import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, FlatList, Text, View, ActivityIndicator, StatusBar } from 'react-native';
import ComplaintCard from './complaintCard'; // Import the card component
import { complaintService } from '../../services/complaintService';
import { usePermissions } from '../../Utils/ConetextApi';

// --- YOUR THEME COLORS ---
const THEME_COLORS = {
  primaryAccent: '#1996D3',
  darkText: '#074B7C',
  inactiveText: '#6c757d',
  lightBackground: '#f4f7f9',
  // Night mode colors
  darkBackground: '#121212',
  darkTextColor: '#ffffff',
  darkInactiveText: '#aaaaaa',
};

const ComplaintListScreen = () => {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const {nightMode} = usePermissions();

  // Dynamic theme based on night mode
  const currentTheme = {
    backgroundColor: nightMode ? THEME_COLORS.darkBackground : THEME_COLORS.lightBackground,
    textColor: nightMode ? THEME_COLORS.darkTextColor : THEME_COLORS.darkText,
    inactiveTextColor: nightMode ? THEME_COLORS.darkInactiveText : THEME_COLORS.inactiveText,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await complaintService.getMyComplaints();
        console.log(response,'this are complaints')
        setComplaints(response.data);
      } catch (error) {
        console.error("Failed to fetch complaints:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: currentTheme.backgroundColor }]}>
        <ActivityIndicator size="large" color={THEME_COLORS.primaryAccent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
      <StatusBar 
        barStyle={nightMode ? "light-content" : "dark-content"} 
        backgroundColor={currentTheme.backgroundColor}
      />
      <FlatList
        data={complaints}
        renderItem={({ item }) => <ComplaintCard complaint={item} />}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={() => (
          <View style={[styles.centered, { backgroundColor: currentTheme.backgroundColor }]}>
            <Text style={[styles.emptyText, { color: currentTheme.inactiveTextColor }]}>
              No complaints found.
            </Text>
          </View>
        )}
        contentContainerStyle={complaints.length === 0 ? { flex: 1 } : null}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});

export default ComplaintListScreen;
