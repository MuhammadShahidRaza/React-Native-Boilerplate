import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { FlatListComponent, Typography, SearchBar } from 'components/index';
import { COLORS } from 'utils/colors';
import { TEMPORARY_TEXT } from 'constants/screens';
import { screenHeight, screenWidth } from 'utils/index';

const previousSearchList = [
  { id: '1', searchName: TEMPORARY_TEXT.JOHN_DOE },
  { id: '2', searchName: TEMPORARY_TEXT.JOHN_DOE },
  { id: '3', searchName: TEMPORARY_TEXT.JOHN_DOE },
  { id: '4', searchName: TEMPORARY_TEXT.JOHN_DOE },
  { id: '5', searchName: TEMPORARY_TEXT.JOHN_DOE },
];

export const Search = () => {
  const [searchText, setSearchText] = useState<string>('');
  const handlePress = (_: string) => {
    // setSearchText(searchName);
  };

  const renderItem = ({ item }: { item: { id: string; searchName: string } }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handlePress(item.searchName)}>
      <Typography numberOfLines={1} style={styles.itemText}>
        {item.searchName}
      </Typography>
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContent}>
      <SearchBar value={searchText} onChangeText={setSearchText} showBorder={false} />
      <FlatListComponent
        horizontal
        style={styles.flatList}
        data={previousSearchList}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContent: {
    marginHorizontal: 20,
  },
  flatList: {
    marginVertical: 17,
  },
  itemContainer: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 10,
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 10,
    height: screenHeight(18),
    width: screenWidth(28),
  },
  itemText: {
    textAlign: 'center',
    color: COLORS.PRIMARY,
  },
});
