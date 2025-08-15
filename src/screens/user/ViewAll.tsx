import React, { useEffect, useState } from 'react';
import {
  FlatListComponent,
  Wrapper,
  ItemLargeCard,
  SearchBar,
  mapToItemCardData,
} from 'components/index';
import { COLORS, STYLES } from 'utils/index';
import {
  AppNavigationProp,
  AppRouteProp,
  CATEGORY_NAMES,
  CategoryItem,
  FILTER_NAMES,
  FontSize,
  Vendor,
} from 'types/index';
import { SCREENS, VARIABLES } from 'constants/index';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Autocomplete } from 'components/common/Autocomplete';
import { AddressDetails } from 'utils/location';
import { navigate } from 'navigation/index';
import { getMainCategoriesHomeItems } from 'api/functions/app/home';

export const ViewAll = () => {
  const navigation = useNavigation<AppNavigationProp<typeof SCREENS.VIEW_ALL>>();
  const data = useRoute<AppRouteProp<typeof SCREENS.VIEW_ALL>>().params?.data;
  const selectedCategory = data?.category;
  const heading = data?.headerTitle;
  const [reverseGeocodedAddress, setReverseGeocodedAddress] = useState<AddressDetails | null>(null);
  const [search, setSearch] = useState('');
  const [filteredData, setFilteredData] = useState(data?.items);
  useEffect(() => {
    navigation.setOptions({
      headerTitle: heading,
    });
    if (selectedCategory?.id) {
      const typesToFetch = [FILTER_NAMES.NEAR_BY, FILTER_NAMES.TRENDING];
      typesToFetch.forEach(type => {
        getMainCategoriesHomeItems({
          id: selectedCategory?.id,
          page: 1,
          type,
        });
      });
    }
  }, []);

  // useEffect(() => {
  //   // setFilteredData(
  //   //   data?.items?.filter((item: CategoryItem) =>
  //   //     item?.title?.toLowerCase().includes(search.toLowerCase()),
  //   //   ),
  //   // );
  // }, [search]);

  return (
    <Wrapper useSafeArea={false}>
      {heading === 'Hotels' && (
        <Autocomplete
          containerStyle={STYLES.CONTAINER}
          setReverseGeocodedAddress={setReverseGeocodedAddress}
          placeholder={'Enter Your Destination'}
          startIcon={{
            componentName: VARIABLES.MaterialCommunityIcons,
            iconName: 'map-marker-distance',
            color: COLORS.SECONDARY,
            size: FontSize.ExtraLarge,
          }}
        />
      )}
      <SearchBar
        value={search}
        onChangeText={setSearch}
        secondContainerStyle={{ ...STYLES.SHADOW, ...STYLES.CONTAINER }}
        showBorder={false}
        {...(['Hotels', 'Shortlet', 'Real Estate'].includes(heading) && {
          endIcon: {
            componentName: VARIABLES.MaterialCommunityIcons,
            iconName: 'filter-variant',
            color: COLORS.PRIMARY,
            onPress: () => {
              navigate(SCREENS.FILTER, {
                data: {
                  heading: heading,
                },
              });
            },
            size: FontSize.ExtraLarge,
          },
        })}
      />

      <FlatListComponent
        scrollEnabled={true}
        data={filteredData}
        onRefresh={() => {}}
        refreshing={false}
        contentContainerStyle={{ paddingBottom: 150, ...STYLES.CONTAINER }}
        renderItem={({ item }: { item: CategoryItem | Vendor }) => (
          <ItemLargeCard
            item={mapToItemCardData({
              data: item,
              isItemFlow: heading == CATEGORY_NAMES.EVENTS ? true : false,
            })}
            key={item?.id}
          />
        )}
      />
    </Wrapper>
  );
};
