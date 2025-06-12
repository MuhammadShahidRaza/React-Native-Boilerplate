
import React, { useState } from 'react';import { View, ScrollView, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Typography, Header, Wrapper } from 'components/index';
import { COLORS } from 'utils/colors';
import { FontSize } from 'types/fontTypes';
import { IMAGES } from 'constants/assets';
import { BookingCard } from 'components/common/BookingCard';
import { navigate } from 'navigation/Navigators';
import { SCREENS } from 'constants/routes';

const TABS = ['Upcoming', 'On-going', 'Completed', 'Cancelled'];

const bookingsData = {
  Upcoming: [
    {
      id: '1',
      name: 'Lorem Ipsum',
      date: '14/05/2025',
      time: '10:00am - 12:00pm',
      location: 'Abu Dhabi',
      price: '$10/Hour',
      rating: 3.9,
      image: IMAGES.ONBOARDING3,
    },
  ],
  'On-going': [
    {
      id: '2',
      name: 'Lorem Ipsum',
      status: 'Active',
      image: IMAGES.ONBOARDING1,
    },
  ],
  Completed: [
    {
      id: '3',
      name: 'Lorem Ipsum',
      status: 'Completed',
      image: IMAGES.ONBOARDING2,
    },
  ],
  Cancelled: [
    {
      id: '4',
      name: 'Lorem Ipsum',
      date: '14/05/2025',
      time: '10:00am - 12:00pm',
      status: 'Cancelled',
      image: IMAGES.ONBOARDING2,
    },
  ],
};

const MyBooking = () => {
  const [activeTab, setActiveTab] = useState('Upcoming');

  return (
    <Wrapper useScrollView backgroundColor={COLORS.HEADER}>
      <View style={{ marginTop: 20 }}>
        <Header title="My Booking" />
      </View>

      <View style={styles.container}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContainer}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabButton, activeTab === tab && styles.activeTab]}
            >
              <Typography style={styles.tabLabel}>{tab}</Typography>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <FlatList
          data={bookingsData[activeTab]}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => <BookingCard {...item} 
          onPress={() => navigate(SCREENS.BOOKINGDETAILSCREEN, { booking: item })}/>}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    backgroundColor: COLORS.WHITE,
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    height: 51,
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginEnd: 10,
    backgroundColor: COLORS.WHITE_OPACITY,
  },
  activeTab: {
    borderColor: COLORS.PRIMARY,
    borderWidth: 1,
    backgroundColor: COLORS.WHITE_OPACITY,
  },
  tabLabel: {
    fontSize: FontSize.MediumSmall,
    fontWeight: '400',
    color: COLORS.BLACK,
  },
});

export default MyBooking;
