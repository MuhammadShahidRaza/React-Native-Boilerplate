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
    <Wrapper>
      <Header title='Favorites' />
      <FlatListComponent
        scrollEnabled={true}
        data={FavoritesList}
        contentContainerStyle={{ paddingBottom: 100, ...STYLES.CONTAINER }}
        renderItem={({ item }: { item: ItemType }) => (
          <ItemLargeCard item={item} key={item?.id} showCategory={true} />
        )}
      />
    </Wrapper>
  );
};
