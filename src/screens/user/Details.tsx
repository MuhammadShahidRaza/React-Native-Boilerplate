import { useEffect, useState } from 'react';
import { COLORS, FLEX_CENTER, STYLES } from 'utils/index';
import {
  BusinessCard,
  Button,
  FlatListComponent,
  Icon,
  RowComponent,
  Typography,
  Wrapper,
  ServiceCard,
} from 'components/index';
import { AppScreenProps } from 'types/index';
import { SCREENS, VARIABLES } from 'constants/index';
import { View, StyleSheet } from 'react-native';
import { FontSize, FontWeight } from 'types/fontTypes';
import { Reviews } from './Reviews';
import { screenHeight, screenWidth } from 'utils/helpers';
import { navigate } from 'navigation/index';
import { Gallery } from './Gallery';
import { AboutSection } from './AboutSection';

export const Details = ({ navigation, route }: AppScreenProps<typeof SCREENS.DETAILS>) => {
  const params = route?.params;

  const itemData = params?.data;
  const vendor = params?.data?.vendor;
  useEffect(() => {
    navigation.setOptions({
      headerTitle: params?.heading,
    });
  }, []);

  const getTabs = () => {
    if (params?.heading === 'SPA' || params?.heading === 'Saloons') {
      return [
        { id: 2, name: 'About' },
        { id: 1, name: 'Services' },
        { id: 3, name: 'Gallery' },
        { id: 5, name: 'Reviews' },
      ];
    } else if (params?.heading === 'Hotels') {
      return [
        { id: 1, name: 'About' },
        { id: 2, name: 'Gallery' },
        { id: 3, name: 'Rooms' },
        { id: 4, name: 'Reviews' },
      ];
    } else if (params?.heading === 'Events') {
      return [
        { id: 1, name: 'About' },
        { id: 2, name: 'Gallery' },
        { id: 3, name: 'Reviews' },
      ];
    } else {
      return [
        { id: 2, name: 'About' },
        { id: 3, name: 'Gallery' },
        { id: 5, name: 'Reviews' },
      ];
    }
  };

  const [selectedTab, setSelectedTab] = useState(getTabs()[0]?.name);
  const [showCartButton, setShowCartButton] = useState<any>(null);

  const renderTabItem = ({ item }: { item: { name: string } }) => {
    const isSelected = item.name === selectedTab;
    return (
      <Button
        title={item?.name}
        style={[
          styles.tabButton,
          {
            backgroundColor: isSelected ? COLORS.PRIMARY : COLORS.WHITE,
          },
        ]}
        textStyle={[
          styles.tabButtonText,
          {
            color: isSelected ? COLORS.WHITE : COLORS.BORDER,
          },
        ]}
        onPress={() => setSelectedTab(item.name)}
      />
    );
  };
  const renderServices = ({
    item,
    onPressItem,
  }: {
    item: { image: string; name: string; price: string; description?: string; icon?: boolean };
    onPressItem?: (item: any) => void;
  }) => {
    return (
      <ServiceCard
        item={item}
        onPressItem={onPressItem}
        priceContainerStyle={{
          justifyContent: 'flex-start',
        }}
        priceTitle={params?.heading !== 'Hotels' ? 'Price - ' : ''}
        priceStyle={{
          color: params?.heading !== 'Hotels' ? COLORS.SECONDARY : COLORS.DARK_GREY,
        }}
      />
    );
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'About':
        return <AboutSection data={vendor} itemData={itemData} heading={params?.heading} />;
      case 'Reviews':
        return <Reviews data={vendor} itemData={itemData} />;
      case 'Gallery':
        return <Gallery data={vendor} itemData={itemData} />;
      case 'Rooms':
        return (
          <View style={styles.tabContent}>
            <RowComponent>
              <RowComponent
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
                  <Typography>Thurs, Apr 18</Typography>
                </View>
              </RowComponent>
              <RowComponent
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
                  <Typography>Fri, Apr 19</Typography>
                </View>
              </RowComponent>
            </RowComponent>
            <FlatListComponent
              data={itemData?.rooms ?? []}
              numColumns={2}
              scrollEnabled={true}
              renderItem={({ item }) =>
                renderServices({
                  item,
                  onPressItem: () => {
                    setShowCartButton(item);
                  },
                })
              }
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
          </View>
        );
      case 'Services':
        return (
          <View style={styles.tabContent}>
            <FlatListComponent
              data={itemData?.services ?? []}
              numColumns={2}
              scrollEnabled={true}
              renderItem={renderServices}
              contentContainerStyle={styles.photosGrid}
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Wrapper useSafeArea={false}>
      <BusinessCard data={itemData} />
      <FlatListComponent
        horizontal
        data={getTabs()}
        renderItem={renderTabItem}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      />
      {renderTabContent()}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    marginBottom: 10,
    marginHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'center',
    width: 'auto',
    ...STYLES.SHADOW,
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
  reviewDate: {
    fontSize: FontSize.Small,
    color: COLORS.DARK_GREY,
  },
  reviewText: {
    fontSize: FontSize.Medium,
    color: COLORS.DARK_GREY,
    lineHeight: 20,
  },
  addReview: {
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.Bold,
    color: COLORS.SECONDARY,
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
