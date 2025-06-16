import { useEffect, useState } from 'react';
import { COLORS, STYLES } from 'utils/index';
import { FlatListComponent, renderItems, renderSeeAll, SearchBar, Wrapper } from 'components/index';
import { AppScreenProps } from 'types/index';
import { COMMON_TEXT, SCREENS } from 'constants/index';
import { styles } from 'components/appComponents/Home/styles';

export const SubCategoryItems = ({
  navigation,
  route,
}: AppScreenProps<typeof SCREENS.SUB_CATEGORY_ITEMS>) => {
  const data = route?.params?.data;
  const [search, setSearch] = useState('');
  useEffect(() => {
    navigation.setOptions({
      headerTitle: data?.heading,
    });
  }, []);

  return (
    <Wrapper backgroundColor={COLORS.RED} useSafeArea={false} useScrollView={true}>
      <SearchBar
        value={search}
        onChangeText={setSearch}
        secondContainerStyle={{ ...STYLES.SHADOW, ...STYLES.CONTAINER }}
        showBorder={false}
      />
      <SearchBar
        value={search}
        onChangeText={setSearch}
        secondContainerStyle={{ ...STYLES.SHADOW, ...STYLES.CONTAINER }}
        showBorder={false}
      />
      {renderSeeAll({
        heading: `Near By ${data.heading}`,
        items: data.items ?? [],
        itemHeading: data.itemHeading,
      })}
      <FlatListComponent
        scrollEnabled={true}
        horizontal={true}
        contentContainerStyle={styles.subCategoriesContentContainer}
        data={data.items?.slice(0, 3) ?? []}
        renderItem={renderItems}
      />
      {renderSeeAll({
        heading: `Trending ${data.itemHeading}`,
        items: data.items ?? [],
        itemHeading: data.itemHeading,
      })}
      <FlatListComponent
        scrollEnabled={true}
        horizontal={true}
        contentContainerStyle={styles.subCategoriesContentContainer}
        data={data.items?.slice(0, 3) ?? []}
        renderItem={renderItems}
      />
    </Wrapper>
  );
};
