# إعداد Environment Variables في Vercel

## دليل سريع

### الطريقة 1: عبر Vercel Dashboard (موصى بها)

1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. اختر مشروع FileMart
3. اضغط على **Settings** → **Environment Variables**
4. أضف كل متغير على حدة:

#### المتغيرات الإلزامية:

```
DATABASE_URL
```
- **Value**: `postgresql://user:password@host.neon.tech/database?sslmode=require`
- **Environment**: Production, Preview, Development

```
JWT_SECRET
```
- **Value**: مفتاح قوي (32+ حرف) - استخدم: `openssl rand -base64 32`
- **Environment**: Production, Preview, Development

```
CLOUDINARY_CLOUD_NAME
```
- **Value**: من Cloudinary Dashboard
- **Environment**: Production, Preview, Development

```
CLOUDINARY_UPLOAD_PRESET
```
- **Value**: من Cloudinary Dashboard
- **Environment**: Production, Preview, Development

```
NEXT_PUBLIC_APP_URL
```
- **Value**: `https://your-project.vercel.app` (سيتم تعيينه تلقائياً بعد أول deploy)
- **Environment**: Production, Preview, Development

#### المتغيرات الاختيارية:

```
SMTP_HOST
SMTP_PORT
SMTP_USERNAME
SMTP_PASSWORD
SMTP_FROM_EMAIL
SMTP_FROM_NAME
```
- يمكن إضافتها لاحقاً أو إعدادها من Admin Panel

---

### الطريقة 2: عبر Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Add environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add CLOUDINARY_CLOUD_NAME
vercel env add CLOUDINARY_UPLOAD_PRESET
vercel env add NEXT_PUBLIC_APP_URL

# For each environment (production, preview, development)
vercel env pull .env.local
```

---

## قائمة التحقق

قبل النشر، تأكد من:

- [ ] `DATABASE_URL` مضاف مع `?sslmode=require`
- [ ] `JWT_SECRET` مضاف وقوي (ليس القيمة الافتراضية)
- [ ] `CLOUDINARY_CLOUD_NAME` مضاف
- [ ] `CLOUDINARY_UPLOAD_PRESET` مضاف
- [ ] `NEXT_PUBLIC_APP_URL` مضاف (أو سيتم تعيينه بعد أول deploy)

---

## ملاحظات

1. **NEXT_PUBLIC_*** variables: متاحة في client-side (لا تضع secrets فيها)
2. **غير NEXT_PUBLIC_**: server-side only (آمنة للـ secrets)
3. بعد إضافة variables جديدة، يجب إعادة deploy
4. يمكن تعديل variables بدون إعادة deploy، لكن التغييرات لن تطبق إلا بعد redeploy

