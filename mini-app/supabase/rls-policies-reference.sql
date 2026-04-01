-- =============================================================================
-- Gift Zone — RLS namunasi (Supabase SQL Editor da tekshirib qo‘llang)
-- Maqsad: anon kalit bilan faqat TASDIQLANGAN do‘kon va FAOL mahsulotlarni o‘qish.
--
-- Eslatma: favorites jadvalida RLS qat’iy qo‘yilsa, Telegram initData bilan
-- anon kalit odatda foydalanuvchini ajratmaydi. Saqlanganlar uchun:
--   - Edge Function + service_role, yoki
--   - Backend API orqali yozish
-- tavsiya etiladi. Shu faylda favorites uchun RLS yo‘q.
-- =============================================================================

alter table if exists public.shops enable row level security;
alter table if exists public.products enable row level security;

drop policy if exists "shops_public_read_approved" on public.shops;
create policy "shops_public_read_approved"
  on public.shops
  for select
  to anon, authenticated
  using (is_approved = true);

drop policy if exists "products_public_read_active" on public.products;
create policy "products_public_read_active"
  on public.products
  for select
  to anon, authenticated
  using (
    is_active = true
    and exists (
      select 1
      from public.shops s
      where s.id = products.shop_id
        and s.is_approved = true
    )
  );

-- Yozish: mahsulot/do‘kon qo‘shishni faqat service_role yoki authenticated seller bilan cheklang.
-- Masalan, INSERT/UPDATE/DELETE uchun alohida siyosatlar yoki umuman yo‘q (faqat dashboard).
