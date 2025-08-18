import { useEffect, useState } from 'react';
import { COLORS, FLEX_CENTER, STYLES } from 'utils/index';
import {
  BusinessCard,
  FlatListComponent,
  SearchBar,
  Wrapper,
  ServiceCard,
  renderSeeAll,
  RowComponent,
  Typography,
  Icon,
} from 'components/index';
import { AppScreenProps, CATEGORY_NAMES } from 'types/index';
import { IMAGES, SCREENS, VARIABLES } from 'constants/index';
import {
  StyleSheet,
  StyleProp,
  TextStyle,
  ScrollView,
  ViewStyle,
  ImageStyle,
  View,
} from 'react-native';
import { FontSize, FontWeight } from 'types/fontTypes';
import { isIOS, safeString, screenHeight, screenWidth } from 'utils/helpers';
import { navigate } from 'navigation/index';
import { getVendorItemslist } from 'api/functions/app/home';

export const EcommerceDetails = ({ navigation, route }: AppScreenProps<typeof SCREENS.DETAILS>) => {
  const params = route?.params;
  const data = route?.params?.data;
  const [search, setSearch] = useState('');
  const [itemsList, setItemsList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAllData, setShowAllData] = useState(false);
  const fetchDetails = async () => {
    try {
      const response = await getVendorItemslist({ vendor_Id: data?.id, search });
      const categories = response?.item_categories?.result ?? [];
      const itemsAgainstCategories = response?.result ?? [];
      setCategories(categories);
      setItemsList(itemsAgainstCategories);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerTitle: params?.heading,
    });
    fetchDetails();
  }, []);

  const getPriceTitle = (data: any) => {
    if (data?.weight) return data.weight;
    if (data?.size) return data.size;
    if (data?.quantity) return data.quantity;
    if (data?.is_available === true) return 'In Stock';
    if (data?.is_available === false) return 'Out of Stock';
    return '';
  };
  const [showCartButton, setShowCartButton] = useState<any>(null);
  const renderServices = ({
    data,
    onPressItem,
    nameStyle,
    containerStyle,
    imageStyle,
  }: {
    data: {
      icon: string;
      name: string;
      price: string;
      currency: string;
      is_available?: boolean;
    };
    onPressItem?: (item: any) => void;
    nameStyle?: StyleProp<TextStyle>;
    containerStyle?: ViewStyle;
    imageStyle?: StyleProp<ImageStyle>;
  }) => {
    return (
      <ServiceCard
        item={{
          name: data?.name ?? data?.title,
          image: data?.icon ?? data?.media?.[0]?.media_url,
          price: data?.price,
          currency: data?.currency,
        }}
        onPressItem={onPressItem}
        nameStyle={nameStyle}
        containerStyle={containerStyle}
        imageStyle={imageStyle}
        priceTitle={getPriceTitle(data)}
        priceTitleStyle={{
          fontSize: FontSize.Small,
          color:
            data?.is_available === true
              ? COLORS.GREEN_STATUS
              : data?.is_available === false
              ? COLORS.RED
              : COLORS.PRIMARY,
        }}
      />
    );
  };

  const renderHorizontalItemsWithRow = ({
    data,
    heading,
    rowHeading,
    showSeeAll = false, //TODO: remove this oand open bottomn one 
    // showSeeAll = data?.length > 3 ? true : false,
    showAllData,
    nameStyle,
    numColumn,
    imageStyle,
    onPressItem,
    containerStyle,
  }: {
    data: any;
    heading: string;
    rowHeading: string;
    showSeeAll?: boolean;
    showAllData?: boolean;

    numColumn?: number;
    onPressItem?: (item: any) => void;
    nameStyle?: StyleProp<TextStyle>;
    containerStyle?: ViewStyle;
    imageStyle?: StyleProp<ImageStyle>;
  }) => {
    return (
      <>
        {renderSeeAll({
          heading: rowHeading,
          items: data ?? [],
          itemHeading: heading as any,
          showSeeAll,
          onPressViewAll: () => {
            navigate(SCREENS.VIEW_ALL_ECOMMERCE, {
              data: { items: data ?? [], headerTitle: params?.heading },
            });
          },
        })}
        <FlatListComponent
          horizontal={numColumn ? false : true}
          numColumns={numColumn}
          contentContainerStyle={styles.contentContainer}
          data={showAllData ? data : data?.slice(0, 3) ?? []}
          renderItem={({ item }) =>
            renderServices({
              data: item as any,
              onPressItem: onPressItem,
              containerStyle: containerStyle,
              nameStyle: nameStyle,
              imageStyle: imageStyle,
            })
          }
        />
      </>
    );
  };

  return (
    <Wrapper useSafeArea={false}>
      <BusinessCard data={data} />
      <SearchBar
        value={search}
        returnKeyType='search'
        onSubmitEditing={() => {
          fetchDetails();
        }}
        onChangeText={setSearch}
        secondContainerStyle={{ ...STYLES.SHADOW, ...STYLES.CONTAINER }}
        showBorder={false}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        {renderHorizontalItemsWithRow({
          data: categories,
          heading: VARIABLES.CATEGORIES,
          rowHeading: VARIABLES.CATEGORIES,
          showSeeAll: false,
          showAllData,
          numColumn: 3,
          nameStyle: {
            textAlign: 'center',
          },
          containerStyle: {
            borderRadius: 8,
            shadowColor:
              params?.heading == CATEGORY_NAMES.FASHION ? COLORS.TRANSPARENT : COLORS.BLACK,
          },
          imageStyle: {
            width: screenWidth(params?.heading == CATEGORY_NAMES.FASHION && isIOS() ? 36 : 26),
            height: screenHeight(params?.heading == CATEGORY_NAMES.FASHION ? 16 : 8),
          },
        })}
        {categories?.length > 3 && (
          <RowComponent
            onPress={() => {
              setShowAllData(!showAllData);
            }}
            style={{ justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 15 }}
          >
            <Icon
              iconName={showAllData ? 'chevron-up' : 'chevron-down'}
              size={25}
              componentName={VARIABLES.Entypo}
            />
            <Typography
              style={{
                fontSize: FontSize.MediumSmall,
                color: COLORS.PRIMARY,
                fontWeight: FontWeight.Bold,
              }}
            >
              {showAllData ? 'View Less Categories' : 'View All Categories'}
            </Typography>
          </RowComponent>
        )}

        <FlatListComponent
          data={itemsList}
          renderItem={({ item }) => {
            return (
              <>
                {renderHorizontalItemsWithRow({
                  data: item?.items,
                  heading: item?.name,
                  rowHeading: item?.name,
                  onPressItem: (item: any) => {
                    setShowCartButton(item);
                  },
                })}
              </>
            );
          }}
        />
      </ScrollView>
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
            <View style={{ width: screenWidth(40), ...FLEX_CENTER }}>
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
                fontSize: FontSize.MediumSmall,
              }}
            >
              {`${safeString(showCartButton?.price)} ${safeString(showCartButton?.currency)}`}
            </Typography>
          </RowComponent>
        </View>
      )}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 100,
  },
  contentContainer: {
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  tabBarContent: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 5,
  },
  tabButtonText: {
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.SemiBold,
  },
  tabContent: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontWeight: FontWeight.Bold,
    color: COLORS.PRIMARY,
    marginTop: 15,
    marginBottom: 10,
  },
  description: {
    color: COLORS.DARK_GREY,
  },
  infoDescription: {
    color: COLORS.PRIMARY,
    flex: 1,
  },
  reviewHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  ratingContainer: {
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: FontSize.ExtraLarge,
    fontWeight: FontWeight.Bold,
    color: COLORS.PRIMARY,
  },
  totalRatings: {
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.SemiBold,
    color: COLORS.DARK_GREY,
  },
  reviewButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 20,
  },
  reviewsList: {
    paddingBottom: 100,
  },
  photosGrid: {
    paddingBottom: 40,
  },
  photoContainer: {
    margin: 4,
    borderRadius: 8,
    ...STYLES.SHADOW,
  },
  photoGrid: {
    width: screenWidth(44),
    height: screenHeight(25),
    borderRadius: 8,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.BORDER,
    marginTop: 20,
  },
  infoRow: {
    alignItems: 'center',
    gap: 12,
    justifyContent: 'flex-start',
  },
  infoContainer: {
    gap: 15,
  },
  overallRatingContainer: { alignItems: 'center', gap: 8 },
  overallRating: {
    fontSize: FontSize.ExtraLarge,
    fontWeight: FontWeight.Bold,
    color: COLORS.PRIMARY,
  },
  ratingDistribution: {
    marginVertical: 10,
    gap: 8,
    width: screenWidth(55),
    paddingHorizontal: 5,
  },
  ratingRow: {
    gap: 8,
    alignItems: 'center',
  },
  ratingBarContainer: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.BORDER,
    overflow: 'hidden',
  },
  ratingBar: {
    height: '100%',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 3,
  },
  writeReviewContainer: {
    marginTop: 20,
    gap: 15,
  },
  writeReviewTitle: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
    color: COLORS.PRIMARY,
  },
  userReviewContainer: {
    gap: 15,
    alignItems: 'center',
  },
  reviewInput: {
    height: 100,
    width: '100%',
    padding: 10,
    textAlignVertical: 'top',
  },
  reviewsListContainer: {
    marginTop: 20,
  },
  reviewsTitle: {
    fontSize: FontSize.Large,
    fontWeight: FontWeight.Bold,
    color: COLORS.PRIMARY,
    marginBottom: 5,
  },
  reviewItem: {
    paddingVertical: 15,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  reviewerAvatarContainer: {
    borderRadius: 20,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Bold,
    color: COLORS.PRIMARY,
  },

  serviceName: {
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.Bold,
    color: COLORS.DARK_GREY,
  },
  servicePrice: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Bold,
    color: COLORS.DARK_GREY,
  },
  serviceContainer: {
    ...STYLES.SHADOW,
    padding: 10,
    gap: 5,
  },
});
