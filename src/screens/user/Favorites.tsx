import { FlatListComponent, Wrapper, Header } from 'components/index';
import { STYLES } from 'utils/index';

export const Favorites = () => {
  return (
    <Wrapper>
      <Header title='Favorites' />
      <FlatListComponent
        scrollEnabled={true}
        data={[]}
        contentContainerStyle={{ paddingBottom: 100, ...STYLES.CONTAINER }}
        renderItem={({}: { item: any }) => <></>}
      />
    </Wrapper>
  );
};
