import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography, RowComponent } from 'components/index';
import { COLORS } from 'utils/colors';
import { FontSize } from 'types/fontTypes';
import { IMAGES } from 'constants/assets';

interface BookingCardProps {
  id: string;
  name: string;
  date?: string;
  time?: string;
  location?: string;
  price?: string;
  rating?: number;
  status?: 'Active' | 'Cancelled' | 'Completed';
  image: any;
  onPress:()=>void;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  name,
  date,
  time,
  location,
  price,
  rating,
  status,
  image,
  onPress
}) => {
  return (
    <View style={styles.card}>
      <Image source={image} style={styles.image} resizeMode="stretch" />
      <View style={styles.cardContent}>
        <RowComponent style={styles.rowSpaceBetween}>
          <Typography style={styles.title}>{name}</Typography>
          {rating && <Typography style={styles.content}>⭐ {rating}</Typography>}
        </RowComponent>

        <Typography style={styles.content}>Service Name: {name}</Typography>
        {date ? <Typography style={styles.content}>Date: {date}</Typography> : null}
        <Typography style={styles.content}>{time ? `Time: ${time}` : ' '}</Typography>

        <RowComponent style={styles.rowSpaceBetween}>
          {location && (
            <RowComponent style={{ alignItems: 'center' }}>
              <Image source={IMAGES.LOCATION_ICON} style={styles.iconSmall} resizeMode="contain" />
              <Typography style={styles.locationText}>{location}</Typography>
            </RowComponent>
          )}

          {status && (
            <RowComponent style={{ alignItems: 'center' }}>
              <Typography style={[styles.content, { marginEnd: 2 }]}>Status: {status}</Typography>
              {status === 'Active' && (
                <Image source={IMAGES.ACTIVE_ICON} resizeMode="contain" style={styles.statusIcon} />
              )}
              {status === 'Cancelled' && (
                <Image source={IMAGES.CANCEL_ICON} resizeMode="contain" style={styles.statusIcon} />
              )}
            </RowComponent>
          )}

          {price && (
            <RowComponent>
              <Image source={IMAGES.CURRENCY_NOTE} style={styles.priceIcon} resizeMode="contain" />
              <Typography style={styles.locationText}>{price}</Typography>
            </RowComponent>
          )}

          {status !== 'Cancelled' && (
            <TouchableOpacity onPress={onPress}>
              <Typography style={styles.viewMore}>View More</Typography>
            </TouchableOpacity>
          )}
        </RowComponent>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE_OPACITY,
    padding: 8,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  image: {
    width: 119,
    height: 91,
    borderRadius: 8,
    marginRight: 10,
  },
  cardContent: {
    flex: 1,
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.Medium,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  content: {
    fontSize: FontSize.Small,
    fontWeight: '400',
  },
  locationText: {
    fontSize: FontSize.Small,
    fontWeight: '400',
  },
  iconSmall: {
    height: 14,
    width: 14,
    marginEnd: 5,
    marginBottom: 3,
  },
  statusIcon: {
    marginBottom: 2,
    height: 14,
    width: 16,
  },
  priceIcon: {
    height: 16,
    width: 14,
    marginEnd: 5,
  },
  viewMore: {
    color: COLORS.PURPLE,
    fontWeight: 'bold',
    fontSize: FontSize.Small,
    textDecorationLine: 'underline',
    paddingLeft: 8,
  },
});
