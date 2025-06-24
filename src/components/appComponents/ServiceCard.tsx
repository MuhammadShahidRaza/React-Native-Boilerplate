import { View, StyleSheet } from 'react-native';
import React from 'react';
import { COLORS, isIOS, screenHeight, screenWidth, STYLES } from 'utils/index';
import { Icon, Photo, RowComponent, Typography } from 'components/index';
import { FontSize, FontWeight } from 'types/fontTypes';
import { VARIABLES } from 'constants/common';

export const ServiceCard = ({
  item,
  onPressItem,
}: {
  item: { image: string; name: string; price: string; description?: string; icon?: boolean };
  onPressItem?: (item: any) => void;
}) => {
  return (
    <View style={{ ...STYLES.SHADOW, marginBottom: 10, margin: 4, borderRadius: 10, padding: 3 }}>
      <View style={styles.serviceImageContainer}>
        <Photo source={item?.image} imageStyle={styles.photoGrid} />
        {onPressItem && (
          <Icon
            onPress={() => onPressItem(item)}
            iconName='add'
            componentName={VARIABLES.Ionicons}
            size={30}
            iconStyle={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              borderWidth: 1,
              zIndex: 100,
              borderColor: COLORS.PRIMARY,
              padding: 2,
              backgroundColor: COLORS.WHITE_OPACITY,
              borderRadius: 30,
            }}
            color={COLORS.PRIMARY}
          />
        )}
      </View>
      <View style={styles.serviceInfoContainer}>
        <Typography numberOfLines={1} style={styles.serviceName}>
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
        <RowComponent style={styles.servicePriceContainer}>
          <Typography>Price</Typography>
          <Typography>-</Typography>
          <Typography style={styles.servicePrice}>{`$${item?.price}`}</Typography>
        </RowComponent>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  serviceName: {
    fontWeight: FontWeight.SemiBold,
    fontSize: FontSize.MediumSmall,
    width: screenWidth(39),
  },
  photoGrid: {
    width: screenWidth(42),
    height: screenHeight(18),
    borderRadius: 8,
  },
  servicePrice: {
    fontWeight: FontWeight.SemiBold,
    color: COLORS.SECONDARY,
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
