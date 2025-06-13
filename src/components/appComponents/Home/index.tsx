import { IMAGES, SVG } from 'constants/index';
import { SvgProps } from 'react-native-svg';

export type CategoryType = {
  id: string;
  name: string;
  image: React.FC<SvgProps>;
};

export type SubCategoryType = {
  id: string;
  key: string;
  subCategories: { id: string; key: string; image: string }[];
  items?: {
    id: string;
    name: string;
    image: string;
    city: string;
    country: string;
    distance?: string;
    isOpen?: boolean;
    openTime?: string;
  }[];
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
  },
  {
    id: '2',
    key: 'Food',
    subCategories: [
      { id: '1', key: 'Order Your Food', image: IMAGES.ORDER_FOOD },
      { id: '2', key: 'Restaurant Reservation', image: IMAGES.RESTAURANT_RESERVATION },
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
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
      },
      {
        id: '2',
        name: 'Walmart 2',
        image: IMAGES.WALMART,
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
      },
      {
        id: '3',
        name: 'Walmart 3',
        image: IMAGES.WALMART,
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
      },
      {
        id: '4',
        name: 'Walmart 4',
        image: IMAGES.WALMART,
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
      },
      {
        id: '5',
        name: 'Walmart 5',
        image: IMAGES.WALMART,
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
      },
      {
        id: '6',
        name: 'Walmart 6',
        image: IMAGES.WALMART,
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
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
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
      },
      {
        id: '2',
        name: 'Zara 2',
        image: IMAGES.ZARA,
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
      },
      {
        id: '3',
        name: 'Zara 3',
        image: IMAGES.ZARA,
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
      },
      {
        id: '4',
        name: 'Zara 4',
        image: IMAGES.ZARA,
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
      },
      {
        id: '5',
        name: 'Zara 5',
        image: IMAGES.ZARA,
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
      },
      {
        id: '6',
        name: 'Zara 6',
        image: IMAGES.ZARA,
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
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
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
      },
      {
        id: '2',
        name: 'Peace Pharmacy 2',
        image: IMAGES.PEACE_PHARMACY,
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
      },
      {
        id: '3',
        name: 'Peace Pharmacy 3',
        image: IMAGES.PEACE_PHARMACY,
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
      },
      {
        id: '4',
        name: 'Peace Pharmacy 4',
        image: IMAGES.PEACE_PHARMACY,
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
      },
      {
        id: '5',
        name: 'Peace Pharmacy 5',
        image: IMAGES.PEACE_PHARMACY,
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
      },
      {
        id: '6',
        name: 'Peace Pharmacy 6',
        image: IMAGES.PEACE_PHARMACY,
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
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
        city: 'London',
        country: 'UK',
      },
      {
        id: '2',
        name: 'Walmart 2',
        image: IMAGES.RESTAURANT_RESERVATION,
        city: 'London',
        country: 'UK',
      },
      {
        id: '3',
        name: 'Walmart 3',
        image: IMAGES.HOTELS,
        city: 'London',
        country: 'UK',
      },
      {
        id: '4',
        name: 'Walmart 4',
        image: IMAGES.INTERIOR,
        city: 'London',
        country: 'UK',
      },
      {
        id: '5',
        name: 'Walmart 5',
        image: IMAGES.ORDER_FOOD,
        city: 'London',
        country: 'UK',  
      },
      {
        id: '6',
        name: 'Walmart 6',
        image: IMAGES.WALMART,
        city: 'London',
        country: 'UK',
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
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
      },
      {
        id: '2',
        name: 'Walmart 2',
        image: IMAGES.RESTAURANT_RESERVATION,
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
      },
      {
        id: '3',
        name: 'Walmart 3',
        image: IMAGES.HOTELS,
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
      },
      {
        id: '4',
        name: 'Walmart 4',
        image: IMAGES.INTERIOR,
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
      },
      {
        id: '5',
        name: 'Walmart 5',
        image: IMAGES.ORDER_FOOD,
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
      },
      {
        id: '6',
        name: 'Walmart 6',
        image: IMAGES.WALMART,
        city: 'London',
        country: 'UK',
        distance: '4.5 Miles',
        isOpen: true,
        openTime: '2 pm - 8 pm',
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
