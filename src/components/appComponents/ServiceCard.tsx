import {
  View,
  StyleSheet,
  StyleProp,
  TextStyle,
  ImageStyle,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { COLORS, isIOS, safeString, screenHeight, screenWidth, STYLES } from 'utils/index';
import { Icon, Photo, RowComponent, Typography } from 'components/index';
import { FontSize, FontWeight } from 'types/fontTypes';
import { VARIABLES } from 'constants/common';

export const ServiceCard = ({
  item,
  onPressItem,
  nameStyle,
  containerStyle,
  imageStyle,
  priceTitle,
  priceStyle,
  priceTitleStyle,
  priceContainerStyle,
}: {
  item: { image: string; name: string; price: string; description?: string; icon?: boolean };
  onPressItem?: (item: any) => void;
  nameStyle?: StyleProp<TextStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  containerStyle?: ViewStyle;
  priceContainerStyle?: ViewStyle;
  priceTitle?: string;
  currency?: string;
  priceStyle?: TextStyle;
  priceTitleStyle?: StyleProp<TextStyle>;
}) => {
  return (
    <View
      style={{
        marginBottom: 10,
        margin: 4,
        borderRadius: 10,
        padding: 3,
        ...STYLES.SHADOW,
        ...containerStyle,
      }}
    >
      <View style={styles.serviceImageContainer}>
        <Photo source={item?.image} imageStyle={[styles.photoGrid, imageStyle]} />
        {onPressItem && (
          <TouchableOpacity
            onPress={() => onPressItem(item)}
            style={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              borderWidth: 1,
              zIndex: 100,
              borderColor: COLORS.PRIMARY,
              padding: 2,
              backgroundColor: COLORS.WHITE_OPACITY,
              borderRadius: 50,
            }}
          >
            <Icon
              iconName='add'
              componentName={VARIABLES.Ionicons}
              size={30}
              // iconStyle={}
              color={COLORS.PRIMARY}
            />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.serviceInfoContainer}>
        <Typography numberOfLines={1} style={[styles.serviceName, nameStyle]}>
          {item?.name}
        </Typography>
        {item?.description && (
          <RowComponent style={styles.servicePriceContainer}>
            {item?.icon && (
              <Icon
                iconName='bed-outline'
                componentName={VARIABLES.Ionicons}
                iconStyle={{ marginBottom: isIOS() ? 0 : 3 }}
                color={COLORS.DARK_GREY}
              />
            )}
            <Typography numberOfLines={1} style={styles.serviceDescription}>
              {item?.description}
            </Typography>
          </RowComponent>
        )}
        {item?.price && (
          <RowComponent
            style={{
              justifyContent: priceTitle ? 'space-between' : 'flex-end',
              ...priceContainerStyle,
            }}
          >
            {priceTitle && <Typography style={priceTitleStyle}>{priceTitle}</Typography>}
            <Typography style={{ ...styles.servicePrice, ...priceStyle }}>{`${safeString(
              item?.price,
            )} USD`}</Typography>
          </RowComponent>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  serviceName: {
    fontWeight: FontWeight.SemiBold,
    fontSize: FontSize.MediumSmall,
    maxWidth: screenWidth(39),
  },
  photoGrid: {
    width: screenWidth(42),
    height: screenHeight(18),
    borderRadius: 8,
  },
  servicePrice: {
    fontWeight: FontWeight.SemiBold,
    color: COLORS.PRIMARY,
  },
  serviceDescription: {
    color: COLORS.DARK_GREY,
  },
  servicePriceContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 10,
  },
  serviceInfoContainer: {
    padding: 5,
  },
  serviceImageContainer: {
    position: 'relative',
  },
});
