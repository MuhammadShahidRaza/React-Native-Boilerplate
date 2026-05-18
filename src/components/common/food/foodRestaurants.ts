import { ImageSourcePropType } from 'react-native';
import { IMAGES } from 'constants/assets';

export const FOOD_CATEGORIES = ['All', 'Burgers', 'Pizza', 'Chinese'] as const;
export type FoodCategory = (typeof FOOD_CATEGORIES)[number];
export type FoodTag = Exclude<FoodCategory, 'All'>;

export type RestaurantItem = {
  id: string;
  name: string;
  cuisine: string;
  tags: FoodTag[];
  time: string;
  fee: string;
  featured: boolean;
  image: ImageSourcePropType;
};

export const FOOD_RESTAURANTS: RestaurantItem[] = [
  {
    id: '1',
    name: 'Retro Burger',
    cuisine: 'Fast Food',
    tags: ['Burgers'],
    time: '15-25 min',
    fee: 'CFA 30',
    featured: false,
    image: IMAGES.RESTAURANT_ONE,
  },
  {
    id: '2',
    name: 'The Grill House',
    cuisine: 'BBQ & Grills',
    tags: ['Pizza'],
    time: '15-25 min',
    fee: 'CFA 30',
    featured: true,
    image: IMAGES.RESTAURANT_TWO,
  },
  {
    id: '3',
    name: 'Noodle Bar',
    cuisine: 'Chinese',
    tags: ['Chinese'],
    time: '20-30 min',
    fee: 'CFA 25',
    featured: true,
    image: IMAGES.RESTAURANT_TWO,
  },
  {
    id: '4',
    name: 'Slice Heaven',
    cuisine: 'Italian Pizza',
    tags: ['Pizza'],
    time: '18-28 min',
    fee: 'CFA 35',
    featured: false,
    image: IMAGES.RESTAURANT_ONE,
  },
];

export function filterRestaurants(
  items: RestaurantItem[],
  category: FoodCategory,
  query: string,
): RestaurantItem[] {
  const q = query.trim().toLowerCase();
  return items.filter(r => {
    const matchesCat = category === 'All' || r.tags.includes(category as FoodTag);
    if (!matchesCat) return false;
    if (!q) return true;
    return (
      r.name.toLowerCase().includes(q) ||
      r.cuisine.toLowerCase().includes(q) ||
      r.tags.some(t => t.toLowerCase().includes(q))
    );
  });
}
