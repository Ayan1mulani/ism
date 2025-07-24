import React from 'react'
import { ScrollView, View, useColorScheme } from 'react-native'
import ProfileRentCard from './RentSection'
import VisitorSection from './VisitorSection'
import CarouselSection from './SocietyImage'
import ServicesSection from './ServiceSection'
import NoticesSection from './NoticeSection'
import ImportantContacts from './ContactSection'
import { usePermissions } from '../../Utils/ConetextApi'

const HomeScreen = () => {
  const {nightMode} = usePermissions()

  const styles = {
    container: {
      backgroundColor: nightMode ? '#000000ff' : '#F8FAFC',
      flex: 1,
      
    }
  }

  return (
    <ScrollView style={[styles.container,{paddingBottom:170}]}>
      <ProfileRentCard  />
      <VisitorSection />
      <CarouselSection/>
      <ServicesSection  />
      <NoticesSection  />
      <ImportantContacts  />
    </ScrollView>
  )
}

export default HomeScreen