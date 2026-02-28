import React, { useState } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import ProfileRentCard from './RentSection';
import VisitorSection from './VisitorSection';
import CarouselSection from './SocietyImage';
import ServicesSection from './ServiceSection';
import ImportantContacts from './ContactSection';
import { usePermissions } from '../../Utils/ConetextApi';
import Action from './Action';
import QuickActionsScreen from './QuickActionsScreen';



const HomeScreen = () => {
  
  const { nightMode } = usePermissions();

  // ✅ Check if context is ready
  if (nightMode === undefined) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, color: '#666' }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const backgroundColor = nightMode ? '#000000' : '#F8FAFC';

  const [refreshing, setRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      setRefreshTrigger(prev => prev + 1);
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      console.log('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={{ flex: 1 , backgroundColor }}>
            <StatusBar barStyle={nightMode ? 'light-content' : 'dark-content'} />

      <FlatList
        data={[1]}
        renderItem={() => null}
        keyExtractor={() => 'home'}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1996D3"
          />
        }
        ListHeaderComponent={
          <View>
            <ProfileRentCard refreshTrigger={refreshTrigger} />
            <VisitorSection refreshTrigger={refreshTrigger} />
            <CarouselSection refreshTrigger={refreshTrigger} />
            <ServicesSection refreshTrigger={refreshTrigger} />
            <Action />
            <QuickActionsScreen />
            <ImportantContacts refreshTrigger={refreshTrigger} />
          </View>
        }
      />
    </View>
  );
};

export default HomeScreen;