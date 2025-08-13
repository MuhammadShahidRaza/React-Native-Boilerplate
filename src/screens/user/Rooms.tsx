import { getVendorItemslist } from 'api/functions/app/home';
import { ServiceCard } from 'components/appComponents';
import {
  Button,
  FlatListComponent,
  Icon,
  ModalComponent,
  RowComponent,
  Typography,
} from 'components/common';
import { IMAGES, SCREENS, VARIABLES } from 'constants/index';
import { navigate } from 'navigation/Navigators';
import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { FontSize, FontWeight } from 'types/fontTypes';
import {
  CATEGORY_NAMES,
  CategoryItem,
  CategoryNameTypes,
  Media,
  Vendor,
} from 'types/responseTypes';
import { COLORS } from 'utils/colors';
import { FLEX_CENTER, STYLES } from 'utils/commonStyles';
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
  vendor: Vendor;
  media: Media[];
  hotelDetails: HotelDetails;
}

export const Rooms = ({
  data,
  itemData,
  heading,
  setShowCartButton,
  showCartButton,
}: {
  data: Vendor;
  itemData: CategoryItem;
  heading: CategoryNameTypes;
  showCartButton: any; //TODO: ADD TYPE
  setShowCartButton: any; //TODO: ADD TYPE
}) => {
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
      const response = await getVendorItemslist({
        vendor_Id: data?.id,
        page,
        start_date: selectedDate?.start_date,
        end_date: selectedDate?.end_date ?? selectedDate?.start_date,
      });
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
          image: item?.media?.[0]?.media_url ?? IMAGES.HOTEL_1,
          price: item?.price,
        }}
        onPressItem={onPressItem}
        priceContainerStyle={{
          justifyContent: 'flex-start',
        }}
        priceTitle={heading !== CATEGORY_NAMES.HOTELS ? 'Price - ' : ''}
        priceStyle={{
          color: heading !== CATEGORY_NAMES.HOTELS ? COLORS.SECONDARY : COLORS.DARK_GREY,
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
            onPressItem: () => {
              setShowCartButton(item);
            },
          })
        }
        onEndReached={() => {
          if (!isLoadingRef.current && hasMore) {
            fetchHotelRooms(roomListPage + 1);
          }
        }}
        contentContainerStyle={{ paddingBottom: 160 }}
      />
      {showCartButton && (
        <View
          style={{
            paddingVertical: 15,
            position: 'absolute',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            bottom: 0,
            left: 0,
            right: 0,
            ...STYLES.SHADOW,
          }}
        >
          <RowComponent
            onPress={() => {
              navigate(SCREENS.CART);
            }}
            style={{
              backgroundColor: COLORS.PRIMARY,
              marginHorizontal: 30,
              borderRadius: 10,
              padding: 10,
            }}
          >
            <View
              style={{
                padding: 10,
                backgroundColor: COLORS.WHITE,
                width: screenWidth(10),
                marginRight: 10,
                height: 40,
                borderRadius: 40,
                ...FLEX_CENTER,
              }}
            >
              <Typography
                style={{
                  color: COLORS.PRIMARY,

                  fontSize: FontSize.MediumSmall,
                }}
              >
                01
              </Typography>
            </View>
            <View style={{ width: screenWidth(50), ...FLEX_CENTER }}>
              <Typography
                style={{
                  fontSize: FontSize.MediumSmall,
                  textAlign: 'center',
                  color: COLORS.WHITE,
                }}
              >
                View your cart
              </Typography>
              <Typography
                numberOfLines={1}
                style={{
                  textAlign: 'center',
                  fontSize: FontSize.MediumSmall,
                  color: COLORS.WHITE,
                }}
              >
                {showCartButton?.name}
              </Typography>
            </View>
            <Typography
              style={{
                color: COLORS.WHITE,
              }}
            >
              {`$${Number(showCartButton?.price)?.toFixed(2)}`}
            </Typography>
          </RowComponent>
        </View>
      )}

      <ModalComponent
        position='center'
        modalVisible={showDatePickerModal}
        setModalVisible={setShowDatePickerModal}
        modalSecondaryContainerStyle={{
          gap: 20,
        }}
      >
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
