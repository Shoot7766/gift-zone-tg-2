export type UserRole = "customer" | "seller" | "admin";

export type DbUser = {
  id: string;
  telegram_id: number | string;
  role: UserRole | null;
  username?: string | null;
  first_name?: string | null;
  phone_number?: string | null;
};

export type DbShop = {
  id: string;
  name: string;
  description: string | null;
  city: string | null;
  logo_url: string | null;
  banner_url: string | null;
  is_approved: boolean;
  is_featured: boolean;
  subscription_type: string | null;
  owner_telegram_username: string | null;
};

export type DbProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  shop_id: string;
  is_active: boolean;
  created_at: string;
  is_featured?: boolean | null;
  badge?: "hot" | "star" | "top" | null;
};

export type ProductWithShop = DbProduct & {
  shops: DbShop | null;
};

export type DbFavorite = {
  id: string;
  user_id?: string;
  telegram_id?: number | string;
  product_id: string;
};
