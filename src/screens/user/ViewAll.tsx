import { View, Text } from 'react-native';
import React from 'react';
import { Wrapper } from 'components/common';
import { FlatListComponent } from 'components/common';
import { STYLES } from 'utils/commonStyles';
import { AppRouteProp } from 'types/navigation';
import { SCREENS } from 'constants/routes';
import { useRoute } from '@react-navigation/native';

export const ViewAll = () => {
  const data = useRoute<AppRouteProp<typeof SCREENS.VIEW_ALL>>().params?.data;
  return (
    <Wrapper>
      <View style={STYLES.CONTAINER}>
        <FlatListComponent data={data} renderItem={() => <View />} />
      </View>
    </Wrapper>
  );
};
