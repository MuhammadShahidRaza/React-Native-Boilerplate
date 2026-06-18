import { ImageSourcePropType } from 'react-native';
import { IMAGES } from 'constants/assets';

export const ALL_RESTAURANT_CATEGORY = 'All';

export type RestaurantItem = {
  id: string;
  name: string;
  cuisine: string;
  categoryLabels?: string[];
  time?: string;
  fee?: string;
  distanceKm?: number;
  distanceLabel?: string;
  rating?: string;
  featured: boolean;
  image: ImageSourcePropType;
};

export const FOOD_RESTAURANTS: RestaurantItem[] = [
  {
    id: '1',
    name: 'Retro Burger',
    cuisine: 'Fast Food',
    categoryLabels: ['Burgers'],
    time: '15-25 min',
    fee: 'CFA 30',
    featured: false,
    image: IMAGES.RESTAURANT_ONE,
  },
  {
    id: '2',
    name: 'The Grill House',
    cuisine: 'BBQ & Grills',
    categoryLabels: ['Pizza'],
    time: '15-25 min',
    fee: 'CFA 30',
    featured: true,
    image: IMAGES.RESTAURANT_TWO,
  },
  {
    id: '3',
    name: 'Noodle Bar',
    cuisine: 'Chinese',
    categoryLabels: ['Chinese'],
    time: '20-30 min',
    fee: 'CFA 25',
    featured: true,
    image: IMAGES.RESTAURANT_TWO,
  },
  {
    id: '4',
    name: 'Slice Heaven',
    cuisine: 'Italian Pizza',
    categoryLabels: ['Pizza'],
    time: '18-28 min',
    fee: 'CFA 35',
    featured: false,
    image: IMAGES.RESTAURANT_ONE,
  },
];

export function buildRestaurantCategoryOptions(items: RestaurantItem[]): string[] {
  const labels = new Set<string>();
  for (const r of items) {
    for (const label of r.categoryLabels ?? []) {
      const trimmed = label.trim();
      if (trimmed) labels.add(trimmed);
    }
  }
  return [ALL_RESTAURANT_CATEGORY, ...Array.from(labels).sort((a, b) => a.localeCompare(b))];
}

export function filterRestaurants(
  items: RestaurantItem[],
  category: string,
  query: string,
): RestaurantItem[] {
  const q = query.trim().toLowerCase();
  return items.filter(r => {
    const matchesCat =
      category === ALL_RESTAURANT_CATEGORY ||
      (r.categoryLabels ?? []).some(label => label.toLowerCase() === category.toLowerCase());
    if (!matchesCat) return false;
    if (!q) return true;
    return (
      r.name.toLowerCase().includes(q) ||
      r.cuisine.toLowerCase().includes(q) ||
      (r.categoryLabels ?? []).some(label => label.toLowerCase().includes(q))
    );
  });
}
