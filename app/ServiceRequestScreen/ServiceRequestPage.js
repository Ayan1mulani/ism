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

const ComplaintListScreen = ({ nightMode, status, complaints = [], isLoading = false }) => {
  const { nightMode: contextNightMode } = usePermissions();
  
  // Use nightMode from props or fallback to context
  const currentNightMode = nightMode !== undefined ? nightMode : contextNightMode;


  // Dynamic theme based on night mode
  const currentTheme = {
    backgroundColor: currentNightMode ? THEME_COLORS.darkBackground : THEME_COLORS.lightBackground,
    textColor: currentNightMode ? THEME_COLORS.darkTextColor : THEME_COLORS.darkText,
    inactiveTextColor: currentNightMode ? THEME_COLORS.darkInactiveText : THEME_COLORS.inactiveText,
  };

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: currentTheme.backgroundColor }]}>
        <ActivityIndicator size="large" color={THEME_COLORS.primaryAccent} />
        <Text style={[styles.loadingText, { color: currentTheme.textColor }]}>
          Loading {status} complaints...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
      <StatusBar 
        barStyle={currentNightMode ? "light-content" : "dark-content"} 
        backgroundColor={currentTheme.backgroundColor}
      />
      <FlatList
        data={complaints}
        renderItem={({ item }) => (
          <ComplaintCard 
            complaint={item} 
            nightMode={currentNightMode}
          />
        )}
        keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
        ListEmptyComponent={() => (
          <View style={[styles.centered, { backgroundColor: currentTheme.backgroundColor }]}>
            <Text style={[styles.emptyText, { color: currentTheme.inactiveTextColor }]}>
              No {status.toLowerCase()} complaints found.
            </Text>
          </View>
        )}
        contentContainerStyle={complaints.length === 0 ? { flex: 1 } : styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
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
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  listContent: {
    paddingVertical: 10,
  },
});

export default ComplaintListScreen;
