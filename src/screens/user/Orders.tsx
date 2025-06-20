import { View } from 'react-native';
import React, { useEffect, useState } from 'react';
import {
  FlatListComponent,
  Wrapper,
  ItemType,
  ItemLargeCard,
  SearchBar,
  FavoritesList,
  Header,
} from 'components/index';
import { STYLES } from 'utils/index';
import { AppNavigationProp } from 'types/index';
import { SCREENS } from 'constants/index';
import { useNavigation } from '@react-navigation/native';

export const Orders = () => {
  const navigation = useNavigation<AppNavigationProp<typeof SCREENS.ORDERS>>();

  const [search, setSearch] = useState('');
  const [filteredData, setFilteredData] = useState(FavoritesList);

  useEffect(() => {
    setFilteredData(
      FavoritesList?.filter((item: ItemType) =>
        item?.name?.toLowerCase().includes(search.toLowerCase()),
      ),
    );
  }, [search]);

  return (
    <Wrapper useSafeArea={false}>
      <Header title='Orders' showBackButton={true} />
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
          contentContainerStyle={{ paddingBottom: 150 }}
          renderItem={({ item }: { item: ItemType }) => (
            <ItemLargeCard item={item} key={item?.id} />
          )}
        />
      </View>
    </Wrapper>
  );
};
