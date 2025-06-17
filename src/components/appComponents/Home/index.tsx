import { ItemCard, Typography } from 'components/index';
import { FlatListComponent, RowComponent } from 'components/common';
import { COMMON_TEXT, IMAGES, SCREENS, SVG, TEMPORARY_TEXT } from 'constants/index';
import { SvgProps } from 'react-native-svg';
import { COLORS, STYLES } from 'utils/index';
import { FontSize, FontWeight } from 'types/index';
import { navigate } from 'navigation/index';
import { styles } from './styles';

export type CategoryType = {
  id: string;
  name: string;
  image: React.FC<SvgProps>;
};

export type ItemType = {
  id: string;
  name: string;
  image: string;
  address: string;
  city: string;
  country: string;
  distance?: string;
  isOpen?: boolean;
  openTime?: string;
  isLiked?: boolean;
  description?: string;
  rating?: string;
  phoneNumber?: string;
  totalRatings?: string;
};

export type SubCategoryType = {
  id: string;
  key: string;
  subCategories: { id: string; key: string; image: string }[];
  items?: ItemType[];
};

export const categoriesList: CategoryType[] = [
  { id: '1', name: 'Life Style', image: SVG.LIFE_STYLE },
  { id: '2', name: 'Food', image: SVG.FOOD },
  { id: '3', name: 'Groceries', image: SVG.GROCERIES },
  { id: '4', name: 'Wears', image: SVG.WEARS },
  { id: '5', name: 'Health', image: SVG.HEALTH },
  { id: '6', name: 'Real State', image: SVG.REAL_STATE },
  { id: '7', name: 'Events', image: SVG.EVENTS },
  { id: '8', name: 'Others', image: SVG.OTHERS },
];

export const subCategoriesList: SubCategoryType[] = [
  {
    id: '1',
    key: 'Life Style',
    subCategories: [
      { id: '1', key: 'Hotels', image: IMAGES.HOTELS },
      { id: '2', key: 'SPA', image: IMAGES.SPA },
      { id: '3', key: 'Saloons', image: IMAGES.SALOONS },
    ],
    items: [
      {
        id: '1',
        name: 'Walmart 1',
        image: IMAGES.WALMART,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        isOpen: true,
        openTime: '2 pm - 8 pm',
        isLiked: false,
      },
      {
        id: '2',
        name: 'Walmart 2',
        image: IMAGES.WALMART,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        isLiked: false,
      },
      {
        id: '3',
        name: 'Walmart 3',
        image: IMAGES.WALMART,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        isOpen: true,
        openTime: '2 pm - 8 pm',
        isLiked: false,
      },
      {
        id: '4',
        name: 'Walmart 4',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        image: IMAGES.WALMART,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
        isLiked: false,
      },
      {
        id: '5',
        name: 'Walmart 5',
        image: IMAGES.WALMART,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        country: 'UK',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
        isLiked: false,
      },
      {
        id: '6',
        name: 'Walmart 6',
        image: IMAGES.WALMART,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        isOpen: true,
        openTime: '2 pm - 8 pm',
        isLiked: false,
      },
    ],
  },
  {
    id: '2',
    key: 'Food',
    subCategories: [
      { id: '1', key: 'Order Your Food', image: IMAGES.ORDER_FOOD },
      { id: '2', key: 'Restaurant Reservation', image: IMAGES.RESTAURANT_RESERVATION },
    ],
    items: [
      {
        id: '1',
        name: 'Walmart 1',
        image: IMAGES.WALMART,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        country: 'UK',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
        isLiked: false,
      },
      {
        id: '2',
        name: 'Walmart 2',
        image: IMAGES.WALMART,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        country: 'UK',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
        isLiked: false,
      },
      {
        id: '3',
        name: 'Walmart 3',
        image: IMAGES.WALMART,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        isOpen: true,
        openTime: '2 pm - 8 pm',
        isLiked: false,
      },
      {
        id: '4',
        name: 'Walmart 4',
        image: IMAGES.WALMART,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        country: 'UK',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
        isLiked: false,
      },
      {
        id: '5',
        name: 'Walmart 5',
        image: IMAGES.WALMART,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        openTime: '2 pm - 8 pm',
        isLiked: false,
      },
      {
        id: '6',
        name: 'Walmart 6',
        image: IMAGES.WALMART,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
        isLiked: false,
      },
    ],
  },
  {
    id: '3',
    key: 'Groceries',
    subCategories: [],
    items: [
      {
        id: '1',
        name: 'Walmart 1',
        image: IMAGES.WALMART,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        isOpen: true,
        openTime: '2 pm - 8 pm',
        isLiked: false,
      },
      {
        id: '2',
        name: 'Walmart 2',
        image: IMAGES.WALMART,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        isOpen: true,
        openTime: '2 pm - 8 pm',
        isLiked: false,
      },
      {
        id: '3',
        name: 'Walmart 3',
        image: IMAGES.WALMART,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        isOpen: true,
        openTime: '2 pm - 8 pm',
        isLiked: false,
      },
      {
        id: '4',
        name: 'Walmart 4',
        image: IMAGES.WALMART,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        isOpen: true,
        openTime: '2 pm - 8 pm',
        isLiked: false,
      },
      {
        id: '5',
        name: 'Walmart 5',
        image: IMAGES.WALMART,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        country: 'UK',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
        isLiked: false,
      },
      {
        id: '6',
        name: 'Walmart 6',
        image: IMAGES.WALMART,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
        isLiked: false,
      },
    ],
  },
  {
    id: '4',
    key: 'Wears',
    subCategories: [],
    items: [
      {
        id: '1',
        name: 'Zara 1',
        image: IMAGES.ZARA,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
        isLiked: true,
      },
      {
        id: '2',
        name: 'Zara 2',
        image: IMAGES.ZARA,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        openTime: '2 pm - 8 pm',
        isLiked: false,
      },
      {
        id: '3',
        name: 'Zara 3',
        image: IMAGES.ZARA,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        country: 'UK',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
        isLiked: false,
      },
      {
        id: '4',
        name: 'Zara 4',
        image: IMAGES.ZARA,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        isOpen: true,
        openTime: '2 pm - 8 pm',
        isLiked: false,
      },
      {
        id: '5',
        name: 'Zara 5',
        image: IMAGES.ZARA,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        country: 'UK',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
        isLiked: true,
      },
      {
        id: '6',
        name: 'Zara 6',
        image: IMAGES.ZARA,
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
        isLiked: false,
      },
    ],
  },
  {
    id: '5',
    key: 'Health',
    subCategories: [],
    items: [
      {
        id: '1',
        name: 'Peace Pharmacy 1',
        image: IMAGES.PEACE_PHARMACY,
        address: '123 Maplewood Lane Springfield',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
        isLiked: false,
      },
      {
        id: '2',
        name: 'Peace Pharmacy 2',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        image: IMAGES.PEACE_PHARMACY,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
        isLiked: true,
      },
      {
        id: '3',
        name: 'Peace Pharmacy 3',
        image: IMAGES.PEACE_PHARMACY,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        country: 'UK',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
        isLiked: false,
      },
      {
        id: '4',
        name: 'Peace Pharmacy 4',
        image: IMAGES.PEACE_PHARMACY,
        address: '123 Maplewood Lane Springfield',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
        isLiked: false,
      },
      {
        id: '5',
        name: 'Peace Pharmacy 5',
        image: IMAGES.PEACE_PHARMACY,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
        isLiked: true,
      },
      {
        id: '6',
        name: 'Peace Pharmacy 6',
        image: IMAGES.PEACE_PHARMACY,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        country: 'UK',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
        isLiked: false,
      },
    ],
  },
  {
    id: '6',
    key: 'Real State',
    subCategories: [],
    items: [
      {
        id: '1',
        name: 'Walmart 1',
        image: IMAGES.WALMART,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        country: 'UK',
        rating: '4.2',
        isLiked: false,
      },
      {
        id: '2',
        name: 'Walmart 2',
        image: IMAGES.RESTAURANT_RESERVATION,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        country: 'UK',
        rating: '4.2',
        isLiked: false,
      },
      {
        id: '3',
        name: 'Walmart 3',
        image: IMAGES.HOTELS,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        country: 'UK',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        rating: '4.2',
        isLiked: true,
      },
      {
        id: '4',
        name: 'Walmart 4',
        image: IMAGES.INTERIOR,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        country: 'UK',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        rating: '4.2',
        isLiked: false,
      },
      {
        id: '5',
        name: 'Walmart 5',
        image: IMAGES.ORDER_FOOD,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        country: 'UK',
        rating: '4.2',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        isLiked: true,
      },
      {
        id: '6',
        name: 'Walmart 6',
        image: IMAGES.WALMART,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        country: 'UK',
        rating: '4.2',
        isLiked: false,
      },
    ],
  },
  {
    id: '7',
    key: 'Events',
    subCategories: [],
    items: [
      {
        id: '1',
        name: 'Walmart 1',
        image: IMAGES.WALMART,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        openTime: '2 pm - 8 pm',
        rating: '4.2',
        isLiked: true,
      },
      {
        id: '2',
        name: 'Walmart 2',
        image: IMAGES.RESTAURANT_RESERVATION,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
        rating: '4.2',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        isLiked: false,
      },
      {
        id: '3',
        name: 'Walmart 3',
        image: IMAGES.HOTELS,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        isOpen: true,
        openTime: '2 pm - 8 pm',
        rating: '4.2',
        isLiked: false,
      },
      {
        id: '4',
        name: 'Walmart 4',
        image: IMAGES.INTERIOR,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        isOpen: true,
        openTime: '2 pm - 8 pm',
        rating: '4.2',
        isLiked: true,
      },
      {
        id: '5',
        name: 'Walmart 5',
        image: IMAGES.ORDER_FOOD,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        country: 'UK',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
        rating: '4.2',
        isLiked: false,
      },
      {
        id: '6',
        name: 'Walmart 6',
        image: IMAGES.WALMART,
        address: '123 Maplewood Lane Springfield',
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
        rating: '4.2',
        description: TEMPORARY_TEXT.LORUM_IPSUM,
        isLiked: true,
      },
    ],
  },
  {
    id: '8',
    key: 'Others',
    subCategories: [
      { id: '1', key: 'Electronics', image: IMAGES.ELECTRONICS },
      { id: '2', key: 'Interior', image: IMAGES.INTERIOR },
    ],
  },
];

const renderSeeAll = ({
  heading,
  items,
  itemHeading,
}: {
  heading: string;
  items: ItemType[];
  itemHeading: string;
}) => {
  return (
    <RowComponent style={{ marginBottom: 15, ...STYLES.CONTAINER }}>
      <Typography numberOfLines={1} style={{ fontWeight: FontWeight.SemiBold, width: '80%' }}>
        {heading}
      </Typography>
      <Typography
        onPress={() => {
          navigate(SCREENS.VIEW_ALL, { data: { items, headerTitle: itemHeading } });
        }}
        style={{
          color: COLORS.BORDER,
          fontSize: FontSize.Small,
          fontWeight: FontWeight.SemiBold,
        }}
      >
        {COMMON_TEXT.VIEW_ALL}
      </Typography>
    </RowComponent>
  );
};

export const renderItems = ({ item }: { item: ItemType }) => (
  <ItemCard item={item} key={item?.id} />
);

export const renderHorizontalItemsWithRow = ({
  data,
  heading,
  rowHeading,
}: {
  data: ItemType[];
  heading: string;
  rowHeading: string;
}) => {
  return (
    <>
      {renderSeeAll({
        heading: rowHeading,
        items: data ?? [],
        itemHeading: heading,
      })}
      <FlatListComponent
        scrollEnabled={true}
        horizontal={true}
        contentContainerStyle={styles.subCategoriesContentContainer}
        data={data?.slice(0, 3) ?? []}
        renderItem={renderItems}
      />
    </>
  );
};
