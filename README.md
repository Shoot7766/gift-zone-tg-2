# Gift Zone — Telegram marketplace

- **backend/** — Express + Telegraf + Prisma (bot onboarding, ixtiyoriy REST).
- **mini-app/** — **Next.js 15** + TypeScript + **Tailwind CSS** + **Supabase** (asosiy Mini App).

Barcha foydalanuvchi matnlari o‘zbek tilida.

## Mini App (Next.js)

```bash
cd mini-app
cp .env.example .env.local
# NEXT_PUBLIC_SUPABASE_URL va NEXT_PUBLIC_SUPABASE_ANON_KEY ni qo‘ying
npm install
npm run dev
```

Brauzer: [http://localhost:3001](http://localhost:3001) (backend 3000 bilan ziddiyat bo‘lmasligi uchun). Telegram ichida `MINI_APP_URL` HTTPS domen bo‘lishi kerak.

### Supabase

1. Supabase loyiha yarating.
2. `.env.local` ga `NEXT_PUBLIC_SUPABASE_URL` va `NEXT_PUBLIC_SUPABASE_ANON_KEY` qo‘shing.
3. Quyidagi jadvallar (snake_case) mos kelishi kerak: `users`, `shops`, `products`, `orders`, `favorites`.
4. **RLS** siyosatlarini o‘zingiz sozlang (anon read uchun `shops` tasdiqlangan, `products` faol bo‘lishi mumkin).

Supabase ulanmagan bo‘lsa ham ilova **namoyish (mock)** ma’lumotlar bilan ishlaydi — sahifalar bo‘sh qolmaydi.

### Vercel (muhim)

1. **Settings → General → Root Directory:** `mini-app` (loyiha ildizi emas!)
2. **Settings → General → Build & Development Settings:**
   - **Framework Preset:** Next.js
   - **Output Directory** maydonini **bo‘sh qoldiring** (Next.js o‘zi `.next` ishlatadi). Agar u yerda `public` yoki `dist` turgan bo‘lsa — **o‘chirib** saqlang.
3. **Environment Variables:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

`mini-app/vercel.json` faqat `framework: nextjs` ni bildiradi. Repozitoriy **ildizidan** deploy qilsangiz va Root Directory bo‘sh qolsa, Vercel `public` qidiradi — xato chiqadi.

## Backend (bot)

```bash
cd backend
# .env — BOT_TOKEN, MINI_APP_URL (Next deploy URL), ...
npm install
npx prisma db push
npm run dev
```

## Loyiha tuzilishi (mini-app)

```
mini-app/
  app/              App Router sahifalari
  components/       UI, layout, home
  hooks/            useSupabase, useCart, useDebouncedValue, ...
  lib/              supabase client, telegram, mock
  services/         products, shops, favorites, users
  types/            DB turlari
```

## Birinchi testlar

1. `npm run dev` — bosh sahifa, mahsulotlar, do‘konlar ochilishi.
2. Supabase kalitsiz — mock kontent ko‘rinishi.
3. Supabase bilan — tasdiqlangan do‘kon + faol mahsulotlar chiqishi.
4. Telegram Desktop — Mini App tugmasi `MINI_APP_URL` ni ochishi.
