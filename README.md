# Kotibam

code written by CodeNur

`Kotibam` bu savdo jarayonlari, lead boshqaruvi, task nazorati va analitikani yagona interfeysda birlashtiruvchi web platforma.

Production manzil: `https://ai-crm.uz`

## Loyiha haqida

Platforma CRM jamoalari uchun ishlab chiqilgan bo'lib, foydalanuvchilarga quyidagi imkoniyatlarni beradi:

- leadlarni boshqarish
- statuslar bo'yicha kuzatish
- tasklar va jarayonlarni nazorat qilish
- analitika va dashboard ko'rinishida natijalarni tahlil qilish
- SMS/rassilka orqali aloqa yuritish
- loyiha va rol asosidagi kirish nazorati

Ilova `React + Vite` asosida yozilgan va production uchun tezkor, modulli hamda kengaytiriladigan frontend arxitekturaga ega.

## Asosiy imkoniyatlar

- Login va token asosidagi autentifikatsiya
- Role-based access control: `ADMIN`, `ROP`, `SALESMANAGER`
- Project tanlash va project context asosida ishlash
- Dashboard ko'rsatkichlari
- Leadlar ro'yxati va batafsil sahifasi
- Kanban jarayoni
- Tasklar boshqaruvi
- Status va lead manbalarini boshqarish
- Analitika sahifasi
- SMS/rassilka moduli
- Profil va sozlamalar sahifalari

## Texnologiyalar

- `React 18`
- `Vite 6`
- `React Router`
- `Tailwind CSS 4`
- `ShadCN UI`
- `Recharts`
- `Lucide React`
- `React Hook Form`
- `Zod`
- `Sonner`

## Arxitektura

Loyiha SPA ko'rinishida tashkil qilingan va asosiy routing [src/App.jsx](procrm/src/App.jsx) faylida boshqariladi.

Asosiy tarkib:

- `src/pages` - sahifalar
- `src/components` - qayta ishlatiladigan UI va layout komponentlar
- `src/components/ui` - bazaviy UI bloklar
- `src/lib` - utility va RBAC logikasi
- `src/hooks` - custom hooklar
- `public` - statik assetlar

## Rollar va kirish darajalari

Tizimda uchta asosiy rol mavjud:

- `SUPERADMIN`
- `ROP`
- `SALESMANAGER`

Rollar va navigatsiya sozlamalari [src/lib/rbac.js](procrm/src/lib/rbac.js) ichida boshqariladi.

## Asosiy sahifalar

- `Dashboard` - umumiy ko'rsatkichlar
- `Leadlar` - mijozlar va leadlar bilan ishlash
- `Tasklar` - vazifalarni boshqarish
- `Analitika` - status, trend, task va xodimlar bo'yicha ko'rsatkichlar
- `Lead manbasi` - lead source boshqaruvi
- `Projectlar` - loyihalarni boshqarish
- `SMS/Rassilka` - ommaviy xabar yuborish
- `Profil` - foydalanuvchi profili
- `Sozlamalar` - tizim konfiguratsiyasi

## O'rnatish

Talablar:

- `Node.js 18+`
- `npm`

Dependency o'rnatish:

```bash
npm install
```

## Development rejimida ishga tushirish

```bash
npm run dev
```

Lokal ishga tushgandan keyin brauzer orqali Vite ko'rsatgan manzilga kiring.

## Production build

```bash
npm run build
```

Build natijasi `dist/` papkaga chiqariladi.

## Muhim eslatmalar

- Ilova `localStorage` orqali token, user ma'lumotlari va tanlangan project context'ni saqlaydi.
- Routing `ProtectedRoute` va `ProjectGate` orqali himoyalangan.
- Analitika sahifasi statuslar, tasklar, trend va xodimlar kesimida ma'lumotlarni vizuallashtiradi.
- Ba'zi sahifalar project tanlanmaguncha ishga tushmaydi.

## Tavsiya etilgan ish jarayoni

1. `.env` faylni sozlang
2. `npm install` orqali dependency o'rnating
3. `npm run dev` bilan lokal ishga tushiring
4. production uchun `npm run build` bajaring

## Deploy

Frontend build qilinganidan so'ng istalgan statik hosting yoki Node asosidagi deploy platformaga joylashtirilishi mumkin.

Tavsiya:

- `Vercel`
- `Netlify`
- `Nginx` orqali static serve

Production domen:

- `https://ai-crm.uz`

## Kod sifati

Loyiha modulli tarzda yozilgan. Yangi funksiya qo'shishda quyidagilarga amal qilish tavsiya etiladi:

- sahifa logikasini `pages` ichida saqlash
- umumiy UI ni `components` ichiga ajratish
- helper va utility funksiyalarni `lib` ichida ushlash
- role va access logikasini markaziy boshqarish

## Mualliflik va loyiha maqsadi

Ushbu loyiha savdo bo'limlari va CRM jamoalari uchun ish jarayonini soddalashtirish, leadlar bilan ishlashni tezlashtirish va qaror qabul qilish uchun aniq ko'rsatkichlar berishga qaratilgan.
