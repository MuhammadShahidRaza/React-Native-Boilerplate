import { View, StyleSheet } from 'react-native';
import { Photo, Typography, Icon, RowComponent } from 'components/index';
import { COLORS } from 'utils/colors';
import { FontSize, FontWeight } from 'types/fontTypes';
import { screenWidth, screenHeight } from 'utils/helpers';
import { STYLES } from 'utils/commonStyles';

interface CartItemCardProps {
  image: string | number;
  name: string;
  type: string;
  price: string | number;
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onDelete: () => void;
}

export const CartItemCard = ({
  image,
  name,
  type,
  price,
  quantity,
  onIncrease,
  onDecrease,
  onDelete,
}: CartItemCardProps) => {
  return (
    <RowComponent style={styles.card}>
      <Icon
        iconName='delete'
        componentName='MaterialIcons'
        size={22}
        iconStyle={styles.deleteIcon}
        color={COLORS.ERROR}
        onPress={onDelete}
      />
      <RowComponent style={{ ...STYLES.GAP_15 }}>
        <Photo source={image} imageStyle={styles.image} />
        <View style={styles.details}>
          <Typography style={styles.name}>{name}</Typography>
          <Typography style={styles.type}>{type}</Typography>
          <Typography style={styles.price}>{`$${Number(price)?.toFixed(2)}`}</Typography>
        </View>
        <View style={styles.qtyContainer}>
          <Icon
            iconName='plus'
            componentName='Feather'
            iconStyle={styles.qtyBtn}
            onPress={onIncrease}
          />
          <Typography style={styles.qtyText}>{String(quantity)}</Typography>
          <Icon
            iconName='minus'
            componentName='Feather'
            iconStyle={styles.qtyBtn}
            onPress={onDecrease}
          />
        </View>
      </RowComponent>
    </RowComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 15,
    marginTop: 20,
    marginHorizontal: 20,
    padding: 12,
    position: 'relative',
    ...STYLES.SHADOW,
  },
  deleteIcon: {
    position: 'absolute',
    top: -15,
    right: -15,
    zIndex: 10,
    borderRadius: 20,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...STYLES.SHADOW,
  },
  image: {
    width: screenWidth(25),
    height: screenHeight(10),
    borderRadius: 10,
  },
  details: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontWeight: FontWeight.SemiBold,
  },
  type: {
    fontSize: FontSize.MediumSmall,
    color: COLORS.DARK_GREY,
  },
  price: {
    fontWeight: FontWeight.SemiBold,
  },
  qtyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: COLORS.LIGHT_WHITE,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 6,
    marginRight: 5,
  },
  qtyBtn: {
    padding: 3,
  },
  qtyText: {
    fontSize: FontSize.Medium,
    fontWeight: FontWeight.Bold,
    color: COLORS.PRIMARY,
    marginVertical: 2,
  },
});
