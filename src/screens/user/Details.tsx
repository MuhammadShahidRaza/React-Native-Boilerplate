import { useEffect, useState } from 'react';
import { COLORS, STYLES } from 'utils/index';
import { BusinessCard, SearchBar, Wrapper } from 'components/index';
import { AppScreenProps } from 'types/index';
import { SCREENS } from 'constants/index';

export const Details = ({ navigation, route }: AppScreenProps<typeof SCREENS.DETAILS>) => {
  const params = route?.params;
  const [search, setSearch] = useState('');
  useEffect(() => {
    navigation.setOptions({
      headerTitle: params?.heading,
    });
  }, []);

  return (
    <Wrapper backgroundColor={COLORS.RED} useSafeArea={false} useScrollView={true}>
      <BusinessCard data={params?.data} />

      <SearchBar
        value={search}
        onChangeText={setSearch}
        secondContainerStyle={{ ...STYLES.SHADOW, ...STYLES.CONTAINER }}
        showBorder={false}
      />

      {/* {renderHorizontalItemsWithRow({
        data: data.items ?? [],
        heading: data.itemHeading,
        rowHeading: `Near By adsads ahg ajgdhja gdhj ad  ${data.heading}`,
      })} */}
    </Wrapper>
  );
};
