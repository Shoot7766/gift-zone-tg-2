# Gift Zone — Telegram marketplace

Modulli tuzilma: **backend** (Express + Telegraf + Prisma), **mini-app** (React + Vite). Foydalanuvchiga ko‘rinadigan barcha matnlar o‘zbek tilida.

## Tuzilma

```
backend/          API, bot webhook/polling, SQLite (prod uchun PostgreSQL ga o‘tkazish oson)
  prisma/         schema.prisma
  src/bot/        Telegraf, o‘zbekcha xabarlar
  src/routes/     auth, public, customer, seller, admin
  scripts/        promote-admin.ts
mini-app/         Telegram Mini App (React)
```

## Ishga tushirish (mahalliy)

1. `backend/.env` — `.env.example` dan nusxa; `BOT_TOKEN` ni to‘ldiring.
2. Lokal **brauzerda** mini app ko‘rish: `DEV_AUTH=true` va brauzerda manzil:
   - mijoz: http://localhost:5173/?devRole=customer  
   - sotuvchi: http://localhost:5173/?devRole=seller  
   - admin: http://localhost:5173/?devRole=admin  
   (`production`da `DEV_AUTH` ishlatilmaydi.)
3. `mini-app/.env` — `VITE_API_URL=http://localhost:3000`
4. `cd backend && npm install && npx prisma db push && npm run dev`
5. `cd mini-app && npm install && npm run dev`
6. **Telegram orqali:** botda «Gift Zone'ni ochish» — `MINI_APP_URL` (odatda `http://localhost:5173`). Telefonda odatda **HTTPS tunnel** (ngrok, cloudflared) kerak.

**Admin rolini** botda tanlash — faqat sinov uchun; haqiqiy loyihada adminni DB orqali berish yaxshiroq:

```bash
cd backend
set TELEGRAM_ID=123456789
npm run promote-admin
```

## Production

- `WEBHOOK_URL` o‘rnating (masalan `https://api.sizning-domen.uz`); `MINI_APP_URL` — HTTPS mini ilova.
- `PUBLIC_API_BASE_URL` — tashqi URL (rasm linklari uchun).
- SQLite o‘rniga `postgresql://...` va `prisma migrate deploy`.

### Mini App — Vercel

1. Vercel’da **yangi loyiha** → GitHub repo (`gift-zone-tg-2`) ni ulang.
2. **Ildizdagi `vercel.json`** `mini-app` ni build qiladi va chiqishni `mini-app/dist` ga qo‘yadi — qo‘shimcha “Root Directory” sozlashi shart emas.
3. Agar 404 chiqsa: Vercel → Project → **Settings → General → Root Directory** bo‘sh qoldiring (yoki `mini-app` qilib faqat shu papkani deploy qilsangiz, ildizdagi `vercel.json` ni o‘chirib tashlang va Framework: Vite, Output: `dist`).
4. **Environment Variables:** `VITE_API_URL` = backend HTTPS manzili (oxirida `/` bo‘lmasin).
5. Deploy URL ni **BotFather** va `MINI_APP_URL` ga qo‘ying.

**Eslatma:** `?devRole=...` faqat `npm run dev` da ishlaydi; production buildda yo‘q — bu xavfsizlik uchun to‘g‘ri.
