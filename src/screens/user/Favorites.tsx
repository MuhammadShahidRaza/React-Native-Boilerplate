import {
  FlatListComponent,
  Wrapper,
  ItemLargeCard,
  Header,
  mapToItemCardData,
} from 'components/index';
import { STYLES } from 'utils/index';
import {
  // AppNavigationProp,
  CategoryItem,
} from 'types/index';
// import { SCREENS } from 'constants/index';
// import { useNavigation } from '@react-navigation/native';

export const Favorites = () => {
  // const navigation = useNavigation<AppNavigationProp<typeof SCREENS.FAVORITES>>();

  return (
    <Wrapper>
      <Header title='Favorites' />
      <FlatListComponent
        scrollEnabled={true}
        data={[]}
        contentContainerStyle={{ paddingBottom: 100, ...STYLES.CONTAINER }}
        renderItem={({ item }: { item: CategoryItem }) => (
          <ItemLargeCard
            item={mapToItemCardData({
              data: item,
              isItemFlow: true, // TODO:change this , pass the props
            })}
            key={item?.id}
            showCategory={true}
          />
        )}
      />
    </Wrapper>
  );
};
