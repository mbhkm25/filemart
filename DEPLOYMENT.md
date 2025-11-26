# دليل النشر على Vercel - FileMart

## متطلبات النشر

### 1. Environment Variables (متغيرات البيئة)

#### متغيرات إلزامية (Required)

يجب إضافة هذه المتغيرات في Vercel Dashboard → Settings → Environment Variables:

##### Database
```
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```
- **الوصف**: Neon DB connection string
- **مصدر**: من Neon Dashboard → Connection String
- **ملاحظة**: تأكد من إضافة `?sslmode=require` في النهاية

##### Authentication
```
JWT_SECRET=your-very-strong-secret-key-here-minimum-32-characters
```
- **الوصف**: Secret key لتوقيع JWT tokens
- **مصدر**: أنشئ مفتاح قوي (32+ حرف)
- **ملاحظة**: **لا تستخدم القيمة الافتراضية في الإنتاج!**

##### Cloudinary (لرفع الصور)
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```
أو
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```
- **الوصف**: Cloudinary credentials لرفع الصور
- **مصدر**: من Cloudinary Dashboard
- **ملاحظة**: بدونها ستفشل عملية رفع الصور

##### Application URL
```
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```
- **الوصف**: Production URL للمنصة
- **مصدر**: Vercel deployment URL
- **ملاحظة**: مهم لروابط الملفات التجارية العامة

#### متغيرات اختيارية (Optional)

##### JWT Expiration
```
JWT_EXPIRES_IN=7d
```
- **Default**: `7d`
- **الوصف**: مدة صلاحية JWT token

##### SMTP (لإرسال البريد الإلكتروني)
```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=your-email@example.com
SMTP_PASSWORD=your-password
SMTP_FROM_EMAIL=noreply@filemart.com
SMTP_FROM_NAME=FileMart
```
- **الوصف**: إعدادات SMTP لإرسال البريد
- **ملاحظة**: يمكن إعدادها من Admin Panel بعد النشر
- **بدونها**: Email notifications لن تعمل

##### API URL (اختياري)
```
NEXT_PUBLIC_API_URL=/api
```
- **Default**: `/api`
- **الوصف**: Base URL للـ API

##### Base URL (اختياري)
```
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```
- **Default**: `http://localhost:3000`
- **الوصف**: Base URL للمنصة

---

## خطوات النشر على Vercel

### الخطوة 1: إعداد Vercel Project

1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. اضغط "Add New Project"
3. اربط GitHub repository
4. اختر `filemart` repository

### الخطوة 2: إعداد Build Settings

Vercel سيكتشف تلقائياً:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### الخطوة 3: إضافة Environment Variables

في صفحة Project Settings → Environment Variables:

1. أضف جميع المتغيرات الإلزامية المذكورة أعلاه
2. اختر **Environment**: Production, Preview, Development (أو Production فقط)
3. احفظ التغييرات

### الخطوة 4: Deploy

1. اضغط "Deploy"
2. انتظر اكتمال البناء
3. تحقق من الـ logs للتأكد من عدم وجود أخطاء

### الخطوة 5: التحقق من النشر

بعد النشر، تحقق من:

1. ✅ الصفحة الرئيسية تعمل
2. ✅ Service Worker مسجل (`/sw.js`)
3. ✅ Manifest يعمل (`/manifest.json`)
4. ✅ Database connection يعمل (جرب login/signup)
5. ✅ Image upload يعمل (مع Cloudinary credentials)

---

## إعدادات ما بعد النشر

### 1. إعداد Database

1. تأكد من تشغيل `db/schema.sql` على Neon database
2. تأكد من تشغيل `db/migrations/add_settings_table.sql`
3. أنشئ admin user باستخدام:
   ```bash
   node scripts/create-admin.js
   ```

### 2. إعداد System Settings

1. سجل دخول كـ admin
2. اذهب إلى `/admin/settings`
3. أضف SMTP settings (إذا لم تضيفها في environment variables)
4. أضف Cloudinary settings (إذا لم تضيفها في environment variables)

### 3. اختبار الميزات

- [ ] تسجيل حساب جديد
- [ ] تسجيل دخول
- [ ] إنشاء ملف تجاري
- [ ] رفع صورة
- [ ] إضافة منتج
- [ ] إنشاء طلب (من public profile)
- [ ] PWA installation

---

## استكشاف الأخطاء

### خطأ: Database connection failed
- **الحل**: تحقق من `DATABASE_URL` وأضف `?sslmode=require`

### خطأ: JWT verification failed
- **الحل**: تأكد من تعيين `JWT_SECRET` قوي

### خطأ: Image upload failed
- **الحل**: تحقق من Cloudinary credentials

### خطأ: Email not sending
- **الحل**: تحقق من SMTP settings في Admin Panel أو environment variables

### خطأ: Service Worker not registering
- **الحل**: تحقق من أن `/sw.js` موجود ويمكن الوصول إليه

---

## ملاحظات مهمة

1. **لا تضع secrets في الكود**: استخدم environment variables دائماً
2. **JWT_SECRET**: يجب أن يكون قوياً وفريداً
3. **DATABASE_URL**: يجب أن يحتوي على `?sslmode=require` للاتصال الآمن
4. **PWA Icons**: تأكد من وجود جميع الأيقونات في `public/icons/`
5. **Build Time**: قد يستغرق البناء 2-5 دقائق

---

## الدعم

إذا واجهت مشاكل:
1. راجع Vercel deployment logs
2. راجع browser console
3. راجع Network tab في DevTools
4. تحقق من environment variables في Vercel Dashboard

