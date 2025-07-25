import { View, StyleSheet } from 'react-native';
import { Button, Icon, Photo, RowComponent, Typography } from 'components/common';
import { COLORS } from 'utils/colors';
import { STYLES } from 'utils/commonStyles';
import { FontSize, FontWeight } from 'types/fontTypes';
import { VARIABLES } from 'constants/common';
import { screenWidth } from 'utils/helpers';
import { openPhoneNumber, openUrl } from 'utils/linking';
import { CategoryItem } from 'types/responseTypes';
import StarRating from 'react-native-star-rating-widget';
import { toggleFavourite } from 'api/functions/app/home';
import { useState } from 'react';

export const BusinessCard = ({ data }: { data: CategoryItem }) => {
  const [isLiked, setIsLiked] = useState<boolean>(data?.is_liked);
  const vendorDetails = data?.vendor;
  return (
    <View style={styles.container}>
      <RowComponent style={styles.contentContainer}>
        <Photo
          source={vendorDetails?.business_logo ?? vendorDetails?.profile_image}
          imageStyle={styles.image}
        />
        <View style={styles.infoContainer}>
          <RowComponent style={styles.headerRow}>
            <Typography numberOfLines={1} style={styles.name}>
              {vendorDetails?.business_name ?? vendorDetails?.full_name}
            </Typography>
            <Icon
              componentName={VARIABLES.AntDesign}
              iconName={isLiked ? 'heart' : 'hearto'}
              size={20}
              color={isLiked ? COLORS.PRIMARY : COLORS.SECONDARY}
              onPress={() => {
                setIsLiked(!isLiked);
                toggleFavourite({
                  object_id: data?.id,
                  object_type: 'item',
                  category_id: data?.category_id,
                });
              }}
            />
          </RowComponent>

          {vendorDetails?.address && (
            <RowComponent style={styles.addressContainer}>
              <Icon
                componentName={VARIABLES.Ionicons}
                iconName='location-outline'
                size={FontSize.MediumSmall}
                color={COLORS.DARK_GREY}
              />
              <Typography style={styles.address} numberOfLines={1}>
                {vendorDetails?.address}
              </Typography>
            </RowComponent>
          )}

          {/* <RowComponent style={styles.statusRow}> */}
          {/* <Typography
              style={[
                styles.openStatus,
                { color: data?.is_available ? COLORS.SECONDARY : COLORS.BORDER },
              ]}
            >
              {data?.is_available ? 'OPEN' : 'CLOSED'}
            </Typography> */}
          {/* {data?.eventDetail?.event_date && (
              <>
                <Icon
                  componentName={VARIABLES.EvilIcons}
                  iconName='calendar'
                  size={FontSize.Medium}
                  color={COLORS.DARK_GREY}
                />
                <Typography style={styles.hours}>{data?.eventDetail?.event_date}</Typography>
              </>
            )} */}
          {/* </RowComponent> */}
          {vendorDetails?.bio && (
            <Typography style={styles.address} numberOfLines={2}>
              {vendorDetails?.bio}
            </Typography>
          )}

          <RowComponent style={styles.ratingContainer}>
            <StarRating
              emptyColor={COLORS.BORDER}
              rating={data?.rating_avg}
              starSize={13}
              color={COLORS.PRIMARY}
              starStyle={{
                marginLeft: -4,
              }}
              onChange={() => {}}
            />

            <Typography style={styles.ratingText}>
              {`${data?.rating_avg ?? '0.0'}  (${data?.rating_count} Ratings)`}
            </Typography>
          </RowComponent>
        </View>
      </RowComponent>
      {vendorDetails?.phone_number && (
        <RowComponent style={styles.buttonContainer}>
          <Button
            title='Call'
            onPress={() => {
              openPhoneNumber(vendorDetails?.phone_number);
            }}
            startIcon={{
              componentName: VARIABLES.Ionicons,
              iconName: 'call-outline',
              size: 20,
              color: COLORS.WHITE,
            }}
            style={styles.button}
            textStyle={styles.buttonText}
          />
          <Button
            title='Whatsapp'
            onPress={() => {
              openUrl(`https://wa.me/${data?.vendor?.whatsapp_number ?? ''}`);
            }}
            startIcon={{
              componentName: VARIABLES.FontAwesome,
              iconName: 'whatsapp',
              size: 20,
              color: COLORS.WHITE,
            }}
            style={styles.button}
            textStyle={styles.buttonText}
          />
        </RowComponent>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...STYLES.SHADOW,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  addressContainer: {
    gap: 4,
    justifyContent: 'flex-start',
  },
  contentContainer: {
    alignItems: 'flex-start',
    gap: 12,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 60,
    ...STYLES.SHADOW,
  },
  infoContainer: {
    flex: 1,
    gap: 4,
  },
  headerRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: FontSize.MediumLarge,
    fontWeight: FontWeight.Bold,
    color: COLORS.PRIMARY,
    flex: 1,
    marginRight: 8,
  },
  address: {
    fontSize: FontSize.Small,
    color: COLORS.DARK_GREY,
  },
  statusRow: {
    gap: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  openStatus: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.SemiBold,
  },
  button: {
    padding: 10,
    width: screenWidth(33),
  },
  buttonContainer: {
    gap: 20,
    marginTop: 10,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Medium,
    color: COLORS.WHITE,
  },
  hours: {
    fontSize: FontSize.Small,
    color: COLORS.DARK_GREY,
  },
  ratingContainer: {
    gap: 3,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingText: {
    fontSize: FontSize.Small,
    color: COLORS.DARK_GREY,
    marginLeft: 4,
  },
});
