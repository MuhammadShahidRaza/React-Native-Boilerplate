import { View } from 'react-native';
import React from 'react';
import {
  FlatListComponent,
  Wrapper,
  ItemType,
  ItemLargeCard,
  FavoritesList,
  Header,
} from 'components/index';
import { STYLES } from 'utils/index';
import { AppNavigationProp } from 'types/index';
import { SCREENS } from 'constants/index';
import { useNavigation } from '@react-navigation/native';

export const Favorites = () => {
  const navigation = useNavigation<AppNavigationProp<typeof SCREENS.FAVORITES>>();

  return (
    <Wrapper useSafeArea={false}>
      <Header title='Favorites' showBackButton={true} />
      <View style={STYLES.CONTAINER}>
        <FlatListComponent
          scrollEnabled={true}
          data={FavoritesList}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }: { item: ItemType }) => (
            <ItemLargeCard item={item} key={item?.id} showCategory={true} />
          )}
        />
      </View>
    </Wrapper>
  );
};
