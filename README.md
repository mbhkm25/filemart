# FileMart

منصة إنشاء الملفات التجارية الاحترافية

## المشروع

FileMart هي منصة ويب تقدّمية (PWA) تتيح لأصحاب الأعمال إنشاء ملف تجاري احترافي مع كاتلوج منتجات ونظام طلبات.

## التقنيات المستخدمة

- **Next.js 15** - App Router
- **TypeScript**
- **Tailwind CSS** - مع دعم RTL
- **IBM Plex Sans Arabic** - الخط الأساسي
- **Neon DB** - قاعدة البيانات (PostgreSQL)
- **Cloudinary** - إدارة الصور
- **Zod** - التحقق من البيانات
- **Jest** - Unit Testing
- **Playwright** - E2E Testing

## هيكل المشروع

```
filemart/
├── app/                    # Next.js App Router
│   ├── (public)/           # Public routes
│   ├── dashboard/         # Merchant dashboard
│   ├── admin/             # Admin panel
│   └── api/               # API routes
├── components/             # React components
│   ├── common/            # Shared components
│   ├── public/            # Public UI components
│   ├── dashboard/         # Dashboard components
│   └── admin/             # Admin components
├── lib/                   # Utility functions
├── services/              # API services
├── types/                 # TypeScript types
└── plugins/               # Plugin system
```

## التثبيت

```bash
npm install
```

## التشغيل

```bash
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000) في المتصفح.

## الوثائق

جميع الوثائق موجودة في مجلد `/documentation`:

- **ESS.md** - Product Requirements Document
- **FAM.md** - Architecture Map
- **FCI.md** - Component Inventory
- **FDFD.md** - Data Flow Diagrams
- **FIS.md** - Interaction Specifications

## الحالة الحالية

**Phase 1: Base Project Setup** ✅

- ✅ Next.js 15 project initialized
- ✅ TypeScript configured
- ✅ Tailwind CSS + RTL support
- ✅ Folder structure created
- ✅ Placeholder components added

## الخطوات التالية

- Phase 2: Core Infrastructure
- Phase 3: Shared Components Implementation
- Phase 4: Public Experience
- Phase 5: Merchant Dashboard
- Phase 6: Admin Panel
- Phase 7: Plugin System
- Phase 8: PWA & Optimization
- Phase 9: Testing & Polish

