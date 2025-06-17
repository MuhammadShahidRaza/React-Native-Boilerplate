import { View } from 'react-native';
import React from 'react';
import { FontSize, FontWeight } from 'types/fontTypes';
import { COLORS, isIOS, screenHeight } from 'utils/index';
import { Icon, Photo, RowComponent, SkeletonLoader, Typography } from 'components/index';
import { styles } from './Home/styles';
import { ItemType } from './Home';
import { VARIABLES, SCREENS } from 'constants/index';
import { navigate } from 'navigation/index';

export const ItemCard = ({ item }: { item: ItemType }) => {
  return (
    <SkeletonLoader key={item?.name} height={screenHeight(25)}>
      <View style={styles.itemContainer}>
        <View>
          <RowComponent style={{ zIndex: 100 }}>
            {item?.rating && (
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
                  {item?.rating}
                </Typography>
              </RowComponent>
            )}

            <Icon
              onPress={() => {}}
              componentName={VARIABLES.AntDesign}
              iconName={item?.isLiked ? 'heart' : 'hearto'}
              color={item?.isLiked ? COLORS.PRIMARY : COLORS.SECONDARY}
              size={FontSize.MediumLarge}
              iconStyle={styles.heartIcon}
            />
          </RowComponent>
          <Photo disabled imageStyle={styles.itemImage} source={item?.image} />
        </View>
        <View style={{ paddingHorizontal: 10, paddingTop: 5, gap: isIOS() ? 4 : 2 }}>
          <Typography numberOfLines={1} style={styles.itemText}>
            {item?.name}
          </Typography>
          <RowComponent style={{ alignItems: 'center', justifyContent: 'flex-start', gap: 5 }}>
            <Typography
              numberOfLines={1}
              style={{ color: COLORS.DARK_GREY, fontSize: FontSize.MediumSmall }}
            >
              {item?.city + ' - '}
            </Typography>
            <Typography
              numberOfLines={1}
              style={{ color: COLORS.DARK_GREY, fontSize: FontSize.MediumSmall }}
            >
              {item?.country}
            </Typography>
          </RowComponent>
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
          onPress={() => navigate(SCREENS.DETAILS, { data: item })}
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
      </View>
    </SkeletonLoader>
  );
};
