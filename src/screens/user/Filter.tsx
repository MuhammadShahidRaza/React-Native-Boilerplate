import {
  Dropdown,
  Header,
  Wrapper,
  Autocomplete,
  RangeSlider,
} from 'components/common';
import {COMMON_TEXT, HOME_TEXT} from 'constants/screens';
import {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {FontWeight} from 'types/fontTypes';
import {AddressDetails} from 'utils/location';

export const Filter = () => {
  const radiusList = [
    {name: '5 km'},
    {name: '10 km'},
    {name: '15 km'},
    {name: '20 km'},
    {name: '30 km'},
    {name: '50 km'},
    {name: '100 km'},
  ];
  const therapyList = [
    {name: 'Wet Cupping'},
    {name: 'Dry Cupping'},
    {name: 'Hijama Cupping'},
  ];
  const specializationList = [
    {name: 'Hijama Cupping'},
    {name: 'Dry Hijama Cupping'},
    {name: 'Wet Hijama Cupping'},
  ];
  const [reverseGeocodedAddress, setReverseGeocodedAddress] =
    useState<AddressDetails | null>(null);
  const [selectedRadius, setSelectedRadius] = useState('');
  const [selectedTherapy, setSelectedTherapy] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [price, setPrice] = useState([20, 50]);
  return (
    <Wrapper useScrollView>
      <Header title={COMMON_TEXT.FILTERS} />
      <View style={{marginHorizontal: 20}}>
        <Autocomplete
          containerStyle={styles.spacing}
          title={COMMON_TEXT.LOCATION}
          titleStyle={styles.title}
          setReverseGeocodedAddress={setReverseGeocodedAddress}
        />
        <View style={styles.spacing} />
        <Dropdown
          titleStyle={styles.title}
          title={COMMON_TEXT.RADIUS}
          options={radiusList}
          selectedValue={selectedRadius}
          onSelect={setSelectedRadius}
        />
        <View style={styles.spacing} />

        <Dropdown
          titleStyle={styles.title}
          title={COMMON_TEXT.THERAPY_TYPE}
          options={therapyList}
          selectedValue={selectedTherapy}
          onSelect={setSelectedTherapy}
        />
        <View style={styles.spacing} />
        <Dropdown
          titleStyle={styles.title}
          title={COMMON_TEXT.SPECIALIZATION}
          options={specializationList}
          selectedValue={selectedSpecialization}
          onSelect={setSelectedSpecialization}
        />
        <View style={styles.spacing} />
        <RangeSlider
          values={price}
          setValues={setPrice}
          title={HOME_TEXT.PRICING}
          titleStyle={styles.title}
        />
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  title: {
    fontWeight: FontWeight.Bold,
  },
  spacing: {marginBottom: 10},
});
