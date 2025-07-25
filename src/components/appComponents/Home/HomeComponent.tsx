import { useState, useEffect, useMemo } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import {
  FlatListComponent,
  Typography,
  SearchBar,
  Photo,
  SkeletonLoader,
  renderHorizontalItemsWithRow,
} from 'components/index';
import { COLORS } from 'utils/colors';
import { isIOS, screenHeight, screenWidth } from 'utils/index';
import { styles } from './styles';
import { FontWeight } from 'types/fontTypes';
import { useAppSelector } from 'types/reduxTypes';
import { Category, Subcategory } from 'types/responseTypes';
import { getMainCategoriesHomeItems } from 'api/functions/app/home';

export const HomeComponent = () => {
  const { categoriesList } = useAppSelector(state => state.category);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<number>(1);
  const [itemHeading, setItemHeading] = useState<string>('');
  const activeCategory = useMemo(() => {
    const mainCategory = categoriesList.find(cat => cat.id === selectedCategory);
    if (!mainCategory) return null;
    return mainCategory;
  }, [selectedCategory, categoriesList]);

  useEffect(() => {
    if (!activeCategory) return;
    const mainCategory = categoriesList.find(cat => cat?.id == selectedCategory);
    if (!mainCategory) return;
    setItemHeading(mainCategory?.title);
  }, [selectedCategory, activeCategory, categoriesList]);

  const handlePress = (item: Category) => {
    if (item?.id == selectedCategory) return;
    if (item?.is_subcategory) {
      setSelectedCategory(item?.id);
      return;
    }
    // getMainCategoriesHomeItems({ id: item?.id, page: 1, limit: 3 });
    getMainCategoriesHomeItems({ id: 1, page: 1, limit: 3 });
    setSelectedCategory(item?.id);
  };

  // const handleSubCategoryPress = (item: {
  //   key: string;
  //   items: ItemType[];
  //   categories?: { id: string; name: string; image: string }[];
  // }) => {
  //   if (item?.key === 'Order Your Food') {
  //     navigate(SCREENS.SUB_CATEGORY_FOOD, {
  //       data: {
  //         heading: item?.key,
  //         items: item?.items ?? [],
  //         itemHeading: item?.key,
  //         categories: item?.categories ?? [],
  //       },
  //     });
  //   } else if (item?.key === 'Electronics' || item?.key === 'Interior') {
  //     navigate(SCREENS.VIEW_ALL, {
  //       data: {
  //         headerTitle: item?.key,
  //         items: item?.items ?? [],
  //       },
  //     });
  //   } else {
  //     navigate(SCREENS.SUB_CATEGORY_ITEMS, {
  //       data: {
  //         heading: item?.key,
  //         items: item?.items ?? [],
  //         itemHeading: item?.key,
  //       },
  //     });
  //   }
  // };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      key={item?.id}
      style={styles.categoryItemContainer}
      onPress={() => handlePress(item)}
    >
      <Photo
        source={item?.icon}
        disabled
        imageStyle={{
          width: screenWidth(isIOS() ? 13 : 15),
          height: screenHeight(5),
          resizeMode: 'contain',
          tintColor: selectedCategory === item?.id ? COLORS.WHITE : COLORS.BORDER,
        }}
        style={[
          styles.categoryItemImageContainer,
          { backgroundColor: selectedCategory === item?.id ? COLORS.PRIMARY : COLORS.WHITE },
        ]}
      />
      <Typography
        numberOfLines={1}
        style={[
          styles.categoryItemText,
          {
            color: selectedCategory === item?.id ? COLORS.PRIMARY : COLORS.BORDER,
            fontWeight: selectedCategory === item?.id ? FontWeight.Medium : FontWeight.Normal,
          },
        ]}
      >
        {item?.title}
      </Typography>
    </TouchableOpacity>
  );

  const renderSubCategoryItem = ({ item }: { item: Subcategory }) => (
    <SkeletonLoader key={item?.id}>
      <TouchableOpacity
        style={styles.subCategoryItemContainer}
        // onPress={() => handleSubCategoryPress(item)}
      >
        <Photo disabled imageStyle={styles.subCategoryItemImage} source={item?.thumbnail} />
        <View style={styles.textOverlay}>
          <Typography numberOfLines={1} style={styles.subCategoryItemText}>
            {item?.title}
          </Typography>
        </View>
      </TouchableOpacity>
    </SkeletonLoader>
  );

  const renderCategoryContent = () => {
    if (!activeCategory) return null;

    const hasSubCategories = (activeCategory?.subcategories?.length ?? 0) > 0;
    const hasItems = (activeCategory?.items?.length ?? 0) > 0;

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ minHeight: screenHeight(isIOS() ? 50 : 52) }}
      >
        {hasSubCategories && (
          <FlatListComponent
            keyExtractor={item => item?.title}
            numColumns={2}
            refreshing={false}
            onRefresh={() => {}}
            columnWrapperStyle={styles.subCategoriesColumnWrapper}
            contentContainerStyle={styles.subCategoriesContentContainer}
            data={activeCategory?.subcategories}
            renderItem={renderSubCategoryItem}
          />
        )}

        {!hasSubCategories && hasItems && (
          <>
            {renderHorizontalItemsWithRow({
              data: activeCategory.items ?? [],
              heading: itemHeading,
              rowHeading: `Upcoming ${itemHeading}`,
            })}
            {renderHorizontalItemsWithRow({
              data: activeCategory.items ?? [],
              heading: itemHeading,
              rowHeading: `Trending ${itemHeading}`,
            })}
          </>
        )}
        <View style={{ height: screenHeight(5) }} />
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <SearchBar
        value={searchText}
        onChangeText={setSearchText}
        showBorder={false}
        containerStyle={styles.searchBar}
      />
      <FlatListComponent
        horizontal={true}
        style={styles.categoriesFlatList}
        contentContainerStyle={styles.categoriesContentContainer}
        data={categoriesList}
        renderItem={renderCategoryItem}
      />
      {selectedCategory && renderCategoryContent()}
    </View>
  );
};
