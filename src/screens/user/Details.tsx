import { useEffect, useState } from 'react';
import { COLORS, STYLES } from 'utils/index';
import { BusinessCard, FlatListComponent, SearchBar, Wrapper } from 'components/index';
import { AppScreenProps } from 'types/index';
import { SCREENS } from 'constants/index';
import { View } from 'react-native';

export const Details = ({ navigation, route }: AppScreenProps<typeof SCREENS.DETAILS>) => {
  const params = route?.params;
  const [search, setSearch] = useState('');
  useEffect(() => {
    navigation.setOptions({
      headerTitle: params?.heading,
    });
  }, []);

  const renderItem = ({ item }: { item: any }) => {
    return <View style={{ height: 100, backgroundColor: COLORS.WHITE }} />;
  };

  return (
    <Wrapper useSafeArea={false} useScrollView={true}>
      <BusinessCard data={params?.data} />
      <SearchBar
        value={search}
        onChangeText={setSearch}
        secondContainerStyle={{ ...STYLES.SHADOW, ...STYLES.CONTAINER }}
        showBorder={false}
      />

      <FlatListComponent data={[]} renderItem={renderItem} />
    </Wrapper>
  );
};
