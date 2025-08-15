import { TouchableOpacity, View } from 'react-native';
import { FontSize } from 'types/fontTypes';
import { COLORS, screenHeight, screenWidth } from 'utils/index';
import { Icon, ItemCardData, Photo, Typography } from 'components/index';
import { styles } from './Home/styles';
import { SCREENS, VARIABLES } from 'constants/index';
import { navigate } from 'navigation/index';

export const FoodCard = ({ item, isCategory }: { item: ItemCardData; isCategory: boolean }) => {
  const categoryName = item?.categoryName;
  return (
    <TouchableOpacity
      activeOpacity={!isCategory ? 0.5 : 1}
      onPress={() => {
        if (!isCategory) {
          navigate(SCREENS.ECOMMERCE_DETAILS, { data: item, heading: categoryName });
        }
      }}
    >
      <View
        style={[
          styles.itemContainer,
          { padding: 0, width: screenWidth(38), height: screenHeight(18) },
        ]}
      >
        {/* <SkeletonLoader key={item?.name} height={screenHeight(25)}> */}
        <View>
          {categoryName && (
            <Icon
              onPress={() => {}}
              componentName={VARIABLES.AntDesign}
              iconName={item?.isLiked ? 'heart' : 'hearto'}
              color={item?.isLiked ? COLORS.SECONDARY : COLORS.SECONDARY}
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
            source={item?.imageUrl}
          />
        </View>
      </View>
      <Typography
        numberOfLines={1}
        style={[styles.itemText, { textAlign: 'center', marginTop: 10 }]}
      >
        {item?.title}
      </Typography>
      {/* // </SkeletonLoader> */}
    </TouchableOpacity>
  );
};
