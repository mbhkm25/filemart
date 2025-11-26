# قائمة التحقق قبل النشر على Vercel

## ✅ الإصلاحات المكتملة

- [x] **PWA Icons**: تم إضافة الأيقونات في `public/icons/`
  - [x] `icon-192x192.png`
  - [x] `icon-512x512.png`
  - [x] `apple-touch-icon.png`

- [x] **Service Worker Offline Path**: تم إصلاح مسار `/offline` إلى `/offline.html`
  - [x] تحديث `STATIC_ASSETS` في `public/sw.js`
  - [x] تحديث fallback path في fetch handler

---

## 📋 قائمة التحقق قبل النشر

### 1. Environment Variables (متغيرات البيئة)

#### إلزامية:
- [ ] `DATABASE_URL` - مع `?sslmode=require`
- [ ] `JWT_SECRET` - قوي (32+ حرف)
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_UPLOAD_PRESET`
- [ ] `NEXT_PUBLIC_APP_URL` - (يمكن تعيينه بعد أول deploy)

#### اختيارية (لكن موصى بها):
- [ ] `SMTP_HOST`
- [ ] `SMTP_PORT`
- [ ] `SMTP_USERNAME`
- [ ] `SMTP_PASSWORD`
- [ ] `SMTP_FROM_EMAIL`
- [ ] `SMTP_FROM_NAME`

### 2. Database Setup

- [ ] تم تشغيل `db/schema.sql` على Neon database
- [ ] تم تشغيل `db/migrations/add_settings_table.sql`
- [ ] تم إنشاء admin user (استخدم `scripts/create-admin.js`)

### 3. Cloudinary Setup

- [ ] تم إنشاء حساب Cloudinary
- [ ] تم إنشاء Upload Preset
- [ ] تم إضافة credentials في Vercel Environment Variables

### 4. Vercel Project Setup

- [ ] تم ربط GitHub repository
- [ ] تم إضافة جميع Environment Variables
- [ ] تم التحقق من Build Settings (Next.js auto-detected)

### 5. Post-Deployment Checks

بعد النشر، تحقق من:

- [ ] الصفحة الرئيسية تعمل (`/`)
- [ ] Service Worker مسجل (تحقق من Console: "Service Worker registered")
- [ ] Manifest يعمل (`/manifest.json`)
- [ ] تسجيل حساب جديد (`/signup`)
- [ ] تسجيل دخول (`/login`)
- [ ] Dashboard يعمل (`/dashboard`)
- [ ] رفع صورة (مع Cloudinary credentials)
- [ ] إنشاء ملف تجاري
- [ ] عرض ملف تجاري عام (`/[slug]`)
- [ ] PWA installation prompt (في mobile)

---

## 🔧 الإصلاحات المطلوبة (قبل النشر)

### ✅ مكتملة:
1. ✅ PWA Icons - تم إضافتها
2. ✅ Service Worker offline path - تم إصلاحه

### ⏳ المتبقية:
1. ⏳ إضافة Environment Variables في Vercel
2. ⏳ إعداد Database (تشغيل migrations)
3. ⏳ إعداد Cloudinary
4. ⏳ إنشاء admin user

---

## 📝 خطوات النشر

### الخطوة 1: إعداد Vercel Project
1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. اضغط "Add New Project"
3. اربط GitHub repository `filemart`
4. Vercel سيكتشف Next.js تلقائياً

### الخطوة 2: إضافة Environment Variables
1. في Project Settings → Environment Variables
2. أضف جميع المتغيرات الإلزامية (راجع `ENV_VARIABLES.md`)
3. اختر Environment: Production, Preview, Development

### الخطوة 3: Deploy
1. اضغط "Deploy"
2. انتظر اكتمال البناء (2-5 دقائق)
3. راجع Build Logs للتأكد من عدم وجود أخطاء

### الخطوة 4: Post-Deployment
1. حدّث `NEXT_PUBLIC_APP_URL` بـ production URL
2. راجع Deployment Logs
3. اختبر الميزات الأساسية

---

## 🚨 مشاكل محتملة وحلولها

### Build Fails
- **السبب**: Environment variables مفقودة
- **الحل**: أضف `DATABASE_URL` و `JWT_SECRET` على الأقل

### Database Connection Error
- **السبب**: `DATABASE_URL` غير صحيح أو بدون SSL
- **الحل**: أضف `?sslmode=require` في النهاية

### Image Upload Fails
- **السبب**: Cloudinary credentials مفقودة
- **الحل**: أضف `CLOUDINARY_CLOUD_NAME` و `CLOUDINARY_UPLOAD_PRESET`

### Authentication Fails
- **السبب**: `JWT_SECRET` غير صحيح
- **الحل**: تأكد من استخدام نفس `JWT_SECRET` في جميع البيئات

### Service Worker Not Working
- **السبب**: مسار `/sw.js` غير صحيح
- **الحل**: تحقق من أن `public/sw.js` موجود ويمكن الوصول إليه

---

## 📚 ملفات التوثيق

- `DEPLOYMENT.md` - دليل النشر الشامل
- `ENV_VARIABLES.md` - مرجع متغيرات البيئة
- `VERCEL_ENV_SETUP.md` - إعداد Environment Variables في Vercel
- `.env.example` - مثال على ملف environment variables

---

## ✅ الحالة النهائية

بعد إكمال جميع الخطوات:
- ✅ المشروع جاهز للنشر
- ✅ جميع الإصلاحات المطلوبة مكتملة
- ✅ التوثيق جاهز
- ⏳ يبقى إضافة Environment Variables في Vercel

**الخطوة التالية**: إضافة Environment Variables في Vercel Dashboard ثم Deploy!

