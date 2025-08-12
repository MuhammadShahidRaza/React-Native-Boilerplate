import { TouchableOpacity, View } from 'react-native';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS, isIOS, screenHeight } from 'utils/index';
import {
  Icon,
  ItemCardData,
  Photo,
  RowComponent,
  SkeletonLoader,
  Typography,
} from 'components/index';
import { styles } from './Home/styles';
import { VARIABLES, SCREENS } from 'constants/index';
import { navigate } from 'navigation/index';
import { CATEGORY_NAMES } from 'types/responseTypes';
import { useState } from 'react';
import { toggleFavourite } from 'api/functions/app/home';
import { safeString } from '../../utils/helpers/functions';

export const ItemCard = ({ item, isItemFlow }: { item: ItemCardData; isItemFlow: boolean }) => {
  const [isLiked, setIsLiked] = useState<boolean>(item?.isLiked);
  const categoryName = item?.categoryName;
  const isEcommerce =
    categoryName === CATEGORY_NAMES.ORDER_YOUR_FOOD ||
    categoryName === CATEGORY_NAMES.GROCERY ||
    categoryName === CATEGORY_NAMES.FASHION ||
    categoryName === CATEGORY_NAMES.HEALTH ||
    categoryName === CATEGORY_NAMES.INTERIOR ||
    categoryName === CATEGORY_NAMES.ELECTRONICS;
  return (
    <SkeletonLoader key={item?.id} height={screenHeight(25)}>
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
            {item?.ratingAvg && (
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
                  {item?.ratingAvg}
                </Typography>
              </RowComponent>
            )}

            <Icon
              onPress={() => {
                setIsLiked(!isLiked);
                toggleFavourite({
                  object_id: item?.id,
                  object_type: 'item',
                  category_id: item?.categoryId,
                });
              }}
              componentName={VARIABLES.AntDesign}
              iconName={isLiked ? 'heart' : 'hearto'}
              color={isLiked ? COLORS.SECONDARY : COLORS.SECONDARY}
              size={FontSize.MediumLarge}
              iconStyle={styles.heartIcon}
            />
          </RowComponent>
          <Photo disabled imageStyle={styles.itemImage} source={item?.imageUrl} />
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
              {item?.city + ' - '}
            </Typography>
            <Typography
              numberOfLines={1}
              style={{ color: COLORS.DARK_GREY, fontSize: FontSize.Small }}
            >
              {item?.country}
            </Typography>
          </RowComponent>
          {item?.startTime && (
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
                {item?.startTime + ' - '}
              </Typography>
              <Typography
                numberOfLines={1}
                style={{ color: COLORS.DARK_GREY, fontSize: FontSize.Small }}
              >
                {item?.endTime}
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
                {safeString(String(item?.distance))}
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
