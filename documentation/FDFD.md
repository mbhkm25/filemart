FileMart — Data Flow Diagrams (FDFD)

Markdown Version — Arabic
Version 1.0

1. مقدمة

يهدف ملف Data Flow Diagrams (FDFD) إلى توضيح التدفقات الكاملة للبيانات عبر نظام FileMart، من لحظة إدخال المستخدم للبيانات وحتى وصولها إلى قاعدة البيانات والعرض النهائي.

هذا الملف يضمن:

وضوح حركة البيانات

منع التضارب بين الواجهة وطبقة الـ API

تسهيل قراءة النظام للذكاء الصناعي

تحسين عملية بناء الـ Backend والـ Frontend

ضمان التطابق بين الواجهات والعمليات الداخلية

يتم تقديم المخططات بصيغة Textual DFD لتسهيل فهم تدفق النظام.

2. DFD — عرض الملف التجاري العام (Public Profile View)
User (Client)
  ↓ visits → https://domain/[slug]
  ↓
Next.js Public Page
  ↓ (Server Fetch)
GET /api/public/profile/:slug
  ↓
Database:
  - business_profiles
  - products
  - gallery
  - plugins
  ↓
API aggregates all entities
  ↓
Public UI renders:
  - BusinessHeader
  - ProductCard list
  - GalleryGrid
  - PluginWidget list


الغاية:
عرض ملف تجاري كامل: معلومات + صور + منتجات + إضافات.

3. DFD — إرسال طلب جديد (Public Order Creation)
User selects products
  ↓ fills client info
  ↓ presses "Send Order"
  ↓
POST /api/public/orders
  ↓ validateInput
  ↓ checkProfileExists
  ↓ fetch product data
  ↓ write Order to DB
  ↓
Trigger: Notify Merchant (Email/Push)
  ↓
Response: success
  ↓
Redirect → /order-success


الغاية:
إنشاء طلب وربطه بملف تجاري بشكل صحيح.

4. DFD — تحديث الملف التجاري (Business Profile Update)
Merchant (Dashboard)
  ↓ edits profile fields
  ↓ presses "Save"
  ↓
PUT /api/merchant/profile
  ↓ validateInput
  ↓ mergeWithExisting
  ↓ update DB
  ↓ refresh public cache
  ↓
Dashboard + Public UI update immediately

5. DFD — إدارة المنتجات (Product CRUD)
5.1 إنشاء أو تحديث منتج
Merchant fills product form
  ↓ Save
  ↓
POST/PUT /api/merchant/products
  ↓ validateInput
  ↓ update database
  ↓ refresh product cache
  ↓
Dashboard displays updated product list

5.2 عرض المنتجات في الواجهة العامة
Client loads public profile
  ↓
GET /api/public/profile/:slug
  ↓
DB.products filtered (isActive=true)
  ↓
Public UI renders ProductCard list

6. DFD — تثبيت إضافة (Plugin Installation)
Merchant → Dashboard → Plugins
  ↓ selects plugin
  ↓ presses Install
  ↓
POST /api/merchant/plugins/install
  ↓ validate pluginKey
  ↓ load plugin metadata
  ↓ record installation in DB
  ↓ run initialization script
  ↓ mark plugin active
  ↓
Dashboard shows plugin as installed


ملاحظة:
إذا كانت الإضافة من نوع Public Widget، يتم عرضها في الواجهة العامة بعد التفعيل.

7. DFD — عرض لوحة التاجر (Merchant Dashboard Load)
Merchant visits /dashboard
  ↓ load layout.tsx
  ↓
Server Fetch:
    GET /api/merchant/profile
    GET /api/merchant/orders
    GET /api/merchant/products
    GET /api/merchant/plugins
  ↓
UI renders:
    - StatCard
    - OrderRow
    - ProductRow
    - PluginBox

8. DFD — لوحة المدير (Admin Panel)
Admin visits /admin/dashboard
  ↓ fetch required data

Server Fetch:
    GET /api/admin/merchants
    GET /api/admin/profiles
    GET /api/admin/orders
    GET /api/admin/plugins
    GET /api/admin/logs
  ↓
Admin UI renders:
    - AdminTable
    - AdminRow
    - AuditLogRow

9. DFD — تسجيل الدخول (Login Flow)
User enters email & password
  ↓ presses Login
  ↓
POST /api/auth/login
  ↓ validateCredentials
  ↓ generateToken
  ↓ save session
  ↓
Return:
  { token, user }
  ↓
Redirect to dashboard or admin panel

10. DFD — عمل الإضافات (Plugin Runtime Behavior)
Public Widget Rendering
Public Profile UI
  ↓
Load plugin registry
  ↓
For each plugin:
   Load publicWidget.tsx
  ↓
Render widget

Dashboard Settings
Merchant → Plugin Settings
  ↓
GET plugin configuration
  ↓
UI loads dashboardSettings.tsx
  ↓
User saves configuration
  ↓
POST /api/merchant/plugins/configure
  ↓
Store config in DB
  ↓
Plugin updated