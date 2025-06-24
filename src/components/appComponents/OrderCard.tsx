import { View, StyleSheet } from 'react-native';
import { Photo, Typography, RowComponent } from 'components/index';
import { COLORS } from 'utils/colors';
import { FontSize, FontWeight } from 'types/fontTypes';
import { screenWidth, screenHeight } from 'utils/helpers';
import { STYLES } from 'utils/commonStyles';

export interface OrderItem {
  id: number;
  image: string | number;
  name: string;
  price: string | number;
  item_name: string;
  created_at: string;
  status: string;
}

export const OrderCard = ({ item }: { item: OrderItem }) => {
  const statusColor = {
    Ordered: COLORS.GREEN_STATUS,
    Booked: COLORS.SECONDARY,
    Requested: COLORS.PRIMARY,
  };

  return (
    <RowComponent style={styles.card}>
      <RowComponent style={{ ...STYLES.GAP_10 }}>
        <Photo source={item?.image} imageStyle={styles.image} />
        <View style={styles.details}>
          <Typography numberOfLines={2} style={styles.name}>
            {item?.name}
          </Typography>
          <Typography numberOfLines={1} style={styles.date}>
            {item?.created_at}
          </Typography>
          <Typography numberOfLines={1} style={styles.itemName}>
            {item?.item_name}
          </Typography>
        </View>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.status,
              { backgroundColor: statusColor[item?.status as keyof typeof statusColor] },
            ]}
          >
            <Typography numberOfLines={1} style={styles.statusText}>
              {item?.status}
            </Typography>
          </View>
          <Typography numberOfLines={1} style={styles.price}>{`$${Number(item?.price)?.toFixed(
            2,
          )}`}</Typography>
        </View>
      </RowComponent>
    </RowComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 15,
    marginTop: 15,
    padding: 3,
    position: 'relative',
    ...STYLES.SHADOW,
  },
  image: {
    width: screenWidth(28),
    height: screenHeight(13),
    borderRadius: 10,
  },
  details: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontWeight: FontWeight.SemiBold,
    fontSize: FontSize.MediumSmall,
  },
  date: {
    fontSize: FontSize.Small,
    color: COLORS.DARK_GREY,
  },
  price: {
    fontWeight: FontWeight.SemiBold,
  },
  status: {
    borderRadius: 5,
  },
  statusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginRight: 5,
  },
  itemName: {
    fontSize: FontSize.MediumSmall,
    color: COLORS.DARK_GREY,
  },
  statusText: {
    fontSize: FontSize.Small,
    paddingHorizontal: 10,
    paddingVertical: 3,
    color: COLORS.WHITE,
  },
});
