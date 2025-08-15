export interface SignUpResponse {
  data: {
    user: User;
  };
}

export interface MessageResponse {
  message: string;
  code: string;
}

export interface User {
  id: number;
  language_id: number;
  first_name?: string;
  last_name?: string;
  full_name: string;
  country_code: string;
  calling_code: string;
  username: string | null;
  email: string;
  notification_count: number;
  about: string | null;
  verification_code: string;
  expired_at: string;
  email_verified_at: string | null;
  social_id: string | null;
  provider: string | null;
  experience: string | null;
  country: string | null;
  city: string | null;
  state: string | null;
  is_email_verified: string | boolean;
  address: string | null;
  longitude: number | null;
  latitude: number | null;
  phone_verification_code: string;
  phone_verified_at: string | null;
  forgot_password_code: string | null;
  forgot_token: string | null;
  gender: string | null;
  dob: string | null;
  profile_image: string | null | undefined;
  customer_stripe_id: string | null;
  is_onbording_complete: number;
  status: number;
  is_active: number;
  is_approved: number;
  availabilty: number;
  is_notify: number;
  user_type: string;
  user_role: string;
  updated_at: string;
  is_subscribed: boolean;
  is_location_updated: boolean;
  token: string;
  token_type: string;
  issue_date: string | null;
  background_image?: string | null;
  balance?: number;
  bio?: string | null;
  category?: string | null;
  createdAt?: string;
  invitation_code?: string | null;
  is_phone_verified?: boolean;
  language?: string | null;
  phone_number?: string | null;
  region?: string | null;
  updatedAt?: string;
  user_name?: string;
  website_url?: string | null;
  whatsapp_number?: string | null;
}

// export type BusinessFlowSlug =
//   | 'ticket_purchase'
//   | 'room_booking'
//   | 'service_inquiry'
//   | 'reservation_booking'
//   | 'grocery_order'
//   | 'fashion_order'
//   | 'health_order'
//   | 'property_inquiry'
//   | 'electronic_order'
//   | 'interior_order';

export const BUSINESS_FLOW_SLUGS = {
  EVENTS: 'ticket_purchase',
  ROOM_BOOKING: 'room_booking',
  SERVICE_INQUIRY: 'service_inquiry',
  ORDER_YOUR_FOOD: 'food_order',
  GROCERY_ORDER: 'grocery_order',
  FASHION_ORDER: 'fashion_order',
  HEALTH_ORDER: 'health_order',
  PROPERTY_INQUIRY: 'property_inquiry',
  ELECTRONICS: 'electronic_order',
  INTERIOR: 'interior_order',
} as const;

export const FILTER_NAMES = {
  UPCOMING: 'upcoming',
  TRENDING: 'trending',
  NEAR_BY: 'nearby',
  CATEGORIES: 'item_categories',
} as const;

export type filterTypes = (typeof FILTER_NAMES)[keyof typeof FILTER_NAMES];

export const CATEGORY_NAMES = {
  EVENTS: 'Events',
  FASHION: 'Fashion',
  GROCERY: 'Grocery',
  SPA: 'SPA',
  SALOONS: 'Salons', //TODO: SET BACKEND TYPo
  HEALTH: 'Health',
  REAL_ESTATE: 'Real Estate',
  ELECTRONICS: 'Electronics',
  INTERIOR: 'Interior',
  HOTELS: 'Hotels',
  SHORTLET: 'Shortlet',
  ORDER_YOUR_FOOD: 'Order Your Food',
  RESTAURANT_RESERVATION: 'Restaurant Reservation',
} as const;

// 👇 Type from the values of the object
export type BusinessFlowSlug = (typeof BUSINESS_FLOW_SLUGS)[keyof typeof BUSINESS_FLOW_SLUGS];
export type CategoryNameTypes = (typeof CATEGORY_NAMES)[keyof typeof CATEGORY_NAMES];

export interface BusinessFlow {
  id: number;
  title: string;
  slug: string;
  descripetion: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Subcategory {
  id: number;
  title: string;
  icon: string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  subcategories: Category[];
}

export interface Category {
  id: number;
  title: CategoryNameTypes;
  icon: string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  is_subcategory: boolean;
  subcategories: Category[];
  items: CategoryItem[];
  upcoming: CategoryItem[];
  trending: CategoryItem[];
  item_categories: CategoryItem[];
  nearby: CategoryItem[];
  business_flow: BusinessFlow | null;
}

// For the full list of categories
export type CategoryList = Category[];

export type CategoryListResponse = {
  categories: Category[];
};

export interface Favourite {
  id: number;
  object_id: number;
  object_type: string; // e.g., "App\\Models\\vendor"
  is_liked: boolean;
  created_at: string;
  updated_at: string;
}

export type FavoriteResponse = {
  favourite: Favourite;
};

export interface EventDetail {
  id: number;
  item_id: number;
  city: string;
  country: string;
  address: string;
  date: string;
  start_time: string;
  end_time: string;
  about: string;
}

export interface CategoryItem {
  id: number;
  vendor_id: number;
  item_category_id: number;
  category_id: number;
  title: string;
  description: string;
  item_type: string;
  price: string;
  currency: string;
  stock_quantity: number;
  is_available: boolean;
  booking_required: boolean;
  call_only: boolean;
  featured: boolean;
  distance: string;
  rating_count: number;
  rating_avg: number;
  is_liked: boolean;
  rating: any[]; // Or a proper Rating[] interface
  createdAt: string;
  updatedAt: string;
  vendor: Vendor;
  itemCategory: ItemCategory;
  media: Media[];
  name?: string; //if it will be item category
  icon?: string | null; //if it will be item category
  eventDetail: EventDetail; // ✅ Newly added
}

export interface Vendor {
  id: number;
  full_name: string;
  user_name: string;
  email: string;
  phone_number: string;
  whatsapp_number: string;
  website_url: string;
  gender: string | null;
  dob: string | null;
  bio: string;
  about: string;
  profile_image: string | null;
  background_image: string | null;
  address: string;
  country: string;
  country_code: string | null;
  state: string;
  city: string;
  latitude: number;
  longitude: number;
  invitation_code: string | null;
  balance: number;
  user_type: string;
  user_role: string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  business_name: string | null;
  business_logo: string | null;
  cover_image: string | null;
  business_registration_number: string | null;
  government_issued_id: string | null;
  business_license: string | null;
  verification_status: string;
  notes: string | null;
  distance: string | null;
  rating_count: number;
  rating_avg: number | null;
  is_rated: boolean;
  is_liked: boolean;
  rating: any[];
  notification_count: number;
  is_active: boolean;
  is_notify: boolean;
  createdAt: string;
  updatedAt: string;
  schedules: [];
  category: {
    id: number;
    category_id: number;
    title: CategoryNameTypes;
    business_flow_id: number;
    sort_order: number;
    is_active: boolean;
    icon: string;
    thumbnail: string;
  };
}

export interface ItemCategory {
  id: number;
  category_id: number;
  vendor_id: number | null;
  name: string;
  slug: string;
  description: string;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
  createdAt: string;
  updatedAt: string;
  category: {
    id: number;
    title: CategoryNameTypes;
    business_flow_id: number;
    sort_order: number;
    icon: string;
    thumbnail: string;
    is_subcategory: boolean;
    createdAt: string;
    updatedAt: string;
  };
}
export interface Media {
  id: number;
  item_id: number;
  media_url: string;
  media_type: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
}
