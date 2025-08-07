import { Icon, IconComponentMapping, RowComponent, Typography } from 'components/common';
import { VARIABLES } from 'constants/index';
import { Clipboard, ScrollView, StyleSheet, View } from 'react-native';
import { TextStyleType } from 'types/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { CategoryItem, Vendor } from 'types/responseTypes';
import { COLORS } from 'utils/colors';
import { STYLES } from 'utils/commonStyles';
import { formatEventDateTimeRange, screenHeight, screenWidth } from 'utils/helpers';
import { openUrl } from 'utils/linking';
const additionalInfoLine = ({
  iconName,
  title,
  componentName,
  iconNameRight,
  descriptionStyle,
  componentNameRight,
  rightIconStyle,
  isRightIcon = false,
  translate = true,
  onPressRightIcon,
}: {
  iconName: string;
  title: string;
  componentName: keyof typeof IconComponentMapping;
  isRightIcon?: boolean;
  descriptionStyle?: TextStyleType;
  iconNameRight?: string;
  translate?: boolean;
  rightIconStyle?: TextStyleType;
  componentNameRight?: keyof typeof IconComponentMapping;
  onPressRightIcon?: () => void;
}) => {
  return (
    <RowComponent style={styles.infoRow}>
      <Icon iconName={iconName} componentName={componentName} size={18} color={COLORS.PRIMARY} />
      <Typography translate={translate} style={[styles.infoDescription, descriptionStyle]}>
        {title}
      </Typography>
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

export const AboutSection = ({
  data,
  itemData,
  heading,
}: {
  data: Vendor;
  itemData: CategoryItem;
  heading: string;
}) => {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.photosGrid}>
      <View style={styles.tabContent}>
        <Typography style={styles.sectionTitle}>{`About ${heading}`}</Typography>
        <Typography style={styles.description}>
          {itemData?.description || 'No description available.'}
        </Typography>
        <View style={styles.divider} />
        {/* {itemData?.businessHours && (
          <>
            <Typography style={styles.sectionTitle}>Business Hours</Typography>
            <BusinessHours data={itemData?.businessHours} />
            <View style={styles.divider} />
          </>
        )} */}
        {heading === 'Events' && (
          <>
            <Typography style={styles.sectionTitle}>Event Start Date</Typography>
            <RowComponent style={{ justifyContent: 'flex-start', gap: 10 }}>
              <Icon
                iconName='calendar'
                componentName={VARIABLES.FontAwesome}
                color={COLORS.DARK_GREY}
              />
              <Typography style={styles.description}>
                {formatEventDateTimeRange({
                  date: itemData?.eventDetail?.date,
                  startTime: itemData?.eventDetail?.start_time,
                  endTime: itemData?.eventDetail?.end_time,
                })}
              </Typography>
            </RowComponent>

            <Typography style={styles.sectionTitle}>Tickets Price</Typography>
            <RowComponent style={{ justifyContent: 'flex-start', ...STYLES.GAP_5 }}>
              <Typography style={styles.description}>{itemData?.price}</Typography>
              <Typography style={styles.description}>{itemData?.currency}</Typography>
            </RowComponent>

            <View style={styles.divider} />
          </>
        )}

        <Typography style={styles.sectionTitle}>Additional Information</Typography>
        <View style={styles.infoContainer}>
          {data?.phone_number &&
            additionalInfoLine({
              iconName: 'phone',
              title: data?.phone_number,
              componentName: VARIABLES.Feather,
              isRightIcon: true,
              descriptionStyle: {
                flex: 0,
              },
              onPressRightIcon: () => {
                Clipboard.setString(data?.phone_number ?? '');
              },
              iconNameRight: 'copy',
              componentNameRight: VARIABLES.Feather,
            })}
          {data?.website_url &&
            additionalInfoLine({
              iconName: 'link-2',
              translate: false,
              title: data?.website_url,
              componentName: VARIABLES.Feather,
            })}
          {additionalInfoLine({
            iconName: 'location-outline',
            title: data?.address,
            componentName: VARIABLES.Ionicons,
            isRightIcon: true,
            iconNameRight: 'location-arrow',
            onPressRightIcon: () => {
              const lat = data?.latitude;
              const lng = data?.longitude;
              const url = `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${lat},${lng}&travelmode=driving`;
              openUrl(url);
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // reviewItem: {
  //   marginBottom: 10,
  //   paddingBottom: 15,
  //   borderBottomWidth: 1,
  //   borderColor: COLORS.BORDER,
  // },
  reviewItem: {
    paddingVertical: 15,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },

  reviewDescription: {
    fontSize: FontSize.MediumSmall,
    color: COLORS.PRIMARY,
    marginTop: 5,
  },
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
