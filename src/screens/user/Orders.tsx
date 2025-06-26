import { useEffect, useState } from 'react';
import {
  FlatListComponent,
  Wrapper,
  SearchBar,
  Header,
  OrderCard,
  OrderItem,
} from 'components/index';
import { STYLES } from 'utils/index';
import { IMAGES } from 'constants/index';

export const Orders = () => {
  const [orders, setOrders] = useState<OrderItem[]>([
    {
      id: 1,
      name: 'Golden Sands Boutique Hotel',
      status: 'Booked',
      item_name: '01 Twin Bed',
      created_at: 'July 24, 2025 / 11:15 pm',
      image: IMAGES.HOTELS,
      price: 100,
    },

    {
      id: 2,
      name: 'Zara',
      status: 'Booked',
      item_name: 'Polo T-shirt',
      created_at: 'July 24, 2025 / 11:15 pm',
      image: IMAGES.ZARA,
      price: 100,
    },
    {
      id: 3,
      name: 'Wall Mart',
      status: 'Ordered',
      item_name: 'Apple 01 kg',
      created_at: 'July 24, 2025 / 11:15 pm',
      image: IMAGES.WALMART,
      price: 100,
    },
    {
      id: 4,
      name: 'Zara',
      status: 'Requested',
      item_name: 'Polo T-shirt',
      created_at: 'July 24, 2025 / 11:15 pm',
      image: IMAGES.ZARA,
      price: 100,
    },
  ]);
  const [search, setSearch] = useState('');
  const [filteredData, setFilteredData] = useState(orders);

  useEffect(() => {
    setFilteredData(
      orders?.filter((item: OrderItem) => item?.name?.toLowerCase().includes(search.toLowerCase())),
    );
  }, [search]);

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
        renderItem={({ item }: { item: OrderItem }) => <OrderCard item={item} key={item?.id} />}
      />
    </Wrapper>
  );
};
