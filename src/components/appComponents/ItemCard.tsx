import { TouchableOpacity, View } from 'react-native';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS, isIOS, screenHeight } from 'utils/index';
import { Icon, Photo, RowComponent, SkeletonLoader, Typography } from 'components/index';
import { styles } from './Home/styles';
import { VARIABLES, SCREENS } from 'constants/index';
import { navigate } from 'navigation/index';
import { CategoryItem } from 'types/responseTypes';
import { useState } from 'react';
import { toggleFavourite } from 'api/functions/app/home';

export const ItemCard = ({ item }: { item: CategoryItem }) => {
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
        style={styles.itemContainer}
        onPress={() => {
          if (isEcommerce) {
            navigate(SCREENS.ECOMMERCE_DETAILS, { data: item, heading: categoryName });
            return;
          }
          navigate(SCREENS.DETAILS, { data: item, heading: categoryName });
        }}
      >
        <View>
          <RowComponent style={{ zIndex: 100 }}>
            {item?.rating_avg && (
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
                  {String(item?.rating_avg ?? '0.0')}
                </Typography>
              </RowComponent>
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
        <View
          style={{ paddingHorizontal: 10, paddingTop: 5, gap: isIOS() ? 4 : 2, overflow: 'hidden' }}
        >
          <Typography numberOfLines={1} style={styles.itemText}>
            {item?.title}
          </Typography>
          <RowComponent style={{ alignItems: 'center', justifyContent: 'flex-start', gap: 5 }}>
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
          {item?.eventDetail?.start_time && (
            <RowComponent style={{ alignItems: 'center', justifyContent: 'flex-start', gap: 10 }}>
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
                {item?.eventDetail?.start_time + ' - '}
              </Typography>
              <Typography
                numberOfLines={1}
                style={{ color: COLORS.DARK_GREY, fontSize: FontSize.Small }}
              >
                {item?.eventDetail?.end_time}
              </Typography>
            </RowComponent>
          )}
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
        </View>
        <Typography
          // onPress={() => navigate(SCREENS.DETAILS, { data: item, heading: categoryName })}
          numberOfLines={1}
          style={{
            color: COLORS.SECONDARY,
            fontWeight: FontWeight.SemiBold,
            textAlign: 'center',
            fontSize: FontSize.Small,
            marginTop: 5,
          }}
        >
          See Details
        </Typography>
      </TouchableOpacity>
    </SkeletonLoader>
  );
};
