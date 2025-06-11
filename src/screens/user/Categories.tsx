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
  Card,
} from 'components/index';
import { COLORS } from 'utils/colors';
import { COMMON_TEXT, TEMPORARY_TEXT } from 'constants/screens';
import { screenWidth } from 'utils/index';
import { VARIABLES } from 'constants/common';
import { FontSize, FontWeight } from 'types/fontTypes';
import { IMAGES } from 'constants/assets';
import { navigate } from 'navigation/Navigators';
import { SCREENS } from 'constants/routes';

const previousSearchList = [
  { id: '1', title: "Lorem Ipsum " },
  { id: '2', title: "Lorem Ipsum " },
  { id: '3', title: "Lorem Ipsum " },
  { id: '4', title: "Lorem Ipsum " },
  { id: '5', title: "Lorem Ipsum " },
  { id: '6', title: "Lorem Ipsum " },
  { id: '7', title: "Lorem Ipsum " },
  { id: '8', title: "Lorem Ipsum " },
  { id: '9', title: "Lorem Ipsum " },

];


export const Categories = () => {

  const renderItem = ({ item, index }: any) => {
    return <Card
      titleStyle={styles.servicesTitle}
      containerStyle={[styles.servicesCard, { marginEnd: index === previousSearchList.length - 1 ? 12 : 0 }]}
      key={index}
      uri={IMAGES.DEFAULT_IMAGE}
      title={item.title}
      description={item.description}
      type="2" />
  }


  return (
    <Wrapper useScrollView backgroundColor={COLORS.HEADER}>
      <Header title={SCREENS.CATEGORIES} />
      {previousSearchList.length == 2 ?
        <FlatList
          key={'_'}
          keyExtractor={item => "_" + item.id}
          renderItem={renderItem}
          data={previousSearchList}
          numColumns={1} />
        :
        <FlatList
          key={'#'}
          keyExtractor={item => "#" + item.id}
          renderItem={renderItem}
          data={previousSearchList}
          numColumns={2} />
      }


    </Wrapper>
  );
};

const styles = StyleSheet.create({
  servicesCard: {
    width: 170,
    height: 120,
    marginBottom: 8,
  },
  servicesTitle: {
    fontSize: FontSize.Small,
    fontWeight: FontWeight.Normal,
    color: COLORS.BLACK,
    textAlign: 'center',
    marginBottom: 20,
  },
});
