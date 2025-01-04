import {useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {
  FlatListComponent,
  Typography,
  Wrapper,
  HomeHeader,
  PractitionerBox,
  SearchBar,
} from 'components/index';
import {COLORS} from 'utils/colors';
import {TEMPORARY_TEXT} from 'constants/screens';
import {screenWidth} from 'utils/index';
import {User} from 'types/common';
import {appointmentList, HeadingWithList} from './Home';

const previousSearchList = [
  {id: '1', searchName: TEMPORARY_TEXT.DR_KIM},
  {id: '2', searchName: TEMPORARY_TEXT.DR_KIM},
  {id: '3', searchName: TEMPORARY_TEXT.DR_KIM},
  {id: '4', searchName: TEMPORARY_TEXT.DR_KIM},
  {id: '5', searchName: TEMPORARY_TEXT.DR_KIM},
];

const user: User = {
  name: TEMPORARY_TEXT.SHAHID,
  location: TEMPORARY_TEXT.DUBAI,
};

export const Search = () => {
  const [searchText, setSearchText] = useState<string>('');

  const handlePress = (searchName: string) => {
    // setSearchText(searchName);
  };

  const renderItem = ({item}: {item: {id: string; searchName: string}}) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handlePress(item.searchName)}>
      <Typography numberOfLines={1} style={styles.itemText}>
        {item.searchName}
      </Typography>
    </TouchableOpacity>
  );

  return (
    <Wrapper useScrollView backgroundColor={COLORS.HEADER}>
      <HomeHeader user={user} showSearch={false} />
      <View style={styles.mainContent}>
        <SearchBar value={searchText} onChangeText={setSearchText} />
        <FlatListComponent
          numColumns={3}
          style={styles.flatList}
          data={previousSearchList}
          renderItem={renderItem}
        />
        <HeadingWithList
          Component={PractitionerBox}
          list={appointmentList}
          itemsToShow={10}
          onViewDetails={() => {}}
        />
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  mainContent: {
    marginHorizontal: 20,
  },
  flatList: {
    marginBottom: 10,
  },
  itemContainer: {
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 10,
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 10,
    width: screenWidth(28),
  },
  itemText: {
    textAlign: 'center',
  },
});
