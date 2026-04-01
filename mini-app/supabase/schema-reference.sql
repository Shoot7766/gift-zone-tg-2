-- Supabase uchun namuna sxema (moslashtiring).
-- RLS uchun: rls-policies-reference.sql faylini qarang.

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint unique not null,
  role text check (role in ('customer', 'seller', 'admin')),
  username text,
  first_name text,
  phone_number text,
  created_at timestamptz default now()
);

create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  city text,
  logo_url text,
  banner_url text,
  is_approved boolean default false,
  is_featured boolean default false,
  subscription_type text default 'free',
  owner_telegram_username text,
  created_at timestamptz default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops (id) on delete cascade,
  name text not null,
  description text,
  price numeric not null,
  image_url text,
  category text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Sevimlilar: RLS + server API (/api/favorites/*, initData + service_role). Anon kalit bilan emas.
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint not null,
  product_id uuid references public.products (id) on delete cascade,
  created_at timestamptz default now(),
  unique (telegram_id, product_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_telegram_id bigint,
  product_id uuid references public.products (id),
  quantity int default 1,
  total_price numeric,
  status text default 'pending',
  created_at timestamptz default now()
);

-- Mini App «Buyurtma berish»: /api/order-request (initData tekshiruvi + service_role)
create table if not exists public.order_requests (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint not null,
  username text,
  first_name text,
  lines jsonb not null,
  total numeric,
  status text default 'pending',
  created_at timestamptz default now()
);

create index if not exists order_requests_telegram_id_idx on public.order_requests (telegram_id);
create index if not exists order_requests_created_at_idx on public.order_requests (created_at desc);
