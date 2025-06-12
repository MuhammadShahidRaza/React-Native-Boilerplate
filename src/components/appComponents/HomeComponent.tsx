import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { FlatListComponent, Typography, SearchBar, Photo, SvgComponent } from 'components/index';
import { COLORS } from 'utils/colors';
import { screenHeight, screenWidth } from 'utils/index';
import { IMAGES, SVG } from 'constants/assets';
import { SvgProps } from 'react-native-svg';

type CategoryType = {
  id: string;
  name: string;
  image: React.FC<SvgProps>;
};

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


export const HomeComponent = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const handlePress = (id: string) => {
    setSelectedCategory(id);
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
        svgWidth={screenWidth(13)}
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
        data={categoriesList}
        renderItem={renderCategoryItem}
      />
   
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
  subCategoriesFlatList: {
    paddingHorizontal: 20,
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
  categoryItemText: {
    textAlign: 'center',
    color: COLORS.BORDER,
  },

  categoryItemImage: {
    height: screenHeight(5),
    width: screenWidth(15),
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
