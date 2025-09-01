import { ServiceCard } from 'components/appComponents';
import {
  Button,
  FlatListComponent,
  Icon,
  ModalComponent,
  RowComponent,
  Typography,
} from 'components/common';
import { IMAGES, VARIABLES } from 'constants/index';
import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/colors';
import { STYLES } from 'utils/commonStyles';
import { screenHeight, screenWidth } from 'utils/helpers';
import { Calendar } from 'react-native-calendars';

export interface HotelDetails {
  id: number;
  floor: number;
  smoking_allowed: boolean;
  pet_friendly: boolean;
  breakfast_included: boolean;
  number_of_bed: number;
  number_of_guest: number;
  size: string;
  createdAt: string;
  bed_type: string;
  updatedAt: string;
}

export interface RoomItem {
  id: number;
  vendor_id: number;
  item_category_id: number;
  category_id: number;
  title: string;
  description: string;
  item_type: string;
  price: string;
  currency: string;
  stock_quantity: number | null;
  is_available: boolean;
  booking_required: boolean;
  call_only: boolean;
  featured: boolean;
  distance: number | null;
  rating_count: number;
  rating_avg: number | null;
  is_rated: boolean;
  is_liked: boolean;
  rating: any[];
  notification_count: number;
  createdAt: string;
  updatedAt: string;
  hotelDetails: HotelDetails;
}

export const Rooms = ({ data, itemData }: { data: any; itemData: any; heading: any }) => {
  const isLoadingRef = useRef(false);
  const [roomListPage, setRoomListPage] = useState(1);
  const [roomData, setRoomData] = useState<RoomItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [didLoad, setDidLoad] = useState(false);
  const [showDatePickerModal, setShowDatePickerModal] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = async () => {
    setHasMore(true);
    setIsRefreshing(true);
    setRoomData([]);
    setRoomListPage(1);
    await fetchHotelRooms(1);
  };

  const [selectedDate, setSelectedDate] = useState<{
    start_date?: string;
    end_date?: string;
  }>({});

  const formatDateFriendly = (dateString?: string) => {
    const date = dateString ? new Date(dateString) : new Date();
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short', // "Thu"
      month: 'short', // "Apr"
      day: 'numeric', // 18
    }).format(date);
  };

  const handleDayPress = (day: { dateString: string }) => {
    const selected = day.dateString;

    if (!selectedDate.start_date || (selectedDate.start_date && selectedDate.end_date)) {
      // If no start_date set OR both start and end are set, reset with new start_date
      setSelectedDate({ start_date: selected });
    } else {
      // If start_date is set and no end_date yet, check if selected is after or equal to start_date
      if (selected >= selectedDate.start_date) {
        setSelectedDate(prev => ({ ...prev, end_date: selected }));
      } else {
        // If selected date is before start_date, ignore or alert user
        Alert.alert('End date cannot be before start date');
      }
    }
  };

  useEffect(() => {
    if (data?.id && !didLoad && itemData?.id) {
      fetchHotelRooms(1);
      setRoomListPage(1);
    }
  }, [data?.id, itemData?.id]);

  const fetchHotelRooms = async (page: number) => {
    if (isLoadingRef.current || !data?.id || !hasMore) return;
    try {
      isLoadingRef.current = true;
      const response: any = null;
      console.log(response);
      const newItems = response?.result ?? [];
      const pagination = response?.pagination;
      setRoomData(prev => (page === 1 ? newItems : [...prev, ...newItems]));
      if (pagination?.current_page >= pagination?.last_page) {
        setHasMore(false);
      }
      setRoomListPage(page);
      if (page === 1) setDidLoad(true);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      isLoadingRef.current = false;
      setIsRefreshing(false);
    }
  };

  const renderServices = ({
    item,
    onPressItem,
  }: {
    item: RoomItem;
    onPressItem?: (item: any) => void;
  }) => {
    return (
      <ServiceCard
        item={{
          description: item?.hotelDetails?.bed_type,
          icon: true,
          name: item?.title,
          image: IMAGES.USER_IMAGE,
          price: item?.price,
        }}
        onPressItem={onPressItem}
        priceContainerStyle={{
          justifyContent: 'flex-start',
        }}
        priceTitle={'Price - '}
        priceStyle={{
          color: COLORS.SECONDARY,
        }}
      />
    );
  };
  return (
    <View style={styles.tabContent}>
      <RowComponent>
        <RowComponent
          onPress={() => {
            setShowDatePickerModal(true);
          }}
          style={{
            justifyContent: 'flex-start',
            gap: 15,
            alignItems: 'center',
            marginVertical: 10,
          }}
        >
          <Icon
            iconName='calendar'
            componentName={VARIABLES.FontAwesome}
            size={30}
            color={COLORS.PRIMARY}
          />
          <View>
            <Typography style={{ fontWeight: FontWeight.Bold }}>Start Date</Typography>
            <Typography>{formatDateFriendly(selectedDate?.start_date)}</Typography>
          </View>
        </RowComponent>
        <RowComponent
          onPress={() => {
            setShowDatePickerModal(true);
          }}
          style={{
            justifyContent: 'flex-start',
            gap: 15,
            alignItems: 'center',
            marginVertical: 10,
          }}
        >
          <Icon
            iconName='calendar'
            componentName={VARIABLES.FontAwesome}
            size={30}
            color={COLORS.PRIMARY}
          />
          <View>
            <Typography style={{ fontWeight: FontWeight.Bold }}>End Date</Typography>
            <Typography>
              {formatDateFriendly(selectedDate?.end_date ?? selectedDate?.start_date)}
            </Typography>
          </View>
        </RowComponent>
      </RowComponent>
      <FlatListComponent
        data={roomData}
        numColumns={2}
        scrollEnabled={true}
        keyExtractor={item => item?.id?.toString()}
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        // showLoadingMore={isLoadingRef.current && hasMore}
        renderItem={({ item }) =>
          renderServices({
            item,
            onPressItem: () => {},
          })
        }
        onEndReached={() => {
          if (!isLoadingRef.current && hasMore) {
            fetchHotelRooms(roomListPage + 1);
          }
        }}
        contentContainerStyle={{ paddingBottom: 160 }}
      />
      <ModalComponent
        position='center'
        modalVisible={showDatePickerModal}
        setModalVisible={setShowDatePickerModal}
        modalSecondaryContainerStyle={{
          gap: 20,
        }}
      >
        <Icon
          iconName={'close-circle'}
          onPress={() => {
            setShowDatePickerModal(false);
          }}
          componentName={VARIABLES.Ionicons}
          size={FontSize.XXL}
          color={COLORS.PRIMARY}
          iconStyle={{
            position: 'absolute',
            right: 0,
            zIndex: 10,
            top: 0,
          }}
        />
        <Typography
          style={{
            textAlign: 'center',
            color: COLORS.PRIMARY,
            fontWeight: FontWeight.Bold,
            fontSize: FontSize.MediumLarge,
          }}
        >{`Select Start & End Dates`}</Typography>
        <Calendar
          onDayPress={handleDayPress}
          style={{ ...STYLES.SHADOW, borderRadius: 20, padding: 10 }}
          markedDates={{
            ...(selectedDate.start_date && {
              [selectedDate.start_date]: {
                selected: true,
                startingDay: true,
                color: COLORS.PRIMARY,
                textColor: COLORS.WHITE,
              },
            }),
            ...(selectedDate.end_date && {
              [selectedDate.end_date]: {
                selected: true,
                endingDay: true,
                color: COLORS.PRIMARY,
                textColor: COLORS.WHITE,
              },
            }),
          }}
          markingType={'period'}
        />

        <Button
          title={'Done'}
          disabled={!selectedDate.start_date}
          onPress={() => {
            setShowDatePickerModal(false);
            // Reset and fetch data based on selected date range
            setRoomData([]); // clear old data
            setHasMore(true); // reset pagination
            setRoomListPage(1);
            fetchHotelRooms(1);
          }}
        />
      </ModalComponent>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 16,
  },
  photoGrid: {
    width: screenWidth(44),
    height: screenHeight(25),
    borderRadius: 8,
  },
});
