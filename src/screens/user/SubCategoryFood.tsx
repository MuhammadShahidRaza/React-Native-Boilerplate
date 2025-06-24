import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { COLORS, STYLES } from 'utils/index';
import { ItemType, renderHorizontalFoodItemsWithRow, SearchBar, Wrapper } from 'components/index';
import { AppScreenProps, FontSize } from 'types/index';
import { SCREENS, VARIABLES } from 'constants/index';
import { Autocomplete } from 'components/common/Autocomplete';
import { AddressDetails } from 'utils/location';

export const SubCategoryFood = ({
  navigation,
  route,
}: AppScreenProps<typeof SCREENS.SUB_CATEGORY_FOOD>) => {
  const data = route?.params?.data;
  const [reverseGeocodedAddress, setReverseGeocodedAddress] = useState<AddressDetails | null>(null);
  const [search, setSearch] = useState('');
  useEffect(() => {
    navigation.setOptions({
      headerTitle: data?.heading,
    });
  }, []);

  return (
    <Wrapper useSafeArea={false} useScrollView={true}>
      {data?.heading === 'Hotels' && (
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
      />

      {renderHorizontalFoodItemsWithRow({
        data: data.items ?? [],
        heading: data.itemHeading,
        rowHeading: `Near By`,
      })}
      <View style={{ height: 10 }} />
      {renderHorizontalFoodItemsWithRow({
        data: data.items ?? [],
        heading: data.itemHeading,
        rowHeading: `Top Brands`,
      })}
      <View style={{ height: 10 }} />
      {renderHorizontalFoodItemsWithRow({
        data: (data?.categories as ItemType[]) ?? [],
        heading: data.itemHeading,
        rowHeading: `Categories`,
      })}
    </Wrapper>
  );
};
