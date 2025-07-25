import { StyleSheet, View } from 'react-native';
import { useEffect, useState } from 'react';
import { FlatListComponent, Photo, RowComponent, Typography, Wrapper } from 'components/common';
import { STYLES } from 'utils/commonStyles';
import { onBack } from 'navigation/Navigators';
import { SearchBar } from 'components/appComponents';
import { FontSize } from 'types/fontTypes';
import { getRegionList } from 'api/functions/app/settings';

export type Region = {
  name: string;
  flag: string;
  code?: string;
  id?: string;
};

export const SelectRegion = () => {
  const [searchValue, setSearchValue] = useState('');
  const [regions, setRegions] = useState<Region[]>([]);

  useEffect(() => {
    (async () => {
      const response = await getRegionList();
      if (response) {
        setRegions(response);
      }
    })();
  }, []);

  const handleSubmit = () => {
    onBack();
  };

  const renderItem = ({ item }: { item: Region }) => {
    return (
      <RowComponent style={styles.rowComponent} onPress={handleSubmit}>
        <Photo source={item?.flag} style={STYLES.USER_IMAGE} resizeMode='contain' />
        <Typography style={styles.regionName}>{item?.name}</Typography>
      </RowComponent>
    );
  };

  return (
    <Wrapper useScrollView={false} useSafeArea={false}>
      <View style={styles.container}>
        <SearchBar
          value={searchValue}
          onChangeText={setSearchValue}
          secondContainerStyle={{ ...STYLES.SHADOW, marginTop: 10 }}
          showBorder={false}
        />
        <FlatListComponent
          style={styles.flatList}
          data={regions?.filter(item =>
            item?.name?.toLowerCase()?.includes(searchValue?.toLowerCase()),
          )}
          renderItem={renderItem}
        />
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    ...STYLES.CONTAINER,
  },
  flatList: {
    marginTop: 30,
  },
  rowComponent: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 20,
    marginBottom: 20,
  },
  regionName: {
    textTransform: 'capitalize',
    fontSize: FontSize.MediumLarge,
    marginTop: 10,
  },
});
