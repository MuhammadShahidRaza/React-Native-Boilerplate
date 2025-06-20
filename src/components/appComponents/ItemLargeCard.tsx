import { TouchableOpacity, View } from 'react-native';
import React from 'react';
import { Icon, Photo, RowComponent, SkeletonLoader, Typography } from 'components/index';
import { ItemType } from './Home';
import { VARIABLES, SCREENS } from 'constants/index';
import { navigate } from 'navigation/index';
import { StyleSheet } from 'react-native';
import { FontSize, FontWeight } from 'types/index';
import { COLORS, isIOS, screenHeight, screenWidth, STYLES } from 'utils/index';

export const ItemLargeCard = ({
  item,
  showCategory = false,
}: {
  item: ItemType;
  showCategory?: boolean;
}) => {
  return (
    <SkeletonLoader key={item?.name} height={screenHeight(25)}>
      <TouchableOpacity
        onPress={() => navigate(SCREENS.DETAILS, { data: item, heading: item?.category })}
        style={styles.itemContainer}
      >
        <View>
          <RowComponent style={{ zIndex: 100 }}>
            {showCategory && (
              <View
                style={{
                  backgroundColor: COLORS.DARK_BLACK_OPACITY,
                  paddingHorizontal: 25,
                  position: 'absolute',
                  paddingVertical: 5,
                  top: 1,
                  left: -3,
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 20,
                  borderTopLeftRadius: 15,
                  borderTopRightRadius: 0,
                }}
              >
                <Typography numberOfLines={1} style={{ color: COLORS.WHITE,fontWeight:FontWeight.SemiBold }}>
                  {item?.category}
                </Typography>
              </View>
            )}
            <Icon
              onPress={() => {}}
              componentName={VARIABLES.AntDesign}
              iconName={item?.isLiked ? 'heart' : 'hearto'}
              color={item?.isLiked ? COLORS.SECONDARY : COLORS.SECONDARY}
              size={FontSize.MediumLarge}
              iconStyle={styles.heartIcon}
            />
          </RowComponent>
          <Photo disabled imageStyle={styles.itemImage} source={item?.image} />
        </View>
        <View style={{ paddingHorizontal: 10, paddingVertical: 12, gap: isIOS() ? 5 : 3 }}>
          <RowComponent>
            <Typography numberOfLines={1} style={styles.itemText}>
              {item?.name}
            </Typography>
            {item?.openTime && (
              <RowComponent style={{ alignItems: 'center', justifyContent: 'flex-start', gap: 10 }}>
                <Typography
                  numberOfLines={1}
                  style={{
                    color: COLORS.SECONDARY,
                    fontSize: FontSize.Small,
                    fontWeight: FontWeight.SemiBold,
                  }}
                >
                  {item?.isOpen ? 'OPEN' : 'CLOSED'}
                </Typography>
                <Typography
                  numberOfLines={1}
                  style={{ color: COLORS.DARK_GREY, fontSize: FontSize.Small }}
                >
                  {item?.openTime}
                </Typography>
              </RowComponent>
            )}
          </RowComponent>

          <Typography
            numberOfLines={1}
            style={{ color: COLORS.DARK_GREY, fontSize: FontSize.MediumSmall }}
          >
            {item?.address}
          </Typography>
          <RowComponent>
            {item?.distance && (
              <RowComponent
                style={{
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  gap: 5,
                  paddingHorizontal: -20,
                  marginLeft: -3,
                }}
              >
                <Icon
                  componentName={VARIABLES.EvilIcons}
                  iconName={'location'}
                  size={FontSize.MediumLarge}
                  iconStyle={{ color: COLORS.DARK_GREY }}
                />
                <Typography
                  numberOfLines={1}
                  style={{ color: COLORS.DARK_GREY, fontSize: FontSize.Small }}
                >
                  {item?.distance}
                </Typography>
              </RowComponent>
            )}

            {!item?.rating && (
              <RowComponent style={styles.ratingContainer}>
                <Icon
                  onPress={() => {}}
                  componentName={VARIABLES.AntDesign}
                  iconName={'star'}
                  color={COLORS.WHITE}
                  iconStyle={{ marginBottom: 2 }}
                  size={FontSize.ExtraSmall}
                />

                <Typography style={{ color: COLORS.WHITE, fontSize: FontSize.ExtraSmall }}>
                  {item?.rating ?? '4.2' + ' Rating'}
                </Typography>
              </RowComponent>
            )}
          </RowComponent>
        </View>
      </TouchableOpacity>
    </SkeletonLoader>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    ...STYLES.SHADOW,
    paddingHorizontal: 5,
    marginVertical: 10,
    borderRadius: 20,
    width: screenWidth(90),
  },
  itemImage: {
    height: screenHeight(22),
    borderRadius: 20,
    width: screenWidth(89),
  },
  itemText: {
    color: COLORS.PRIMARY,
    fontSize: FontSize.MediumSmall,
    fontWeight: FontWeight.Bold,
  },
  heartIcon: {
    position: 'absolute',
    top: 15,
    right: 5,
    zIndex: 100,
    backgroundColor: COLORS.WHITE_OPACITY,
    padding: 8,
    borderRadius: 100,
    borderWidth: 0.5,
    borderColor: COLORS.SECONDARY,
  },
  ratingContainer: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 3,
    gap: 5,
    borderRadius: 30,
  },
});
