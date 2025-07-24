import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePermissions } from '../../Utils/ConetextApi';

const NoticesSection = () => {
  // Night mode toggle - change to false for light mode
  const {nightMode} = usePermissions();

  const notices = [
    {
      id: '1',
      title: 'The Biggest Jewel...',
      date: '13th June - 13th July 2025',
      description: 'Joyalukkas invites...',
      timeAgo: '13 days ago',
      image: 'https://images.pexels.com/photos/1454166/pexels-photo-1454166.jpeg'
    },
  ];

  // Theme colors
  const theme = {
    light: {
      sectionBackground: '#074B7C1A',
      cardBackground: '#F8F9FA',
      titleColor: '#050505',
      seeAllColor: '#074B7C',
      noticeTitleColor: '#2C3E50',
      dateColor: '#7F8C8D',
      descColor: '#7F8C8D',
      timeColor: '#95A5A6',
      chevronColor: '#BDC3C7',
    },
    dark: {
      sectionBackground: '#1F2937',
      cardBackground: '#374151',
      titleColor: '#F9FAFB',
      seeAllColor: '#60A5FA',
      noticeTitleColor: '#F3F4F6',
      dateColor: '#D1D5DB',
      descColor: '#D1D5DB',
      timeColor: '#9CA3AF',
      chevronColor: '#6B7280',
    },
  };

  const currentTheme = nightMode ? theme.dark : theme.light;

  return (
    <View style={[styles.section, { backgroundColor: currentTheme.sectionBackground }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: currentTheme.titleColor }]}>
          Society Notices
        </Text>
        <TouchableOpacity>
          <Text style={[styles.seeAll, { color: currentTheme.seeAllColor }]}>
            See all
          </Text>
        </TouchableOpacity>
      </View>
      {notices.map(notice => (
        <TouchableOpacity 
          key={notice.id} 
          style={[styles.card, { backgroundColor: currentTheme.cardBackground }]}
        >
          <Image source={{ uri: notice.image }} style={styles.image} />
          <View style={styles.content}>
            <Text style={[styles.noticeTitle, { color: currentTheme.noticeTitleColor }]}>
              {notice.title}
            </Text>
            <Text style={[styles.noticeDate, { color: currentTheme.dateColor }]}>
              Date: {notice.date}
            </Text>
            <Text style={[styles.noticeDesc, { color: currentTheme.descColor }]}>
              {notice.description}
            </Text>
            <Text style={[styles.noticeTime, { color: currentTheme.timeColor }]}>
              {notice.timeAgo}
            </Text>
          </View>
          <Ionicons 
            name="chevron-forward-outline" 
            size={20} 
            color={currentTheme.chevronColor} 
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 16,
    paddingBottom: 10,
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 16,
  },
  header: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  noticeDate: {
    fontSize: 12,
  },
  noticeDesc: {
    fontSize: 12,
  },
  noticeTime: {
    fontSize: 11,
  },
});

export default NoticesSection;