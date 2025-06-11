import {
  Dropdown,
  Header,
  Typography,
  Wrapper,
} from 'components/common';
import { RangeSlider } from 'components/common/RangeSlider';
import { IMAGES } from 'constants/assets';
import { COMMON_TEXT, HOME_TEXT } from 'constants/screens';
import { useState } from 'react';
import { FlatList, Image, TouchableOpacity } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { FontWeight } from 'types/fontTypes';
import { COLORS } from 'utils/colors';
import { AddressDetails } from 'utils/location';

export const Filter = () => {
  const rating = [
    1, 2, 3, 4, 5
  ];
  const therapyList = [
    { name: 'Wet Cupping' },
    { name: 'Dry Cupping' },
    { name: 'Hijama Cupping' },
  ];


  const [selectedRadius, setSelectedRadius] = useState('');
  const [selectedTherapy, setSelectedTherapy] = useState('');
  const [price, setPrice] = useState([20, 50]);
  const [selectRating, setSelectRating] = useState(1);



  const renderItem = ({ item, index }: any) => {
    return (
      <TouchableOpacity onPress={() => setSelectRating(item)} key={index} style={[styles.ratingItemContainer, { backgroundColor: selectRating === item ? COLORS.PURPLE : "transparent" }]}>
        <Typography style={{ color: selectRating === item ? COLORS.WHITE : COLORS.BLACK }}>
          {`${index + 1} ${index + 1 === 1 ? 'Star' : 'Stars'}`}
        </Typography>

        <View style={styles.ratingStartContainer}>
          {[1, 2, 3, 4, 5].map((item, index) => {
            return <Image style={styles.ratingIcon} source={IMAGES.RATINGS} />
          })}
        </View>

      </TouchableOpacity>
    )
  }

  return (
    <Wrapper useScrollView>
      <Header title={COMMON_TEXT.FILTERS} />
      <View style={{ paddingHorizontal: 20 }}>

        <RangeSlider
          labels={[10, 20, 30, 40]}
          values={price}
          setValues={setPrice}
          title={"Select Pricing Range"}
          titleStyle={styles.title}
        />
        <View style={styles.spacing} />


        <Typography style={styles.title}>{COMMON_TEXT.RATING}</Typography>

        <View style={styles.spacing} />

        <FlatList
          showsHorizontalScrollIndicator={false}
          horizontal
          data={rating}
          renderItem={renderItem}
        />


        <View style={styles.spacing} />
        <Dropdown
          titleStyle={styles.title}
          title={COMMON_TEXT.SELECT_CATEGORY}
          options={therapyList}
          selectedValue={selectedRadius}
          onSelect={setSelectedRadius}
        />
        <View style={styles.spacing} />

        <Dropdown
          titleStyle={styles.title}
          title={COMMON_TEXT.SELECT_SERVICE}
          options={therapyList}
          selectedValue={selectedTherapy}
          onSelect={setSelectedTherapy}
        />
        <View style={styles.spacing} />



      </View>

    </Wrapper>
  );
};

const styles = StyleSheet.create({
  title: {
    fontWeight: FontWeight.Bold,
  },
  spacing: { marginBottom: 10 },

  ratingItemContainer: {
    borderWidth: 1,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 25,
    marginEnd: 20,
    alignItems: 'center'
  },

  ratingStartContainer: {
    flexDirection: 'row',
    width: '100%'
  },
  ratingIcon: {
    width: 12,
    height: 12,
    marginEnd: 4
  },
});
