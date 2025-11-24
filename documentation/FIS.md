FileMart — Interaction Specifications (FIS)

Markdown Version — Arabic
Version 1.0

1. مقدمة

يهدف هذا المستند إلى تحديد السلوك التفاعلي لجميع عناصر الواجهة في منصة FileMart، بما يشمل:

حالات العناصر (Hover, Focus, Active, Disabled)

الرسائل والتنبيهات (Success, Error, Warning, Info)

التحميل (Loading State)

التنقل (Navigation Behavior)

صفحات الحالة (Empty / Error / Offline)

سلوك النوافذ المنبثقة (Modals)

سلوك القوائم

سلوك التمرير

تفاعل الإضافات

هذه المواصفات تمنع اتخاذ قرارات عشوائية، وتضمن اتساقًا عاليًا وسلاسة في الواجهة.

2. الأزرار Buttons
2.1 حالات التفاعل
Hover

تفتيح اللون بنسبة 5%

زيادة ظل بسيط جدًا (shadow-sm)

Active (عند الضغط)

scale: 0.98

تغميق اللون بنسبة 5%

Disabled

opacity: 0.4

تعطيل جميع التفاعلات

إلغاء حالة الـ Hover بالكامل

2.2 قواعد ثابتة

لا يُسمح باستخدام ظلال ثقيلة

لا يُسمح بتغيير radius

لا يُسمح بـ bounce أو animations قوية

3. الحقول Inputs
3.1 حالات التفاعل
Focus

outline بلون Primary

زيادة حد خارجي 1px

Typing

بدون اهتزاز

بدون تغيير لون الخلفية

3.2 الأخطاء Errors

عند وقوع خطأ:

ظهور خط أحمر 2px

ظهور رسالة خطأ أسفل الحقل

لا يُعدّل تصميم الحقل الأساسي

4. البطاقات Cards
4.1 Hover

زيادة ظل بسيط

رفع البطاقة بمقدار 2px-

4.2 Active

تخفيف الظل

بدون استخدام scale

4.3 قواعد البطاقات

لا تُستخدم كبوتون

إلا إذا كانت ActionCard مخصصة

5. القوائم Lists
5.1 قواعد العرض

العناصر يجب أن تكون قابلة للضغط بوضوح

استخدام dividers خفيفة (Gray-200)

5.2 سلوك السحب (Swipe)

مخصص فقط للجوال
وخاص بصفوف الطلبات:

Swipe → تغيير حالة الطلب

5.3 ممنوعات

ممنوع التمرير الأفقي

ممنوع استخدام animations داخل القوائم

6. النوافذ المنبثقة Modals
6.1 فتح النافذة

fade-in مدة 150ms

slide-up خفيف 10px

6.2 إغلاق النافذة

الضغط خارج النافذة

زر X

زر Cancel

6.3 قواعد ثابتة

ممنوع استخدام animations ثقيلة

ممنوع استخدام vibrate

fullscreen Modal فقط على الهواتف

7. التحميل Loading
7.1 Skeleton

الأساس في التحميل

الحركة: Pulse

ممنوع استخدام shimmer

7.2 Spinners

تُستخدم فقط في:

رفع الصور

عمليات الدفع

8. نظام الرسائل Feedback System
8.1 الأنواع

Success

Error

Warning

Info

8.2 السلوك

تظهر كـ Toast أعلى الشاشة

تختفي بعد 3 ثوانٍ

يمكن أن تحوي زر إغلاق

8.3 ألوان ثابتة

Success → أخضر

Error → أحمر

Warning → أصفر

Info → أزرق فاتح

9. حالات العرض (State Pages)
9.1 Empty State

أيقونة بسيطة

عنوان قصير

زر إجراء اختياري

9.2 Error State

بطاقة صغيرة

رسالة واضحة

زر “إعادة المحاولة”

9.3 Offline State

شريط أصفر أعلى الشاشة

تعطيل العمليات التي تحتاج للإنترنت

10. التنقل Navigation
10.1 Dashboard Navigation

يعتمد على client-side routing

بدون refresh

transitions بسيطة

10.2 Public Navigation

server-side fetch

عرض سريع للصفحة

10.3 Mobile Navigation

Bottom Navigation

feedback بسيط عند اختيار التبويب

11. التمرير Scrolling
القواعد العامة

التمرير عمودي فقط

يمنع التمرير الأفقي

داخل Dashboard:

التمرير يكون ضمن المحتوى فقط

وليس الصفحة بالكامل

12. تفاعل الإضافات Plugins Interaction
12.1 Plugin Widgets

تصميم بسيط

يرث style من النظام

دون animations خاصة

12.2 Dashboard Settings

حفظ فوري

رسالة نجاح تظهر بعد كل حفظ

بدون نافذة تأكيد