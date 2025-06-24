import { View } from 'react-native';
import React from 'react';
import { FontSize } from 'types/fontTypes';
import { COLORS, screenHeight, screenWidth } from 'utils/index';
import { Icon, Photo, RowComponent, Typography } from 'components/index';
import { styles } from './Home/styles';
import { ItemType } from './Home';
import { VARIABLES } from 'constants/index';

export const FoodCard = ({ item }: { item: ItemType }) => {
  return (
    <View>
      <View style={[styles.itemContainer, { padding: 0, width: screenWidth(38) }]}>
        {/* <SkeletonLoader key={item?.name} height={screenHeight(25)}> */}
        <View>
          {item?.category && (
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
    </View>
  );
};
