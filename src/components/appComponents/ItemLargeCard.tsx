import { TouchableOpacity, View } from 'react-native';
import { Icon, Photo, RowComponent, SkeletonLoader, Typography } from 'components/index';
import { VARIABLES, SCREENS } from 'constants/index';
import { navigate } from 'navigation/index';
import { StyleSheet } from 'react-native';
import { CategoryItem, FontSize, FontWeight } from 'types/index';
import { COLORS, isIOS, screenHeight, screenWidth, STYLES } from 'utils/index';
import { useState } from 'react';
import { toggleFavourite } from 'api/functions/app/home';

export const ItemLargeCard = ({
  item,
  showCategory = false,
}: {
  item: CategoryItem;
  showCategory?: boolean;
}) => {
  const [isLiked, setIsLiked] = useState<boolean>(item?.is_liked);
  const categoryName = item?.itemCategory?.category?.title;
  const isEcommerce =
    categoryName === 'Order Your Food' ||
    categoryName === 'Grocery' ||
    categoryName === 'Fashion' ||
    categoryName === 'Health' ||
    categoryName === 'Interior' ||
    categoryName === 'Electronics';

  return (
    <SkeletonLoader key={item?.title} height={screenHeight(25)}>
      <TouchableOpacity
        onPress={() => {
          if (isEcommerce) {
            navigate(SCREENS.ECOMMERCE_DETAILS, { data: item, heading: categoryName });
            return;
          }
          navigate(SCREENS.DETAILS, { data: item, heading: categoryName });
        }}
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
                <Typography
                  numberOfLines={1}
                  style={{ color: COLORS.WHITE, fontWeight: FontWeight.SemiBold }}
                >
                  {categoryName}
                </Typography>
              </View>
            )}
            <Icon
              onPress={() => {
                setIsLiked(!isLiked);
                toggleFavourite({
                  object_id: item?.id,
                  object_type: 'item',
                  category_id: item?.category_id,
                });
              }}
              componentName={VARIABLES.AntDesign}
              iconName={isLiked ? 'heart' : 'hearto'}
              color={isLiked ? COLORS.SECONDARY : COLORS.SECONDARY}
              size={FontSize.MediumLarge}
              iconStyle={styles.heartIcon}
            />
          </RowComponent>
          <Photo disabled imageStyle={styles.itemImage} source={item?.media?.[0]?.media_url} />
        </View>
        <View style={{ paddingHorizontal: 10, paddingVertical: 12, gap: isIOS() ? 3 : 3 }}>
          <RowComponent>
            <Typography numberOfLines={1} style={styles.itemText}>
              {item?.title}
            </Typography>
            {item?.eventDetail?.start_time && (
              <RowComponent style={{ alignItems: 'center', justifyContent: 'flex-start', gap: 5 }}>
                {/* <Typography
                  numberOfLines={1}
                  style={{
                    color: COLORS.SECONDARY,
                    fontSize: FontSize.Small,
                    fontWeight: FontWeight.SemiBold,
                  }}
                >
                  {item?.isOpen ? 'OPEN' : 'CLOSED'}
                </Typography> */}
                <Typography
                  numberOfLines={1}
                  style={{ color: COLORS.DARK_GREY, fontSize: FontSize.Small }}
                >
                  {new Date(item?.eventDetail?.date)?.toLocaleDateString()}
                </Typography>
                <Typography
                  numberOfLines={1}
                  style={{ color: COLORS.DARK_GREY, fontSize: FontSize.Small }}
                >
                  {item?.eventDetail?.start_time + '  -'}
                </Typography>
                <Typography
                  numberOfLines={1}
                  style={{ color: COLORS.DARK_GREY, fontSize: FontSize.Small }}
                >
                  {item?.eventDetail?.end_time}
                </Typography>
              </RowComponent>
            )}
          </RowComponent>

          <RowComponent
            style={{
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: 5,
            }}
          >
            <Typography
              numberOfLines={1}
              style={{ color: COLORS.DARK_GREY, fontSize: FontSize.Small }}
            >
              {item?.eventDetail?.city + ' - '}
            </Typography>
            <Typography
              numberOfLines={1}
              style={{ color: COLORS.DARK_GREY, fontSize: FontSize.Small }}
            >
              {item?.eventDetail?.country}
            </Typography>
          </RowComponent>
          {/* <Typography
            numberOfLines={1}
            style={{ color: COLORS.DARK_GREY, fontSize: FontSize.MediumSmall }}
          >
            {"item?.address"}
          </Typography> */}
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

            {!item?.rating_avg && (
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
                  {String(item?.rating_avg ?? '0.0') + ' Rating'}
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
    flex: 1,
    marginRight: 15,
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
    paddingVertical: 3,
    gap: 5,
    borderRadius: 30,
  },
});
