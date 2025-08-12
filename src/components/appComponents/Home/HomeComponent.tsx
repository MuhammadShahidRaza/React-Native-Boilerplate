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
import { BUSINESS_FLOW_SLUGS, Category, FILTER_NAMES } from 'types/responseTypes';
import { getMainCategoriesHomeItems } from 'api/functions/app/home';
import { SCREENS } from 'constants/routes';
import { navigate } from 'navigation/index';

export const HomeComponent = () => {
  const { categoriesList } = useAppSelector(state => state.category);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<number>(1);
  const [isItemFlow, setIsItemFlow] = useState(true);
  const [itemHeading, setItemHeading] = useState<string>('');
  const activeCategory = useMemo(() => {
    const mainCategory = categoriesList.find(cat => cat.id === selectedCategory);
    if (!mainCategory) return null;
    return mainCategory;
  }, [selectedCategory, categoriesList]);

  useEffect(() => {
    if (activeCategory?.title) {
      setItemHeading(activeCategory.title);
    }
  }, [activeCategory]);

  const handlePress = (item: Category) => {
    if (item?.id === selectedCategory) return;
    setSelectedCategory(item?.id);
    if (item?.is_subcategory) return;

    const isTicketPurchase = item?.business_flow?.slug === BUSINESS_FLOW_SLUGS.TICKET_PURCHASE;
    setIsItemFlow(isTicketPurchase);
    const typesToFetch = isTicketPurchase
      ? [FILTER_NAMES.UPCOMING, FILTER_NAMES.TRENDING]
      : [FILTER_NAMES.NEAR_BY, FILTER_NAMES.TRENDING];
    typesToFetch.forEach(type => {
      getMainCategoriesHomeItems({
        id: item?.id,
        page: 1,
        type,
        isTicketPurchase,
      });
    });
  };

  const handleSubCategoryPress = (item: Category) => {
    // if (item?.key === 'Order Your Food') {
    //   navigate(SCREENS.SUB_CATEGORY_FOOD, {
    //     data: {
    //       heading: itemHeading,
    //       items: item?.items ?? [],
    //       itemHeading: itemHeading,
    //       categories: item?.categories,
    //     },
    //   });
    // } else if (
    //   itemHeading === CATEGORY_NAMES.ELECTRONICS ||
    //   itemHeading === CATEGORY_NAMES.INTERIOR
    // ) {
    //   navigate(SCREENS.VIEW_ALL, {
    //     data: {
    //       headerTitle: itemHeading,
    //       items: item?.items ?? [],
    //     },
    //   });
    // } else {

    const typesToFetch = [FILTER_NAMES.NEAR_BY, FILTER_NAMES.TRENDING];
    typesToFetch.forEach(type => {
      getMainCategoriesHomeItems({
        id: item?.id,
        page: 1,
        type,
      });
    });
    navigate(SCREENS.SUB_CATEGORY_ITEMS, {
      data: {
        heading: item?.title,
        item: item ?? [],
        itemHeading: item?.title,
        isItemFlow,
      },
    });
    // }
  };

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

  const renderSubCategoryItem = ({ item }: { item: Category }) => (
    <SkeletonLoader key={item?.id}>
      <TouchableOpacity
        style={styles.subCategoryItemContainer}
        onPress={() => {
          handleSubCategoryPress(item);
        }}
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
    const hasItems =
      (activeCategory?.upcoming?.length ?? 0) > 0 ||
      (activeCategory?.trending?.length ?? 0) > 0 ||
      (activeCategory?.nearby?.length ?? 0) > 0;

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ minHeight: screenHeight(isIOS() ? 50 : 52) }}
      >
        {hasSubCategories && (
          <FlatListComponent
            keyExtractor={item => String(item?.id)}
            numColumns={2}
            columnWrapperStyle={styles.subCategoriesColumnWrapper}
            contentContainerStyle={styles.subCategoriesContentContainer}
            data={activeCategory?.subcategories}
            renderItem={renderSubCategoryItem}
          />
        )}

        {!hasSubCategories && hasItems && (
          <>
            {activeCategory?.upcoming?.length > 0 &&
              renderHorizontalItemsWithRow({
                data: activeCategory.upcoming,
                heading: itemHeading,
                rowHeading: `Upcoming ${itemHeading}`,
                isItemFlow,
              })}
            {activeCategory?.nearby?.length > 0 &&
              renderHorizontalItemsWithRow({
                data: activeCategory.nearby,
                heading: itemHeading,
                rowHeading: `Near By ${itemHeading}`,
                isItemFlow,
              })}

            {activeCategory?.trending?.length > 0 &&
              renderHorizontalItemsWithRow({
                data: activeCategory.trending,
                heading: itemHeading,
                rowHeading: `Trending ${itemHeading}`,
                isItemFlow,
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
        noItemProps={{
          message: 'No Category Found',
          messageStyle: {
            color: COLORS.WHITE,
            alignSelf: 'center',
            width: screenWidth(90),
          },
          containerHeight: screenHeight(12),
        }}
        renderItem={renderCategoryItem}
      />
      {selectedCategory && renderCategoryContent()}
    </View>
  );
};
