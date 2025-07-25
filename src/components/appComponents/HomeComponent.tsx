import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { FlatListComponent, Typography, SearchBar, SvgComponent, Photo } from 'components/index';
import { COLORS } from 'utils/colors';
import { isIOS, screenHeight, screenWidth } from 'utils/index';
import { IMAGES, SVG } from 'constants/assets';
import { SvgProps } from 'react-native-svg';
import { FontSize, FontWeight } from 'types/fontTypes';
import { navigate } from 'navigation/index';

type CategoryType = {
  id: string;
  name: string;
  image: React.FC<SvgProps>;
};

type SubCategoryType = { key: string; subCategories: { key: string; image: string }[] };

const categoriesList: CategoryType[] = [
  { id: '1', name: 'Life Style', image: SVG.LIFE_STYLE },
  { id: '2', name: 'Food', image: SVG.FOOD },
  { id: '3', name: 'Groceries', image: SVG.GROCERIES },
  { id: '4', name: 'Wears', image: SVG.WEARS },
  { id: '5', name: 'Health', image: SVG.HEALTH },
  { id: '6', name: 'Real State', image: SVG.REAL_STATE },
  { id: '7', name: 'Events', image: SVG.EVENTS },
  { id: '8', name: 'Others', image: SVG.OTHERS },
];

const subCategoriesList: SubCategoryType[] = [
  {
    key: 'Life Style',
    subCategories: [
      { key: 'Hotels', image: IMAGES.USER },
      { key: 'SPA', image: IMAGES.USER },
      { key: 'Saloons', image: IMAGES.USER },
    ],
  },
  {
    key: 'Food',
    subCategories: [
      { key: 'Order Your Food', image: IMAGES.USER },
      { key: 'Restaurant Reservation', image: IMAGES.USER },
    ],
  },
  { key: 'Groceries', subCategories: [] },
  { key: 'Wears', subCategories: [] },
  { key: 'Health', subCategories: [] },
  { key: 'Real State', subCategories: [] },
  { key: 'Events', subCategories: [] },
  {
    key: 'Others',
    subCategories: [
      { key: 'Electronics', image: IMAGES.USER },
      { key: 'Interior', image: IMAGES.USER },
    ],
  },
];

export const HomeComponent = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const handlePress = (id: string) => {
    setSelectedCategory(id);
  };
  const handleSubCategoryPress = (key: string) => {
    // navigate(SCREENS.SUB_CATEGORY, { id });
  };

  const renderCategoryItem = ({ item }: { item: CategoryType }) => (
    <TouchableOpacity style={styles.categoryItemContainer} onPress={() => handlePress(item.id)}>
      <SvgComponent
        containerStyle={[
          styles.categoryItemImageContainer,
          { backgroundColor: selectedCategory === item.id ? COLORS.PRIMARY : COLORS.WHITE },
        ]}
        Svg={item.image}
        svgHeight={screenHeight(5)}
        svgWidth={screenWidth(isIOS() ? 13 : 15)}
        fill={selectedCategory === item.id ? COLORS.WHITE : COLORS.BORDER}
      />

      <Typography
        numberOfLines={1}
        style={[
          styles.categoryItemText,
          { color: selectedCategory === item.id ? COLORS.PRIMARY : COLORS.BORDER },
        ]}
      >
        {item.name}
      </Typography>
    </TouchableOpacity>
  );

  const renderSubCategoryItem = ({ item }: { item: { key: string; image: string } }) => (
    <TouchableOpacity
      style={styles.subCategoryItemContainer}
      onPress={() => handleSubCategoryPress(item.key)}
    >
      <Photo disabled imageStyle={styles.subCategoryItemImage} source={item.image} />
      <View style={styles.textOverlay}>
        <Typography numberOfLines={1} style={styles.subCategoryItemText}>
          {item.key}
        </Typography>
      </View>
    </TouchableOpacity>
  );

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
      {selectedCategory && (
        <FlatListComponent
          numColumns={2}
          scrollEnabled={true}
          columnWrapperStyle={styles.subCategoriesColumnWrapper}
          contentContainerStyle={styles.subCategoriesContentContainer}
          data={
            subCategoriesList.find(
              cat =>
                categoriesList.find(mainCat => mainCat.id === selectedCategory)?.name === cat.key,
            )?.subCategories || []
          }
          renderItem={renderSubCategoryItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  searchBar: {
    marginHorizontal: 20,
  },
  categoriesFlatList: {
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  categoriesContentContainer: {
    paddingRight: 20,
  },
  subCategoriesContentContainer: {
    gap: 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  subCategoriesColumnWrapper: {
    gap: 20,
  },
  categoryItemContainer: {
    elevation: 2,
    shadowColor: COLORS.BLACK,
    backgroundColor: COLORS.WHITE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    padding: 12,
    gap: 20,
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 20,
    height: screenHeight(18),
    width: screenWidth(30),
  },
  subCategoryItemContainer: {
    elevation: 2,
    shadowColor: COLORS.BLACK,
    backgroundColor: COLORS.WHITE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    padding: 5,
    borderRadius: 20,
    height: screenHeight(25),
    width: screenWidth(42),
  },
  categoryItemText: {
    textAlign: 'center',
    color: COLORS.BORDER,
  },
  subCategoryItemText: {
    textAlign: 'center',
    color: COLORS.WHITE,
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Bold,
  },
  textOverlay: {
    position: 'absolute',
    top: screenWidth(20),
    left: 12,
    right: 12,
    borderWidth: 1.5,
    borderColor: COLORS.WHITE,
    backgroundColor: COLORS.DARK_BLACK_OPACITY,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 15,
  },
  categoryItemImage: {
    height: screenHeight(5),
    width: screenWidth(15),
  },
  subCategoryItemImage: {
    height: screenHeight(24),
    borderRadius: 20,
    width: screenWidth(40),
  },
  categoryItemImageContainer: {
    padding: 20,
    borderRadius: 20,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
