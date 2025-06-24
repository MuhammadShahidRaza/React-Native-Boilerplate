import { useEffect, useState } from 'react';
import { COLORS, STYLES } from 'utils/index';
import { renderHorizontalItemsWithRow, SearchBar, Wrapper } from 'components/index';
import { AppScreenProps, FontSize } from 'types/index';
import { SCREENS, VARIABLES } from 'constants/index';
import { Autocomplete } from 'components/common/Autocomplete';
import { AddressDetails } from 'utils/location';

export const SubCategoryItems = ({
  navigation,
  route,
}: AppScreenProps<typeof SCREENS.SUB_CATEGORY_ITEMS>) => {
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

      {renderHorizontalItemsWithRow({
        data: data.items ?? [],
        heading: data.itemHeading,
        rowHeading: `Near By ${data.heading}`,
      })}
      {renderHorizontalItemsWithRow({
        data: data.items ?? [],
        heading: data.itemHeading,
        rowHeading: `Trending ${data.heading}`,
      })}
    </Wrapper>
  );
};
