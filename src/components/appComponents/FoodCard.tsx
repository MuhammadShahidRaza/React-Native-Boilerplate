import { TouchableOpacity, View } from 'react-native';
import { FontSize } from 'types/fontTypes';
import { COLORS, screenHeight, screenWidth } from 'utils/index';
import { Icon, Photo, Typography } from 'components/index';
import { styles } from './Home/styles';
import { SCREENS, VARIABLES } from 'constants/index';
import { navigate } from 'navigation/index';
import { CategoryItem } from 'types/responseTypes';

export const FoodCard = ({ item }: { item: CategoryItem }) => {
  const categoryName = item?.itemCategory?.category?.title;
  const isFood = categoryName === 'Order Your Food';
  return (
    <TouchableOpacity
      activeOpacity={isFood ? 0.5 : 1}
      onPress={() => {
        if (isFood) {
          navigate(SCREENS.ECOMMERCE_DETAILS, { data: item, heading: categoryName });
        }
      }}
    >
      <View style={[styles.itemContainer, { padding: 0, width: screenWidth(38) }]}>
        {/* <SkeletonLoader key={item?.name} height={screenHeight(25)}> */}
        <View>
          {categoryName && (
            <Icon
              onPress={() => {}}
              componentName={VARIABLES.AntDesign}
              iconName={item?.is_liked ? 'heart' : 'hearto'}
              color={item?.is_liked ? COLORS.SECONDARY : COLORS.SECONDARY}
              size={FontSize.MediumLarge}
              iconStyle={styles.heartIcon}
            />
          )}
          <Photo
            disabled
            imageStyle={[
              styles.itemImage,
              {
                width: screenWidth(38),
                height: screenHeight(18),
              },
            ]}
            source={item?.image}
          />
        </View>
      </View>
      <Typography
        numberOfLines={1}
        style={[styles.itemText, { textAlign: 'center', marginTop: 10 }]}
      >
        {item?.name}
      </Typography>
      {/* // </SkeletonLoader> */}
    </TouchableOpacity>
  );
};
