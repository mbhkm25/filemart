# Environment Variables Reference - FileMart

## قائمة متغيرات البيئة المطلوبة

### 🔴 إلزامية (Required)

#### 1. DATABASE_URL
```
DATABASE_URL=postgresql://user:password@host.neon.tech/database?sslmode=require
```
- **الوصف**: Neon DB connection string
- **المصدر**: Neon Dashboard → Connection String
- **ملاحظة مهمة**: أضف `?sslmode=require` في النهاية للاتصال الآمن
- **Vercel**: أضف في Settings → Environment Variables

#### 2. JWT_SECRET
```
JWT_SECRET=your-very-strong-secret-key-minimum-32-characters
```
- **الوصف**: Secret key لتوقيع JWT tokens
- **التوليد**: استخدم `openssl rand -base64 32` أو أي مولد آمن
- **الحد الأدنى**: 32 حرف
- **⚠️ تحذير**: لا تستخدم القيمة الافتراضية في الإنتاج!
- **Vercel**: أضف في Settings → Environment Variables

#### 3. CLOUDINARY_CLOUD_NAME
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
```
- **الوصف**: Cloudinary cloud name
- **المصدر**: Cloudinary Dashboard → Settings
- **بدونها**: رفع الصور سيفشل
- **Vercel**: أضف في Settings → Environment Variables

#### 4. CLOUDINARY_UPLOAD_PRESET
```
CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```
- **الوصف**: Cloudinary upload preset
- **المصدر**: Cloudinary Dashboard → Settings → Upload
- **بدونها**: رفع الصور سيفشل
- **Vercel**: أضف في Settings → Environment Variables

#### 5. NEXT_PUBLIC_APP_URL
```
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```
- **الوصف**: Production URL للمنصة
- **المصدر**: Vercel deployment URL (بعد أول deploy)
- **الاستخدام**: روابط الملفات التجارية العامة
- **Vercel**: أضف في Settings → Environment Variables

---

### 🟡 اختيارية (Optional) - مع Defaults

#### 6. JWT_EXPIRES_IN
```
JWT_EXPIRES_IN=7d
```
- **Default**: `7d`
- **الوصف**: مدة صلاحية JWT token
- **القيم**: `1d`, `7d`, `30d`, إلخ

#### 7. SMTP_HOST
```
SMTP_HOST=smtp.example.com
```
- **Default**: من database settings أو `''`
- **الوصف**: SMTP server hostname
- **بدونها**: Email sending لن يعمل

#### 8. SMTP_PORT
```
SMTP_PORT=587
```
- **Default**: `587`
- **الوصف**: SMTP server port
- **القيم الشائعة**: `587` (TLS), `465` (SSL)

#### 9. SMTP_USERNAME
```
SMTP_USERNAME=your-email@example.com
```
- **Default**: من database settings
- **الوصف**: SMTP username (عادة البريد الإلكتروني)

#### 10. SMTP_PASSWORD
```
SMTP_PASSWORD=your-password
```
- **Default**: من database settings
- **الوصف**: SMTP password
- **ملاحظة**: يمكن إعدادها من Admin Panel

#### 11. SMTP_FROM_EMAIL
```
SMTP_FROM_EMAIL=noreply@filemart.com
```
- **Default**: `noreply@filemart.com`
- **الوصف**: البريد الإلكتروني المرسل

#### 12. SMTP_FROM_NAME
```
SMTP_FROM_NAME=FileMart
```
- **Default**: `FileMart`
- **الوصف**: اسم المرسل

#### 13. NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
```
- **Default**: من `CLOUDINARY_CLOUD_NAME`
- **الوصف**: Cloudinary cloud name للـ client-side
- **ملاحظة**: بديل لـ `CLOUDINARY_CLOUD_NAME`

#### 14. NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
```
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```
- **Default**: من `CLOUDINARY_UPLOAD_PRESET`
- **الوصف**: Cloudinary upload preset للـ client-side

#### 15. NEXT_PUBLIC_API_URL
```
NEXT_PUBLIC_API_URL=/api
```
- **Default**: `/api`
- **الوصف**: Base URL للـ API

#### 16. NEXT_PUBLIC_BASE_URL
```
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```
- **Default**: `http://localhost:3000`
- **الوصف**: Base URL للمنصة

---

## كيفية إضافة المتغيرات في Vercel

### عبر Dashboard:

1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. اختر مشروع FileMart
3. **Settings** → **Environment Variables**
4. اضغط **Add New**
5. أدخل:
   - **Key**: اسم المتغير (مثل `DATABASE_URL`)
   - **Value**: القيمة
   - **Environment**: اختر Production, Preview, Development (أو Production فقط)
6. اضغط **Save**
7. كرر لكل متغير

### عبر CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Add variables
vercel env add DATABASE_URL production
vercel env add JWT_SECRET production
# ... etc
```

---

## قائمة التحقق السريعة

### قبل النشر الأول:

- [ ] `DATABASE_URL` - مع `?sslmode=require`
- [ ] `JWT_SECRET` - قوي وطويل (32+ حرف)
- [ ] `CLOUDINARY_CLOUD_NAME` - من Cloudinary Dashboard
- [ ] `CLOUDINARY_UPLOAD_PRESET` - من Cloudinary Dashboard
- [ ] `NEXT_PUBLIC_APP_URL` - سيتم تعيينه بعد أول deploy

### بعد النشر الأول:

- [ ] `NEXT_PUBLIC_APP_URL` - تحديثه لـ production URL
- [ ] SMTP variables (إذا أردت email notifications)
- [ ] اختبار جميع الميزات

---

## ملاحظات أمنية

1. **لا تضع secrets في الكود**: استخدم environment variables دائماً
2. **JWT_SECRET**: يجب أن يكون قوياً وفريداً لكل بيئة
3. **DATABASE_URL**: يحتوي على credentials - احمِه جيداً
4. **NEXT_PUBLIC_***: متاحة في client-side - لا تضع secrets فيها
5. **SMTP_PASSWORD**: حساس - استخدم environment variables فقط

---

## استكشاف الأخطاء

### خطأ: "DATABASE_URL environment variable is not set"
- **الحل**: أضف `DATABASE_URL` في Vercel Environment Variables

### خطأ: "JWT verification failed"
- **الحل**: تحقق من `JWT_SECRET` - يجب أن يكون مطابقاً في جميع البيئات

### خطأ: "Cloudinary configuration is incomplete"
- **الحل**: أضف `CLOUDINARY_CLOUD_NAME` و `CLOUDINARY_UPLOAD_PRESET`

### خطأ: "SMTP configuration is incomplete"
- **الحل**: أضف SMTP variables أو قم بإعدادها من Admin Panel

