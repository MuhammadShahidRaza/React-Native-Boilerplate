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
  username: string | null;
  email: string;
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

export interface Subcategory {
  id: number;
  title: string;
  icon: string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  subcategories: Subcategory[]; // supports further nesting
}

export interface Category {
  id: number;
  title: string;
  icon: string;
  thumbnail: string;
  createdAt: string;
  updatedAt: string;
  is_subcategory: boolean;
  subcategories: Subcategory[];
  items: CategoryItem[];
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
  specifications: {
    venue: string;
    category: string;
    duration: string;
    age_limit: string;
  };
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
  eventDetail: EventDetail; // ✅ Newly added
}

export interface Vendor {
  id: number;
  full_name: string;
  user_name: string;
  email: string;
  password: string;
  provider_id: string | null;
  provider: string;
  phone_number: string;
  whatsapp_number: string;
  website_url: string;
  gender: string | null;
  dob: string | null;
  bio: string;
  about: string;
  profile_image: string | null;
  background_image: string | null;
  category_id: number;
  referal_id: number | null;
  region_id: number | null;
  language_id: number | null;
  address: string;
  country_code: string | null;
  country: string;
  state: string;
  city: string;
  latitude: number;
  longitude: number;
  verification_token: string | null;
  invitation_code: string | null;
  balance: number;
  user_type: string;
  user_role: string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  is_active: boolean;
  is_notify: boolean;
  business_name: string | null;
  business_logo: string | null;
  cover_image: string | null;
  business_registration_number: string | null;
  government_issued_id: string | null;
  business_license: string | null;
  verification_status: string;
  notes: string | null;
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
  category: {
    id: number;
    category_id: number | null;
    title: string;
    category_type: string | null;
    sort_order: number;
    is_active: boolean;
    icon: string;
    thumbnail: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
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
