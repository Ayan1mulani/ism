import React from 'react';
import { View } from 'react-native';
import { FlatList } from 'react-native';
import ProfileRentCard from './RentSection';
import VisitorSection from './VisitorSection';
import CarouselSection from './SocietyImage';
import ServicesSection from './ServiceSection';
import NoticesSection from './NoticeSection';
import ImportantContacts from './ContactSection';
import { usePermissions } from '../../Utils/ConetextApi';
import Action from './Action';


const HomeScreen = () => {
  const { nightMode } = usePermissions();

  const backgroundColor = nightMode ? '#000000ff' : '#F8FAFC';

  return (
    <FlatList
      data={[]}
      renderItem={() => null}  
      keyExtractor={() => 'home'}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        backgroundColor,
        paddingBottom: 170,
      }}
      ListHeaderComponent={
        <View>
          <ProfileRentCard />
          <VisitorSection />
          <CarouselSection />
          <ServicesSection />
          <Action/>
          <ImportantContacts />
        </View>
      }
    />
  );
};

export default HomeScreen;