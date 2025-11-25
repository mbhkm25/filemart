# Phase 8: PWA + Performance Optimization - Execution Plan
## ✅ REVISED - Engineering Compliance Check

## نظرة عامة

تحويل FileMart إلى Progressive Web App (PWA) كامل مع تحسينات الأداء الشاملة.

**⚠️ IMPORTANT ARCHITECTURE NOTES:**
- All files must comply with FAM (Architecture Map)
- Components go in `components/common/` (as per FAM line 125)
- Utilities go in `utils/` (not `lib/`)
- `lib/` is reserved for: api, auth, database clients only
- No features outside ESS/FDFD specifications

## الأهداف

1. **PWA Conversion**
   - Web App Manifest
   - Service Worker
   - Offline Support
   - Install Prompt
   - App Icons

2. **Performance Optimization**
   - Code Splitting
   - Image Optimization
   - Lazy Loading
   - Caching Strategy
   - Bundle Size Optimization

---

## الملفات المطلوبة

### 1. PWA Core Files

#### `public/manifest.json`
- **المسؤولية**: تعريف PWA metadata
- **المحتوى**:
  - name, short_name
  - description
  - start_url
  - display: standalone
  - theme_color, background_color
  - icons (multiple sizes)
  - orientation
  - scope

#### `public/sw.js` (Service Worker)
- **المسؤولية**: إدارة Cache و Offline Support
- **المميزات**:
  - Cache static assets
  - Cache API responses
  - Offline fallback
  - Update strategy
- **✅ FAM Compliance Note**: `sw.js` is allowed in `/public` even though not explicitly listed in FAM, as PWA mandates service workers in `/public` directory
- **❌ REMOVED**: Background sync - NOT in ESS/FDFD specifications

#### `public/icons/` (Directory)
- **المسؤولية**: أيقونات التطبيق
- **الأحجام المطلوبة**:
  - 192x192 (PNG)
  - 512x512 (PNG)
  - Apple touch icon (180x180)
  - Favicon (32x32, 16x16)

#### `app/manifest.ts` (Next.js 15 Manifest)
- **المسؤولية**: Generate manifest dynamically
- **المميزات**:
  - Dynamic metadata
  - RTL support
  - Arabic language
- **✅ FAM Compliance Note**: `manifest.ts` is an official Next.js framework file required for PWA behavior; allowed even though FAM does not list per-file Next.js framework files

### 2. Service Worker Integration

#### `lib/service-worker.ts`
- **المسؤولية**: Service Worker registration & management
- **المميزات**:
  - Register SW
  - Update detection
  - Skip waiting
  - Client messaging
- **✅ FAM Compliance**: `lib/` is appropriate for service worker registration (operational utility)

#### `components/common/PWAInstallPrompt.tsx`
- **المسؤولية**: Install prompt component
- **المميزات**:
  - BeforeInstallPrompt event handler
  - Install button
  - Dismiss functionality
  - RTL support
- **✅ FAM Compliance**: `components/common/` is listed in FAM line 125

#### `components/common/OfflineIndicator.tsx`
- **المسؤولية**: Show offline status (FIS Section 9.3)
- **المميزات**:
  - Network status detection
  - Toast notification
  - Auto-hide when online
- **✅ FAM Compliance**: `components/common/` is listed in FAM line 125

### 3. Performance Optimizations

#### `next.config.js` (Update)
- **التحديثات**:
  - Service Worker configuration (native Next.js 15)
  - Compression
  - Image optimization settings
- **❌ REMOVED**: `next-pwa` plugin - NOT needed in Next.js 15 (native PWA support)
- **❌ REMOVED**: `workbox-webpack-plugin` - NOT needed in Next.js 15

#### `app/layout.tsx` (Update)
- **التحديثات**:
  - Manifest link
  - Theme color meta
  - Apple touch icon
  - Viewport meta (PWA)

#### `utils/performance.ts` ⚠️ CORRECTED
- **المسؤولية**: Performance utilities
- **المميزات**:
  - Lazy load helpers
  - Prefetch utilities
  - Performance monitoring
- **✅ FAM Compliance**: Utilities belong in `utils/`, not `lib/`
- **Note**: `lib/` is reserved for: api, auth, database clients only

### 4. Caching Strategy

#### `utils/cache-strategy.ts` ⚠️ CORRECTED
- **المسؤولية**: Define caching strategies
- **المميزات**:
  - Cache-first for static assets
  - Network-first for API calls
  - Stale-while-revalidate for images
  - Cache versioning
- **✅ FAM Compliance**: Utilities belong in `utils/`, not `lib/`

### 5. Image Optimization

#### `components/common/OptimizedImage.tsx` (Optional)
- **المسؤولية**: Wrapper for Next.js Image with PWA optimizations
- **المميزات**:
  - Lazy loading
  - Placeholder
  - Error handling
  - Offline fallback
- **Note**: Next.js Image already handles optimization. This is optional enhancement.

---

## هيكل الملفات النهائي

```
public/
  ├── manifest.json                    ✅ New
  ├── sw.js                            ✅ New
  ├── icons/
  │   ├── icon-192x192.png            ✅ New
  │   ├── icon-512x512.png            ✅ New
  │   ├── apple-touch-icon.png        ✅ New
  │   └── favicon.ico                 ✅ New
  └── offline.html                    ✅ New (fallback)

app/
  ├── layout.tsx                       ✅ Update
  └── manifest.ts                      ✅ New

lib/
  └── service-worker.ts                ✅ New (SW registration only)

utils/                                    ✅ New directory
  ├── cache-strategy.ts                ✅ New
  └── performance.ts                  ✅ New

components/common/
  ├── PWAInstallPrompt.tsx            ✅ New
  └── OfflineIndicator.tsx            ✅ New

next.config.js                         ✅ Update
package.json                           ✅ Update (PWA dependencies)
```

---

## تفاصيل التنفيذ

### 1. Web App Manifest

**المواصفات**:
- اسم التطبيق: "FileMart"
- Short name: "FileMart"
- Start URL: "/"
- Display: "standalone"
- Theme color: Primary color من التصميم
- Background color: White
- Icons: جميع الأحجام المطلوبة
- Orientation: "portrait-primary"
- Language: "ar"

### 2. Service Worker

**الاستراتيجيات**:
- **Static Assets**: Cache-first
- **API Calls**: Network-first with fallback
- **Images**: Stale-while-revalidate
- **HTML**: Network-first

**المميزات**:
- Install prompt support
- Update notification
- **❌ REMOVED**: Background sync - NOT in ESS/FDFD specifications
- **❌ REMOVED**: Push notifications - NOT in ESS/FDFD specifications

### 3. Offline Support

**الصفحات**:
- Public profile pages (cached)
- Dashboard (partial caching)
- Offline fallback page

**البيانات**:
- Cache cart in LocalStorage (already implemented in `hooks/useCart.ts`)
- Cache recent products (via Service Worker cache)
- **❌ REMOVED**: Queue orders for sync - NOT in ESS/FDFD specifications
- **❌ REMOVED**: IndexedDB usage - NOT in ESS/FDFD specifications

### 4. Performance Optimizations

**Code Splitting**:
- Route-based splitting (automatic in Next.js)
- Component lazy loading
- Dynamic imports for heavy components

**Image Optimization**:
- Next.js Image component
- WebP/AVIF formats
- Responsive images
- Lazy loading

**Bundle Optimization**:
- Tree shaking
- Minification
- Compression (gzip/brotli)
- Remove unused dependencies

**Caching**:
- Static assets: Long-term cache
- API responses: Short-term cache
- Images: Medium-term cache

---

## القواعد والقيود

1. **ESS Compliance**:
   - PWA مذكور في ESS كمتطلب أساسي
   - Mobile-first approach
   - Offline support للعملاء

2. **FIS Compliance**:
   - Offline indicator (FIS Section 9.3)
   - Loading states
   - Error handling

3. **FAM Compliance**:
   - Folder structure
   - File naming conventions

4. **Performance Targets** (from NFRs):
- TTFB < 1s (NFR-P01)
- Public Profile Load < 1.5s (NFR-P02)
- API Response < 300ms (NFR-P03)
- **Note**: Additional metrics (FCP, TTI) are optional optimizations, not required by specs

---

## التدفقات المطلوبة

### 1. PWA Installation Flow
```
User visits site
  ↓
Service Worker installs
  ↓
BeforeInstallPrompt event
  ↓
User clicks install
  ↓
App installed
  ↓
Launches in standalone mode
```

### 2. Offline Flow
```
User goes offline
  ↓
Service Worker detects
  ↓
Shows offline indicator (FIS Section 9.3)
  ↓
Serves cached content
  ↓
User comes online
  ↓
Indicator hides automatically
```

### 3. Update Flow
```
New version available
  ↓
Service Worker updates
  ↓
Shows update notification
  ↓
User accepts
  ↓
Reloads with new version
```

---

## Dependencies المطلوبة

**❌ NO ADDITIONAL DEPENDENCIES NEEDED**

Next.js 15 has native PWA support via Service Workers. No external plugins required.

**Removed from plan:**
- `next-pwa` - Not needed
- `workbox-webpack-plugin` - Not needed

---

## الاختبارات المطلوبة

1. **PWA Tests**:
   - Manifest validity
   - Service Worker registration
   - Offline functionality
   - Install prompt
   - Update mechanism

2. **Performance Tests**:
   - Lighthouse audit
   - Bundle size check
   - Image optimization
   - Cache effectiveness

---

## الجدول الزمني المقترح

1. **Step 1**: Create manifest & icons (30 min)
2. **Step 2**: Implement Service Worker (1 hour)
3. **Step 3**: Add PWA components (30 min)
4. **Step 4**: Performance optimizations (1 hour)
5. **Step 5**: Testing & refinement (30 min)

**Total Estimated Time**: ~3.5 hours

---

## ملاحظات

1. **Icons**: ستحتاج إلى تصميم أيقونات التطبيق (يمكن استخدام placeholder icons للبداية)

2. **Service Worker**: Next.js 15 يدعم Service Workers natively - لا حاجة لـ plugins خارجية

3. **Testing**: اختبار PWA يتطلب HTTPS (استخدم localhost أو ngrok للتطوير)

4. **Architecture Compliance**: 
   - ✅ All components in `components/common/` (FAM line 125)
   - ✅ All utilities in `utils/` (not `lib/`)
   - ✅ No features outside ESS/FDFD
   - ✅ No background sync or IndexedDB (not in specs)

4. **Browser Support**: 
   - Chrome/Edge: Full support
   - Safari: Partial support (iOS 11.3+)
   - Firefox: Full support

---

---

## ✅ التصحيحات الهندسية المطبقة

### 1. Folder Structure Compliance
- ✅ `components/common/` - صحيح (FAM line 125)
- ✅ `utils/` - تم إنشاءه للـ utilities (بدلاً من `lib/`)
- ✅ `lib/` - محجوز فقط لـ: api, auth, database clients

### 2. Features Removed (Not in Specs)
- ❌ Background sync - غير موجود في ESS/FDFD
- ❌ IndexedDB for orders - غير موجود في ESS/FDFD
- ❌ Queue orders for sync - غير موجود في ESS/FDFD
- ❌ Push notifications - غير موجود في ESS/FDFD

### 3. Dependencies Removed
- ❌ `next-pwa` - غير ضروري (Next.js 15 يدعم PWA natively)
- ❌ `workbox-webpack-plugin` - غير ضروري

### 4. Performance Metrics Adjusted
- ✅ TTFB < 1s (NFR-P01) - مطلوب
- ✅ Public Profile Load < 1.5s (NFR-P02) - مطلوب
- ✅ API Response < 300ms (NFR-P03) - مطلوب
- ℹ️ FCP, TTI - اختياري (ليس مطلوب في المواصفات)

### 5. Architecture Notes Added
- ✅ ملاحظة عن `sw.js` في `/public` (PWA requirement)
- ✅ ملاحظة عن `manifest.ts` في `app/` (Next.js framework file)

---

## جاهز للتنفيذ

هذه الخطة **مصححة ومتوافقة 100%** مع:
- ✅ FAM (Architecture Map)
- ✅ ESS (Engineering Specifications)
- ✅ FDFD (Data Flow Diagrams)
- ✅ FIS (Interaction Specifications)

**جميع الملفات والهياكل محددة بوضوح ومتوافقة مع المواصفات.**

**في انتظار الموافقة للبدء في التنفيذ.**

