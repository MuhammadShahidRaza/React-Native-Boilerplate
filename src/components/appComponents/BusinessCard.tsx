import { View, StyleSheet } from 'react-native';
import { Button, Icon, Photo, RowComponent, Typography } from 'components/common';
import { COLORS } from 'utils/colors';
import { STYLES } from 'utils/commonStyles';
import { FontSize, FontWeight } from 'types/fontTypes';
import { VARIABLES } from 'constants/common';
import { ItemType } from './Home/index';
import { screenWidth } from 'utils/helpers';
import { openPhoneNumber, openUrl } from 'utils/linking';

export const BusinessCard = ({ data }: { data: ItemType }) => {
  return (
    <View style={styles.container}>
      <RowComponent style={styles.contentContainer}>
        <Photo source={data?.image} imageStyle={styles.image} />
        <View style={styles.infoContainer}>
          <RowComponent style={styles.headerRow}>
            <Typography numberOfLines={1} style={styles.name}>
              {data?.name}
            </Typography>
            <Icon
              componentName={VARIABLES.AntDesign}
              iconName={data?.isLiked ? 'heart' : 'hearto'}
              size={20}
              color={data?.isLiked ? COLORS.PRIMARY : COLORS.SECONDARY}
              onPress={() => {}}
            />
          </RowComponent>

          {data?.address && (
            <RowComponent style={styles.addressContainer}>
              <Icon
                componentName={VARIABLES.Ionicons}
                iconName='location-outline'
                size={14}
                color={COLORS.DARK_GREY}
              />
              <Typography style={styles.address} numberOfLines={1}>
                {data?.address}
              </Typography>
            </RowComponent>
          )}

          {data?.openTime && (
            <RowComponent style={styles.statusRow}>
              <Typography
                style={[
                  styles.openStatus,
                  { color: data?.isOpen ? COLORS.SECONDARY : COLORS.BORDER },
                ]}
              >
                {data?.isOpen ? 'OPEN' : 'CLOSED'}
              </Typography>
              {data?.openTime && <Typography style={styles.hours}>{data?.openTime}</Typography>}
            </RowComponent>
          )}
          {data?.description && (
            <Typography style={styles.address} numberOfLines={2}>
              {data?.description}
            </Typography>
          )}

          <RowComponent style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map(star => (
              <Icon
                key={star}
                componentName={VARIABLES.AntDesign}
                iconName='star'
                size={14}
                color={star <= Number(data?.rating ?? 4) ? COLORS.PRIMARY : COLORS.BORDER}
              />
            ))}
            <Typography style={styles.ratingText}>
              {`${data?.rating ?? '4.0'}  (${data?.totalRatings ?? '2'} Ratings)`}
            </Typography>
          </RowComponent>
        </View>
      </RowComponent>
      {data?.phoneNumber && (
        <RowComponent style={styles.buttonContainer}>
          <Button
            title='Call'
            onPress={() => {
              openPhoneNumber(data?.phoneNumber ?? '');
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
              openUrl(`https://wa.me/${data?.phoneNumber ?? ''}`);
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
