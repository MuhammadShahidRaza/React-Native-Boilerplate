import { useEffect, useState } from 'react';
import { COLORS, openUrl, STYLES } from 'utils/index';
import {
  BusinessCard,
  Button,
  FlatListComponent,
  Icon,
  IconComponentMapping,
  Photo,
  RowComponent,
  SearchBar,
  Typography,
  Wrapper,
} from 'components/index';
import { AppScreenProps } from 'types/index';
import { SCREENS, VARIABLES } from 'constants/index';
import { View, StyleSheet, ScrollView, StyleProp, TextStyle, Clipboard } from 'react-native';
import { FontSize, FontWeight } from 'types/fontTypes';
import { renderReviews, reviewsList } from './Reviews';
import { IMAGES } from 'constants/assets';
import { isIOS, screenHeight, screenWidth } from 'utils/helpers';
import StarRating from 'react-native-star-rating-widget';
import { navigate } from 'navigation/index';

export const Details = ({ navigation, route }: AppScreenProps<typeof SCREENS.DETAILS>) => {
  const params = route?.params;
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState('About');
  useEffect(() => {
    navigation.setOptions({
      headerTitle: params?.heading,
    });
  }, []);

  const tabs = [
    { id: 1, name: 'About' },
    { id: 2, name: 'Gallery' },
    // { id: 3, name: 'Rooms' },
    { id: 4, name: 'Reviews' },
  ];

  const additionalInfoLine = ({
    iconName,
    title,
    componentName,
    iconNameRight,
    descriptionStyle,
    componentNameRight,
    rightIconStyle,
    isRightIcon = false,
    onPressRightIcon,
  }: {
    iconName: string;
    title: string;
    componentName: keyof typeof IconComponentMapping;
    isRightIcon?: boolean;
    descriptionStyle?: StyleProp<TextStyle>;
    iconNameRight?: string;
    rightIconStyle?: StyleProp<TextStyle>;
    componentNameRight?: keyof typeof IconComponentMapping;
    onPressRightIcon?: () => void;
  }) => {
    return (
      <RowComponent style={styles.infoRow}>
        <Icon iconName={iconName} componentName={componentName} size={18} color={COLORS.PRIMARY} />
        <Typography style={[styles.infoDescription, descriptionStyle]}>{title}</Typography>
        {isRightIcon && (
          <Icon
            iconName={iconNameRight ?? ''}
            componentName={componentNameRight ?? componentName}
            size={18}
            color={COLORS.BORDER}
            iconStyle={rightIconStyle}
            onPress={onPressRightIcon}
          />
        )}
      </RowComponent>
    );
  };

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

  const renderRatingBar = (percentage: number) => {
    return (
      <View style={styles.ratingBarContainer}>
        <View style={[styles.ratingBar, { width: `${percentage}%` }]} />
      </View>
    );
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'About':
        return (
          <View style={styles.tabContent}>
            <Typography style={styles.sectionTitle}>{`About ${params?.heading}`}</Typography>
            <Typography style={styles.description}>
              {params?.data?.description || 'No description available.'}
            </Typography>

            <View style={styles.divider} />
            <Typography style={styles.sectionTitle}>Additional Information</Typography>
            <View style={styles.infoContainer}>
              {params?.data?.telephone &&
                additionalInfoLine({
                  iconName: 'phone',
                  title: params?.data?.telephone,
                  componentName: VARIABLES.Feather,
                  isRightIcon: true,
                  descriptionStyle: {
                    flex: 0,
                  },
                  onPressRightIcon: () => {
                    Clipboard.setString(params?.data?.telephone ?? '');
                  },
                  iconNameRight: 'copy',
                  componentNameRight: VARIABLES.Feather,
                })}
              {params?.data?.website &&
                additionalInfoLine({
                  iconName: 'link-2',
                  title: params?.data?.website,
                  componentName: VARIABLES.Feather,
                })}
              {additionalInfoLine({
                iconName: 'location-outline',
                title: params?.data?.address,
                componentName: VARIABLES.Ionicons,
                isRightIcon: true,
                iconNameRight: 'location-arrow',
                onPressRightIcon: () => {
                  // openUrl(
                  //   isIOS()
                  //     ? `maps://maps.google.com/?q=${params?.data?.latitude},${params?.data?.longitude}`
                  //     : `https://www.google.com/maps/search/?api=1&query=${params?.data?.latitude},${params?.data?.longitude}`,
                  // );
                },
                rightIconStyle: {
                  backgroundColor: COLORS.PRIMARY,
                  padding: 10,
                  borderRadius: 10,
                  fontSize: FontSize.Large,
                  color: COLORS.WHITE,
                },
                componentNameRight: VARIABLES.FontAwesome,
              })}
            </View>
          </View>
        );
      case 'Reviews':
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.tabContent}>
              <RowComponent
                style={{
                  justifyContent: 'flex-start',
                  gap: 5,
                }}
              >
                <View style={styles.overallRatingContainer}>
                  <Typography style={styles.overallRating}>4.0</Typography>
                  <StarRating
                    emptyColor={COLORS.BORDER}
                    rating={4.0}
                    starSize={22}
                    color={COLORS.PRIMARY}
                    starStyle={{ marginLeft: -5 }}
                    onChange={() => {}}
                  />
                  <Typography style={styles.totalRatings}>(27)</Typography>
                </View>
                <View style={styles.ratingDistribution}>
                  {[5, 4, 3, 2, 1].map(stars => (
                    <RowComponent key={stars} style={styles.ratingRow}>
                      {renderRatingBar((100 / 5) * stars)}
                    </RowComponent>
                  ))}
                </View>
                <Icon
                  iconName='info'
                  componentName={VARIABLES.Feather}
                  size={16}
                  color={COLORS.BORDER}
                />
              </RowComponent>
              <RowComponent style={{ justifyContent: 'space-between', marginTop: 20 }}>
                <Typography style={styles.reviewsTitle}>Reviews</Typography>
                <RowComponent
                  onPress={() => {
                    navigate(SCREENS.ADD_REVIEW, {
                      isNotEditable: false,
                    });
                  }}
                  style={{ gap: 5 }}
                >
                  <Icon
                    iconName='plus'
                    componentName={VARIABLES.Feather}
                    size={16}
                    color={COLORS.SECONDARY}
                  />
                  <Typography style={styles.addReview}>Add Review</Typography>
                </RowComponent>
              </RowComponent>
              <FlatListComponent data={reviewsList} renderItem={renderReviews} />
            </View>
          </ScrollView>
        );
      case 'Gallery':
        return (
          <View style={styles.tabContent}>
            <FlatListComponent
              data={[1, 2, 3, 4, 5, 6]}
              numColumns={2}
              scrollEnabled={true}
              renderItem={() => (
                <Photo
                  source={params?.data?.image ?? IMAGES.HOTELS}
                  imageStyle={styles.photoGrid}
                  containerStyle={styles.photoContainer}
                />
              )}
              contentContainerStyle={styles.photosGrid}
            />
          </View>
        );
      case 'Rooms':
        return (
          <View style={styles.tabContent}>
            <Typography style={styles.sectionTitle}>Rooms</Typography>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Wrapper useSafeArea={false}>
      <BusinessCard data={params?.data} />
      <SearchBar
        value={search}
        onChangeText={setSearch}
        secondContainerStyle={{ ...STYLES.SHADOW, ...STYLES.CONTAINER }}
        showBorder={false}
      />

      <FlatListComponent
        horizontal
        data={tabs}
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
    paddingBottom: 100,
  },
  photoContainer: {
    margin: 4,
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
});
