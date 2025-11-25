<!-- ac71ec03-403b-464c-8eb6-9d75d06e3b59 8e9974ae-caba-4cda-9a29-0aed16231d6c -->
# المراحل التطويرية المتبقية - FileMart

## نظرة عامة

هذه الخطة تغطي جميع المراحل المتبقية للوصول إلى اكتمال المشروع 100%، بناءً على المواصفات (ESS, FAM, FCI, FDFD, FIS) والحالة الحالية للمشروع.

---

## Phase 11: Plans & Subscriptions System

### الهدف

تنفيذ نظام الخطط والاشتراكات المدفوعة للمنصة

### المهام المطلوبة

#### 11.1 Database Schema

- إنشاء جدول `subscription_plans`:
- id, name, description, price, features (JSONB), duration_days, is_active
- إنشاء جدول `merchant_subscriptions`:
- id, merchant_id, plan_id, status, start_date, end_date, auto_renew
- إنشاء جدول `subscription_transactions`:
- id, subscription_id, amount, payment_method, status, transaction_date

#### 11.2 API Routes

- `app/api/admin/plans/route.ts` - CRUD للخطط
- `app/api/admin/plans/[id]/route.ts` - إدارة خطة محددة
- `app/api/merchant/subscription/route.ts` - عرض الاشتراك الحالي
- `app/api/merchant/subscription/subscribe/route.ts` - الاشتراك في خطة
- `app/api/merchant/subscription/cancel/route.ts` - إلغاء الاشتراك

#### 11.3 Admin UI

- `app/admin/plans/page.tsx` - قائمة الخطط
- `app/admin/plans/new/page.tsx` - إنشاء خطة جديدة
- `app/admin/plans/[id]/page.tsx` - تعديل خطة
- `components/admin/PlanEditorClient.tsx` - محرر الخطط

#### 11.4 Merchant UI

- تحديث `app/dashboard/settings/page.tsx` - إضافة قسم الاشتراك
- `components/dashboard/SubscriptionCard.tsx` - بطاقة الاشتراك الحالي
- `components/dashboard/PlansComparison.tsx` - مقارنة الخطط

#### 11.5 Business Logic

- `services/subscription-service.ts` - منطق الاشتراكات
- `services/payment-service.ts` - معالجة المدفوعات (Stripe/PayPal)
- Middleware للتحقق من صلاحيات الاشتراك

---

## Phase 12: Email & Phone Verification

### الهدف

تنفيذ نظام التحقق من البريد الإلكتروني والهاتف

### المهام المطلوبة

#### 12.1 Email Verification

- `app/api/auth/verify-email/route.ts` - التحقق من البريد
- `app/api/auth/resend-verification/route.ts` - إعادة إرسال الرمز
- `services/verification-service.ts` - إدارة رموز التحقق
- تحديث `app/api/auth/register/route.ts` - إرسال بريد التحقق
- `app/verify-email/page.tsx` - صفحة التحقق

#### 12.2 Phone Verification

- `app/api/auth/verify-phone/route.ts` - التحقق من الهاتف
- `app/api/auth/send-sms-code/route.ts` - إرسال رمز SMS
- Integration مع خدمة SMS (Twilio/مشابه)
- `app/verify-phone/page.tsx` - صفحة التحقق

#### 12.3 Database Updates

- تحديث جدول `merchants` - إضافة `email_verification_token`, `phone_verification_code`
- إنشاء جدول `verification_codes` - لتخزين رموز التحقق

---

## Phase 13: Analytics & Visitor Tracking

### الهدف

تنفيذ نظام تتبع الزوار والإحصائيات

### المهام المطلوبة

#### 13.1 Database Schema

- إنشاء جدول `profile_visits`:
- id, profile_id, visitor_ip, user_agent, referrer, visited_at
- إنشاء جدول `product_views`:
- id, product_id, visitor_ip, viewed_at

#### 13.2 API Routes

- `app/api/public/analytics/track-visit/route.ts` - تتبع الزيارة
- `app/api/merchant/analytics/route.ts` - إحصائيات التاجر
- `app/api/admin/analytics/route.ts` - إحصائيات عامة

#### 13.3 Analytics Service

- `services/analytics-service.ts` - معالجة البيانات الإحصائية
- Functions: trackVisit, getProfileStats, getProductViews

#### 13.4 UI Components

- `components/dashboard/AnalyticsDashboard.tsx` - لوحة الإحصائيات
- `components/dashboard/VisitorChart.tsx` - مخطط الزوار
- `components/dashboard/TopProducts.tsx` - المنتجات الأكثر مشاهدة
- تحديث `app/dashboard/page.tsx` - إضافة قسم Analytics

---

## Phase 14: Push Notifications

### الهدف

تنفيذ نظام الإشعارات الفورية (Push Notifications)

### المهام المطلوبة

#### 14.1 Service Worker Updates

- تحديث `public/sw.js` - إضافة Push API
- `lib/push-notification.ts` - إدارة Push Notifications

#### 14.2 Database Schema

- إنشاء جدول `push_subscriptions`:
- id, merchant_id, endpoint, keys (JSONB), created_at

#### 14.3 API Routes

- `app/api/merchant/push/subscribe/route.ts` - الاشتراك في Push
- `app/api/merchant/push/unsubscribe/route.ts` - إلغاء الاشتراك
- `services/push-service.ts` - إرسال الإشعارات

#### 14.4 UI Integration

- `components/dashboard/PushNotificationSettings.tsx` - إعدادات Push
- تحديث `app/dashboard/settings/page.tsx` - إضافة Push settings

---

## Phase 15: Advanced Search & Filtering

### الهدف

تحسين البحث والفلترة في جميع الصفحات

### المهام المطلوبة

#### 15.1 Public Search

- تحسين `app/businesses/page.tsx` - بحث متقدم
- إضافة فلاتر: السعر، التقييم، التاريخ
- `components/public/AdvancedSearch.tsx` - مكون البحث المتقدم

#### 15.2 Dashboard Search

- تحسين البحث في `app/dashboard/catalog/page.tsx`
- تحسين البحث في `app/dashboard/orders/page.tsx`
- إضافة فلاتر متقدمة للطلبات

#### 15.3 Admin Search

- تحسين البحث في جميع صفحات Admin
- إضافة فلاتر متقدمة للجداول

---

## Phase 16: Performance Optimization & Monitoring

### الهدف

تحسين الأداء وإضافة مراقبة الأداء

### المهام المطلوبة

#### 16.1 Performance Monitoring

- Integration مع monitoring service (Sentry/LogRocket)
- `lib/monitoring.ts` - أدوات المراقبة
- Error tracking وتحليل الأداء

#### 16.2 Caching Strategy

- تحسين `utils/cache-strategy.ts`
- إضافة Redis caching (اختياري)
- Database query optimization

#### 16.3 Image Optimization

- تحسين معالجة الصور
- Lazy loading محسّن
- WebP format support

#### 16.4 Bundle Optimization

- Code splitting محسّن
- Tree shaking
- Dynamic imports للصفحات الكبيرة

---

## Phase 17: Security Hardening

### الهدف

تعزيز الأمان والحماية

### المهام المطلوبة

#### 17.1 Authentication Security

- Rate limiting للـ API
- CSRF protection
- Session management محسّن
- Two-factor authentication (2FA) - اختياري

#### 17.2 Data Security

- Input sanitization شامل
- SQL injection prevention
- XSS protection
- Data encryption للبيانات الحساسة

#### 17.3 API Security

- API rate limiting
- Request validation شامل
- Security headers (CSP, HSTS, etc.)

#### 17.4 Security Audit

- Security testing
- Vulnerability scanning
- Penetration testing (اختياري)

---

## Phase 18: Internationalization (i18n)

### الهدف

دعم متعدد اللغات كامل

### المهام المطلوبة

#### 18.1 i18n Setup

- إعداد `next-intl` بشكل كامل
- إنشاء ملفات الترجمة (ar.json, en.json)
- `i18n/config.ts` - إعدادات i18n

#### 18.2 Translation Files

- ترجمة جميع النصوص في الواجهة
- ترجمة رسائل الخطأ
- ترجمة رسائل النجاح

#### 18.3 UI Updates

- Language switcher component
- RTL/LTR switching
- Date/time formatting حسب اللغة

---

## Phase 19: Testing & Quality Assurance

### الهدف

إكمال التغطية بالاختبارات وضمان الجودة

### المهام المطلوبة

#### 19.1 Unit Tests

- إكمال unit tests للمكونات المتبقية
- Unit tests للـ services
- Unit tests للـ utilities

#### 19.2 E2E Tests

- إكمال E2E tests للـ flows المتبقية
- Tests للـ Plans & Subscriptions
- Tests للـ Verification flows
- Tests للـ Analytics

#### 19.3 Integration Tests

- API integration tests
- Database integration tests
- Plugin system integration tests

#### 19.4 Test Coverage

- الوصول إلى 80%+ coverage
- Coverage reports
- Continuous testing

---

## Phase 20: Documentation & Deployment

### الهدف

إكمال الوثائق وإعداد النشر

### المهام المطلوبة

#### 20.1 Technical Documentation

- API documentation (OpenAPI/Swagger)
- Component documentation (Storybook - اختياري)
- Database schema documentation
- Deployment guide

#### 20.2 User Documentation

- User manual للتجار
- Admin manual
- Plugin development guide

#### 20.3 Deployment Setup

- Production environment configuration
- CI/CD pipeline
- Docker setup (اختياري)
- Environment variables documentation

#### 20.4 Monitoring & Logging

- Production logging setup
- Error tracking setup
- Performance monitoring setup
- Backup strategy

---

## Phase 21: UX Enhancements & Polish

### الهدف

تحسين تجربة المستخدم والتلميع النهائي

### المهام المطلوبة

#### 21.1 UI/UX Improvements

- Animations محسّنة
- Loading states محسّنة
- Error states محسّنة
- Empty states محسّنة

#### 21.2 Accessibility

- ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast compliance

#### 21.3 Mobile Experience

- Mobile optimizations
- Touch gestures
- Responsive design improvements

#### 21.4 User Feedback

- Feedback forms
- Bug reporting system
- Feature requests system

---

## Phase 22: Advanced Features (Optional)

### الهدف

ميزات متقدمة إضافية

### المهام المطلوبة

#### 22.1 Multi-tenant Support

- Support لعدة domains
- White-label customization

#### 22.2 API for Third-party

- Public API documentation
- API keys management
- Rate limiting للـ public API

#### 22.3 Advanced Analytics

- Custom reports
- Export data (CSV/PDF)
- Scheduled reports

#### 22.4 Integrations

- Social media integrations
- Payment gateway integrations
- CRM integrations

---

## ملخص المراحل

| Phase | الاسم | الأولوية | الوقت المتوقع |
|-------|-------|----------|----------------|
| 11 | Plans & Subscriptions | عالية | 2-3 أسابيع |
| 12 | Email & Phone Verification | عالية | 1-2 أسابيع |
| 13 | Analytics & Visitor Tracking | متوسطة | 1-2 أسابيع |
| 14 | Push Notifications | متوسطة | 1 أسبوع |
| 15 | Advanced Search & Filtering | متوسطة | 1 أسبوع |
| 16 | Performance Optimization | عالية | 1-2 أسابيع |
| 17 | Security Hardening | عالية | 1-2 أسابيع |
| 18 | Internationalization | منخفضة | 1-2 أسابيع |
| 19 | Testing & QA | عالية | 2-3 أسابيع |
| 20 | Documentation & Deployment | عالية | 1-2 أسابيع |
| 21 | UX Enhancements | متوسطة | 1-2 أسابيع |
| 22 | Advanced Features | منخفضة | متغير |

**إجمالي الوقت المتوقع: 15-25 أسبوع (3.5-6 أشهر)**

---

## الأولويات الموصى بها

### المرحلة الأولى (Critical)

- Phase 11: Plans & Subscriptions
- Phase 12: Email & Phone Verification
- Phase 17: Security Hardening
- Phase 19: Testing & QA

### المرحلة الثانية (Important)

- Phase 13: Analytics & Visitor Tracking
- Phase 16: Performance Optimization
- Phase 20: Documentation & Deployment

### المرحلة الثالثة (Nice to Have)

- Phase 14: Push Notifications
- Phase 15: Advanced Search
- Phase 18: Internationalization
- Phase 21: UX Enhancements
- Phase 22: Advanced Features

### To-dos

- [ ] Create public/manifest.json
- [ ] Create public/sw.js (Service Worker)
- [ ] Create public/icons directory and placeholder icons
- [ ] Create app/manifest.ts (Next.js 15)
- [ ] Create lib/service-worker.ts
- [ ] Create utils/cache-strategy.ts
- [ ] Create utils/performance.ts
- [ ] Create components/common/PWAInstallPrompt.tsx
- [ ] Create components/common/OfflineIndicator.tsx
- [ ] Update app/layout.tsx with PWA metadata
- [ ] Update next.config.js for PWA
- [ ] Create public/offline.html fallback
- [ ] Create public/manifest.json
- [ ] Create public/sw.js (Service Worker)
- [ ] Create public/icons directory and placeholder icons
- [ ] Create app/manifest.ts (Next.js 15)
- [ ] Create lib/service-worker.ts
- [ ] Create utils/cache-strategy.ts
- [ ] Create utils/performance.ts
- [ ] Create components/common/PWAInstallPrompt.tsx
- [ ] Create components/common/OfflineIndicator.tsx
- [ ] Update app/layout.tsx with PWA metadata
- [ ] Update next.config.js for PWA
- [ ] Create public/offline.html fallback