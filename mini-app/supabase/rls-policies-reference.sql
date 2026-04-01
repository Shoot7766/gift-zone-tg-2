-- =============================================================================
-- Gift Zone — RLS (Supabase SQL Editor)
-- Agar "column is_approved does not exist" chiqsa: 1-bo‘limdagi ALTER lar ustunlarni qo‘shadi.
-- =============================================================================

-- 1) Ilova kutilgan ustunlar (allaqachon bo‘lsa, hech narsa o‘zgarmaydi)
alter table public.shops
  add column if not exists is_approved boolean default true;

alter table public.shops
  add column if not exists is_featured boolean default false;

alter table public.shops
  add column if not exists subscription_type text default 'free';

alter table public.shops
  add column if not exists owner_telegram_username text;

alter table public.products
  add column if not exists is_active boolean default true;

-- Eski qatorlarda NULL bo‘lib qolmasin (ixtiyoriy, lekin tavsiya)
update public.shops set is_approved = true where is_approved is null;
update public.shops set is_featured = false where is_featured is null;
update public.products set is_active = true where is_active is null;

-- 2) RLS
alter table public.shops enable row level security;
alter table public.products enable row level security;

drop policy if exists "shops_public_read_approved" on public.shops;
create policy "shops_public_read_approved"
  on public.shops
  for select
  to anon, authenticated
  using (coalesce(is_approved, true) = true);

drop policy if exists "products_public_read_active" on public.products;
create policy "products_public_read_active"
  on public.products
  for select
  to anon, authenticated
  using (
    coalesce(is_active, true) = true
    and exists (
      select 1
      from public.shops s
      where s.id = products.shop_id
        and coalesce(s.is_approved, true) = true
    )
  );

-- Yozish: INSERT/UPDATE/DELETE alohida siyosat yoki service_role.

-- order_requests: faqat service_role (Next API) yozadi (RLS yoqilgan, siyosat yo‘q = anon o‘qiy olmaydi)
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'order_requests'
  ) then
    alter table public.order_requests enable row level security;
  end if;
end $$;

-- favorites: anon kalit bilan yozishni yopish; /api/favorites/* + service_role
drop policy if exists "favorites_public_all" on public.favorites;
drop policy if exists "favorites_select_own" on public.favorites;
drop policy if exists "favorites_insert_own" on public.favorites;
drop policy if exists "favorites_delete_own" on public.favorites;
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'favorites'
  ) then
    alter table public.favorites enable row level security;
  end if;
end $$;

-- =============================================================================
-- VARIANT B: Do‘kon jadvalida hech qachon is_approved bo‘lmasin desangiz,
-- quyidagi ikki policy ni yuqoridagilar o‘rniga ishlating (1-bo‘lim va 2-bo‘limni o‘chirib):
--
-- alter table public.products enable row level security;
-- create policy "products_read_all_active"
--   on public.products for select to anon, authenticated
--   using (coalesce(is_active, true) = true);
--
-- alter table public.shops enable row level security;
-- create policy "shops_read_all"
--   on public.shops for select to anon, authenticated
--   using (true);
-- =============================================================================
