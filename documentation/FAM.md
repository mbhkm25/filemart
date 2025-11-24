FileMart — Architecture Map (FAM)

Markdown Version — Arabic
Version 1.0

1) Information Architecture (IA)
الهيكل المعرفي الكامل لمنصة FileMart

هدف المستند:
وصف الشكل البنيوي لكل صفحات النظام، والعلاقات بينها، ومسارات التنقل، وحالات المستخدم، بطريقة واضحة ومنظمة، لضمان بناء المشروع دون غموض أو تضارب.

A) Public Experience (واجهة العميل)
Public Root
└── /:businessSlug
    ├── Header
    │   ├── Logo
    │   ├── Business Name
    │   └── Contact Icons
    │
    ├── Hero Section
    │   └── Cover Photo (optional)
    │
    ├── Gallery
    │   └── Grid (0..N Images)
    │
    ├── Catalog
    │   ├── Product Card (Repeating)
    │   └── Category Filters (optional)
    │
    ├── Plugin Widgets
    │   └── Widget (0..N)
    │
    ├── Order List Floating Button
    │
    └── Footer (Optional)

Public Subpages
/product/:id
/order-list
/order-success
/offline
/error

B) Merchant Dashboard (لوحة التاجر)
/dashboard
├── Home
│   ├── Profile Completion
│   ├── Quick Actions
│   ├── Public Link
│   └── Tips
│
├── Business Profile
│   ├── Basic Info
│   ├── Visual Identity
│   ├── Location
│   ├── Working Hours
│   └── Contact Links
│
├── Gallery
│   └── Manage Photos
│
├── Catalog
│   ├── Products List
│   └── Product Editor
│
├── Orders
│   ├── New
│   ├── In Progress
│   ├── Completed
│   └── Cancelled
│
├── Plugins
│   ├── Marketplace
│   ├── Plugin Details
│   └── Plugin Settings
│
└── Settings
    ├── Account
    ├── Notifications
    ├── Business Settings
    └── Delete Account

C) Admin Panel (لوحة المدير)
/admin
├── Dashboard
│   ├── Stats
│   ├── Charts
│   └── Activity Feed
│
├── Merchants
│   ├── List
│   └── Merchant Details
│
├── Business Profiles
│   ├── List
│   └── Profile Details
│
├── Plugins
│   ├── List
│   ├── Create Plugin
│   └── Edit Plugin
│
├── Orders Monitor
│   └── Global Orders
│
├── Customers
│   └── List & Details
│
├── Plans & Subscriptions
│   ├── List
│   └── Plan Editor
│
├── System Settings
└── Logs

2) Naming Conventions Specification
قواعد التسمية والهيكلة
Folder Structure
src/
  app/
    (public)
    dashboard/
    admin/
  components/
    common/
    public/
    dashboard/
    admin/
  lib/
  services/
  api/
  types/
  plugins/

File Naming

Component → BusinessCard.tsx

Page → page.tsx

API Route → /api/orders/create/route.ts

Types → Product.ts

Hook → useOrders.ts

Conventions

camelCase → للمتغيرات

PascalCase → للمكوّنات

kebab-case → للمسارات

snake_case → لقاعدة البيانات

3) Data Contracts
(JSON Models & API Contracts)
Product
{
  "id": "string",
  "profileId": "string",
  "name": "string",
  "description": "string",
  "price": 0,
  "images": ["string"],
  "category": "string",
  "status": "active | inactive",
  "createdAt": "ISODate"
}

Order
{
  "id": "string",
  "profileId": "string",
  "items": [
    {
      "productId": "string",
      "quantity": 0
    }
  ],
  "client": {
    "name": "string",
    "phone": "string"
  },
  "notes": "string",
  "status": "new | processing | completed | cancelled",
  "createdAt": "ISODate"
}

API Example

POST /api/orders/create

INPUT:

{
  "profileId": "string",
  "items": [],
  "client": {},
  "notes": ""
}


OUTPUT:

{
  "success": true,
  "orderId": "string"
}

4) Component Library Specification
مواصفات مكتبة المكوّنات
Button

Props:

variant: primary | outline | subtle

size: sm | md | lg

fullWidth: boolean

Styles:

radius: 8px

primary color: blue

Card

Props:

shadow: sm | md

radius: md | lg

Styles:

خلفية بيضاء

ظل ناعم

Input

Props:

label

placeholder

error

type

Navbar

Bottom → mobile

Side → desktop

Always RTL

StateBox

Props:

icon

title

description

5) Wireframes (Text-Based)
تخطيطات أولية نصية
Welcome Screen
[Centered Logo]
[App Name: FileMart]
[Button: Create Account]
[Button: Login]

Public Profile
[Logo]
[Business Name]
[Description]
[Gallery Grid]
[Catalog Cards]
[Plugins Widgets]
[Floating Order Button]

Dashboard Home
[Header: Welcome, Merchant Name]

[Card: Profile Completion]

[Card Grid: Quick Actions]
  - Business Profile
  - Catalog
  - Orders
  - Plugins
  - Settings

[Public Link Card]

6) Development Protocol
منهجية التطوير والهندسة

الالتزام بالـ PRD كمصدر الحقيقة

تنفيذ شاشة واحدة في كل خطوة

التوقف بعد كل شاشة لطلب الموافقة

الالتزام بـ RTL

منع التعديات:

لا قفز

لا تخمين

لا اختراع

الالتزام بـ naming ثابت

التأكد من توافق PWA

الالتزام بتصميم المكوّنات

اختبار بعد كل خطوة

7) Test Cases
سيناريوهات الاختبار
Test 1 — Create Product

Steps:

Go to Catalog

Add new product

Save

Expected:

المنتج يظهر في القائمة

يظهر في الواجهة العامة

Test 2 — Submit Order

Steps:

Add product to list

Fill customer info

Submit

Expected:

الطلب يظهر في Dashboard

رسالة نجاح تظهر

Test 3 — Install Plugin

Steps:

Open Plugins

Select plugin

Install

Expected:

تظهر صفحة إعداد الإضافة

يظهر Widget في الملف العام

Test 4 — Update Business Info

Steps:

Edit profile name and description

Save

Expected:

الصفحة العامة تتحدث فورًا