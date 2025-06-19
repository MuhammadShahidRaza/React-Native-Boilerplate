import { View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { FlatListComponent, Wrapper, ItemType, ItemLargeCard, SearchBar } from 'components/index';
import { COLORS, STYLES } from 'utils/index';
import { AppNavigationProp, AppRouteProp, FontSize } from 'types/index';
import { SCREENS, VARIABLES } from 'constants/index';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Autocomplete } from 'components/common/Autocomplete';
import { AddressDetails } from 'utils/location';

export const ViewAll = () => {
  const navigation = useNavigation<AppNavigationProp<typeof SCREENS.VIEW_ALL>>();
  const data = useRoute<AppRouteProp<typeof SCREENS.VIEW_ALL>>().params?.data;
  const [reverseGeocodedAddress, setReverseGeocodedAddress] = useState<AddressDetails | null>(null);
  const [search, setSearch] = useState('');
  const [filteredData, setFilteredData] = useState(data?.items);
  useEffect(() => {
    navigation.setOptions({
      headerTitle: data?.headerTitle,
    });
  }, []);

  useEffect(() => {
    setFilteredData(
      data?.items?.filter((item: ItemType) =>
        item?.name?.toLowerCase().includes(search.toLowerCase()),
      ),
    );
  }, [search]);

  return (
    <Wrapper  useSafeArea={false}>
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
      <SearchBar
        value={search}
        onChangeText={setSearch}
        secondContainerStyle={{ ...STYLES.SHADOW, ...STYLES.CONTAINER }}
        showBorder={false}
      />
      <View style={STYLES.CONTAINER}>
        <FlatListComponent
          scrollEnabled={true}
          data={filteredData}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }: { item: ItemType }) => (
            <ItemLargeCard item={item} key={item?.id} />
          )}
        />
      </View>
    </Wrapper>
  );
};
