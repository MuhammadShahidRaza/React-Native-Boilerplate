import React, { useEffect, useState } from 'react';
import {
  FlatListComponent,
  Wrapper,
  SearchBar,
  ServiceCard,
  Typography,
  RowComponent,
} from 'components/index';
import { COLORS, FLEX_CENTER, isIOS, screenWidth, STYLES } from 'utils/index';
import { AppNavigationProp, AppRouteProp, FontSize, FontWeight } from 'types/index';
import { SCREENS } from 'constants/index';
import { useNavigation, useRoute } from '@react-navigation/native';
import { navigate } from 'navigation/Navigators';
import { View } from 'react-native';

export const ViewAllEcommerce = () => {
  const navigation = useNavigation<AppNavigationProp<typeof SCREENS.VIEW_ALL_ECOMMERCE>>();
  const data = useRoute<AppRouteProp<typeof SCREENS.VIEW_ALL_ECOMMERCE>>().params?.data;
  const [search, setSearch] = useState('');
  const [filteredData, setFilteredData] = useState(data?.items);
  const [showCartButton, setShowCartButton] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState(data?.items[0] ?? []);
  useEffect(() => {
    navigation.setOptions({
      headerTitle: data?.headerTitle,
    });
  }, []);

  // useEffect(() => {
  //   setFilteredData(
  //     data?.categories?.filter(item => item?.name?.toLowerCase().includes(search.toLowerCase())),
  //   );
  // }, [search]);

  const renderCategories = ({
    data,
    onPressItem,
  }: {
    data: { image: string; name: string; id: string; description?: string; price: string };
    onPressItem: (item: any) => void;
  }) => (
    <Typography
      style={{
        fontSize: FontSize.MediumSmall,
        paddingHorizontal: 20,
        fontWeight: selectedCategory?.id === data?.id ? FontWeight.Bold : FontWeight.Normal,
        paddingVertical: 10,
        borderBottomWidth: selectedCategory?.id === data?.id ? 2 : 1,
        borderColor: selectedCategory?.id === data?.id ? COLORS.PRIMARY : COLORS.BORDER,
      }}
      onPress={() => onPressItem(data)}
    >
      {data?.name}
    </Typography>
  );

  return (
    <Wrapper useSafeArea={false}>
      <SearchBar
        value={search}
        onChangeText={setSearch}
        secondContainerStyle={{ ...STYLES.SHADOW, ...STYLES.CONTAINER }}
        showBorder={false}
      />
      <FlatListComponent
        data={data?.items ?? []}
        horizontal={true}
        renderItem={({ item }) =>
          renderCategories({ data: item as any, onPressItem: setSelectedCategory })
        }
        contentContainerStyle={{
          borderColor: COLORS.PRIMARY,
          marginBottom: 20,
          paddingHorizontal: 20,
        }}
      />

      <FlatListComponent
        scrollEnabled={true}
        numColumns={2}
        data={selectedCategory?.products}
        contentContainerStyle={{ paddingBottom: 150, ...STYLES.CONTAINER }}
        renderItem={({
          item,
        }: {
          item: { image: string; name: string; id: string; description?: string; price: string };
        }) => (
          <ServiceCard
            item={item}
            key={item?.id}
            onPressItem={(item: any) => {
              setShowCartButton(item);
            }}
          />
        )}
      />

      {showCartButton && (
        <View
          style={{
            paddingVertical: 15,
            position: 'absolute',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            bottom: 0,
            left: 0,
            right: 0,
            ...STYLES.SHADOW,
          }}
        >
          <RowComponent
            onPress={() => {
              navigate(SCREENS.CART);
            }}
            style={{
              backgroundColor: COLORS.PRIMARY,
              marginHorizontal: 30,
              borderRadius: 10,
              padding: 10,
            }}
          >
            <View
              style={{
                padding: 10,
                backgroundColor: COLORS.WHITE,
                width: screenWidth(10),
                marginRight: 10,
                height: 40,
                borderRadius: 40,
                ...FLEX_CENTER,
              }}
            >
              <Typography
                style={{
                  color: COLORS.PRIMARY,

                  fontSize: FontSize.MediumSmall,
                }}
              >
                01
              </Typography>
            </View>
            <View style={{ width: screenWidth(50), ...FLEX_CENTER }}>
              <Typography
                style={{
                  fontSize: FontSize.MediumSmall,
                  textAlign: 'center',
                  color: COLORS.WHITE,
                }}
              >
                View your cart
              </Typography>
              <Typography
                numberOfLines={1}
                style={{
                  textAlign: 'center',
                  fontSize: FontSize.MediumSmall,
                  color: COLORS.WHITE,
                }}
              >
                {showCartButton?.name}
              </Typography>
            </View>
            <Typography
              style={{
                color: COLORS.WHITE,
              }}
            >
              {`$${Number(showCartButton?.price)?.toFixed(2)}`}
            </Typography>
          </RowComponent>
        </View>
      )}
    </Wrapper>
  );
};
