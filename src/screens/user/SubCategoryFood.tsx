import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { STYLES } from 'utils/index';
import { renderHorizontalFoodItemsWithRow, SearchBar, Wrapper } from 'components/index';
import { AppScreenProps, FILTER_NAMES, useAppSelector } from 'types/index';
import { SCREENS, VARIABLES } from 'constants/index';
import { getItemCategories, getMainCategoriesHomeItems } from 'api/functions/app/home';

export const SubCategoryFood = ({
  navigation,
  route,
}: AppScreenProps<typeof SCREENS.SUB_CATEGORY_FOOD>) => {
  const [search, setSearch] = useState('');
  const data = route?.params?.data;
  const selectedCategory = data?.item;
  const { categoriesList } = useAppSelector(state => state.category);
  // const activeCategory =
  //   categoriesList
  //     ?.find(cat => cat.subcategories?.some(sub => sub.id === selectedCategory?.id))
  //     ?.subcategories?.find(sub => sub.id === selectedCategory?.id) || null;

  const activeCategory = useMemo(() => {
    return (
      categoriesList
        ?.find(cat => cat.subcategories?.some(sub => sub.id === selectedCategory?.id))
        ?.subcategories?.find(sub => sub.id === selectedCategory?.id) || null
    );
  }, [categoriesList]);

  const fetchItems = async () => {
    const typesToFetch = [FILTER_NAMES.NEAR_BY, FILTER_NAMES.TRENDING];
    typesToFetch.forEach(type => {
      getMainCategoriesHomeItems({
        id: selectedCategory?.id,
        page: 1,
        type,
        search,
      });
    });
    getItemCategories({
      id: selectedCategory?.id,
      page: 1,
      search,
    });
  };

  useEffect(() => {
    navigation.setOptions({
      headerTitle: data?.heading,
    });

    fetchItems();
  }, []);

  const hasItems =
    (activeCategory?.trending?.length ?? 0) > 0 ||
    (activeCategory?.nearby?.length ?? 0) > 0 ||
    (activeCategory?.item_categories?.length ?? 0) > 0;

  return (
    <Wrapper useSafeArea={false} useScrollView={true}>
      <SearchBar
        value={search}
        onChangeText={setSearch}
        secondContainerStyle={{ ...STYLES.SHADOW, ...STYLES.CONTAINER }}
        showBorder={false}
        onSubmitEditing={() => {
          fetchItems();
        }}
      />

      {hasItems && activeCategory && (
        <>
          {activeCategory?.nearby?.length > 0 &&
            renderHorizontalFoodItemsWithRow({
              data: activeCategory.nearby,
              heading: data.heading,
              rowHeading: `Near By`,
            })}

          {activeCategory?.trending?.length > 0 &&
            renderHorizontalFoodItemsWithRow({
              data: activeCategory.trending,
              heading: data?.heading,
              rowHeading: 'Top Brands',
            })}
          <View style={{ height: 10 }} />
          {activeCategory?.item_categories?.length > 0 &&
            renderHorizontalFoodItemsWithRow({
              data: activeCategory.item_categories,
              heading: data?.heading,
              showSeeAll: false,
              rowHeading: VARIABLES.CATEGORIES,
            })}
          <View style={{ height: 30 }} />
        </>
      )}
    </Wrapper>
  );
};
