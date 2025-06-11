import { useState } from 'react';
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  FlatListComponent,
  Typography,
  Wrapper,
  HomeHeader,
  SearchBar,
  Input,
  RowComponent,
  Header,
  Icon,
} from 'components/index';
import { COLORS } from 'utils/colors';
import { COMMON_TEXT, TEMPORARY_TEXT } from 'constants/screens';
import { screenWidth } from 'utils/index';
import { VARIABLES } from 'constants/common';
import { FontSize } from 'types/fontTypes';
import { IMAGES } from 'constants/assets';
import { navigate } from 'navigation/Navigators';
import { SCREENS } from 'constants/routes';

const previousSearchList = [
  { id: '1', searchName: "Lorem Ipsum " },
  { id: '2', searchName: "Lorem Ipsum " },
  { id: '3', searchName: "Lorem Ipsum " },
  { id: '4', searchName: "Lorem Ipsum " },
  { id: '5', searchName: "Lorem Ipsum " },
];


export const Search = () => {
  const [searchText, setSearchText] = useState<string>('');

  const renderItem = ({ item, index }: any) => {
    return <RowComponent style={styles.previousSearchContainer} key={index}>
      <Typography>{item.searchName}</Typography>
      <TouchableOpacity>
        <Icon
          componentName={VARIABLES.EvilIcons}
          size={FontSize.MediumLarge}
          color={COLORS.BLACK}
          iconName={"close"} />
      </TouchableOpacity>
    </RowComponent>
  }


  return (
    <Wrapper useScrollView backgroundColor={COLORS.HEADER}>
      <Header title={"Search"} />

      <RowComponent style={styles.searchContainer}>
        <Input
          onChangeText={setSearchText}
          containerStyle={{ marginBottom: 0, flex: 1, marginEnd: 20 }}
          inputContainerWithTitle={{ flex: 1 }}
          name={COMMON_TEXT.SEARCH}
          returnKeyType='done'
          placeholder={COMMON_TEXT.SEARCH}
          value={searchText}
          endIcon={{
            componentName: VARIABLES.AntDesign,
            iconName: 'search1',
            color: COLORS.GREEN,
            size: FontSize.MediumLarge,
          }} />

        <TouchableOpacity onPress={() => navigate(SCREENS.FILTER)}>
          <Image style={styles.filterIcon} source={IMAGES.FILTER} />
        </TouchableOpacity>

      </RowComponent>


      <FlatList
        style={{ paddingHorizontal: 20 }}
        renderItem={renderItem}
        data={previousSearchList} />


    </Wrapper>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20
  },
  filterIcon: {
    width: 20,
    height: 20,
  },
  previousSearchContainer: {
    marginBottom: 12,
  }
});
