import React, { useState } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
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

  const [refreshing, setRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const backgroundColor = nightMode ? '#000000' : '#F8FAFC';

  const onRefresh = async () => {
    try {
      setRefreshing(true);

      // 👇 Trigger re-fetch inside sections
      setRefreshTrigger(prev => prev + 1);

      // Small delay for smooth UX
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      console.log('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <FlatList
      data={[1]} // FlatList needs at least 1 item
      renderItem={() => null}
      keyExtractor={() => 'home'}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        backgroundColor,
        paddingBottom: 170,
      }}
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
          <QuickActionsScreen/>
          <ImportantContacts refreshTrigger={refreshTrigger} />
        </View>
      }
    />
  );
};

export default HomeScreen;