import { SCREENS } from 'constants/index';
import { Button, Dropdown, Wrapper } from 'components/index';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppScreenProps, FontWeight } from 'types/index';
import { STYLES } from 'utils/commonStyles';
import { onBack } from 'navigation/index';

export const Filter = ({ route }: AppScreenProps<typeof SCREENS.FILTER>) => {
  const data = route?.params?.data;
  const roomList = [
    { name: '2 Rooms' },
    { name: '3 Rooms' },
    { name: '4 Rooms' },
    { name: '5 Rooms' },
    { name: '6 Rooms' },
  ];
  const propertyTypeList = [{ name: 'Renting' }, { name: 'Buying' }, { name: 'Land sales' }];
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedPropertyType, setSelectedPropertyType] = useState('');
  return (
    <Wrapper useScrollView={false}>
      <View style={STYLES.CONTAINER}>
        {(data?.heading === 'Hotels' || data?.heading === 'Shortlet') && (
          <Dropdown
            titleStyle={styles.title}
            title={'Rooms'}
            options={roomList}
            selectedValue={selectedRoom}
            onSelect={setSelectedRoom}
          />
        )}

        {data?.heading === 'Real Estate' && (
          <Dropdown
            titleStyle={styles.title}
            title={'Property Type'}
            options={propertyTypeList}
            selectedValue={selectedPropertyType}
            onSelect={setSelectedPropertyType}
          />
        )}

        <View style={styles.spacing} />
        <Button
          title={'Apply'}
          onPress={() => {
            onBack();
          }}
          style={styles.buttonContainer}
        />
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  title: {
    fontWeight: FontWeight.Bold,
  },
  spacing: { marginBottom: 10 },
  buttonContainer: {
    marginTop: 100,
  },
});
