import { useState } from 'react';
import { FlatListComponent, Wrapper, SearchBar, Header } from 'components/index';
import { STYLES } from 'utils/index';

export const Orders = () => {
  const [orders, setOrders] = useState<[]>([]);
  const [search, setSearch] = useState('');
  const [filteredData, setFilteredData] = useState(orders);

  return (
    <Wrapper>
      <Header title='Orders' />
      <SearchBar
        value={search}
        onChangeText={setSearch}
        secondContainerStyle={{ ...STYLES.SHADOW, ...STYLES.CONTAINER }}
        showBorder={false}
      />
      <FlatListComponent
        scrollEnabled={true}
        data={filteredData}
        contentContainerStyle={{ paddingBottom: 100, ...STYLES.CONTAINER }}
        renderItem={({ item }: { item: any }) => <></>}
      />
    </Wrapper>
  );
};
