# FileMart Plugin System

هذا المجلد يحتوي على الإضافات المخصصة لمنصة FileMart.

## هيكل الإضافة

كل إضافة يجب أن تتبع الهيكل التالي:

```
plugins/
  └── [plugin-key]/
      ├── manifest.json          # ملف Manifest (يُخزن في قاعدة البيانات)
      ├── publicWidget.tsx       # مكون Widget للواجهة العامة (اختياري)
      ├── dashboardSettings.tsx  # مكون إعدادات Dashboard (اختياري)
      └── backendHandler.ts     # معالج Backend (اختياري)
```

## Manifest Format

```json
{
  "plugin_key": "example-plugin",
  "name": "Example Plugin",
  "description": "Plugin description",
  "version": "1.0.0",
  "author": "Author Name",
  "type": "widget",
  "public_widget_path": "plugins/example-plugin/publicWidget.tsx",
  "dashboard_settings_path": "plugins/example-plugin/dashboardSettings.tsx",
  "config_schema_json": {
    "type": "object",
    "properties": {
      "setting1": {
        "type": "string",
        "title": "Setting 1",
        "description": "Setting description"
      }
    }
  },
  "hooks": {
    "onInstall": "plugins/example-plugin/hooks/onInstall.ts",
    "onUninstall": "plugins/example-plugin/hooks/onUninstall.ts",
    "onActivate": "plugins/example-plugin/hooks/onActivate.ts",
    "onDeactivate": "plugins/example-plugin/hooks/onDeactivate.ts",
    "onInit": "plugins/example-plugin/hooks/onInit.ts"
  }
}
```

## أنواع الإضافات

- **widget**: إضافة للواجهة العامة فقط
- **dashboard_module**: إضافة للوحة التحكم فقط
- **backend_handler**: إضافة للمعالجة في الخادم فقط
- **mixed**: إضافة تحتوي على أكثر من نوع

## دورة حياة الإضافة

1. **Install**: تثبيت الإضافة
2. **Init**: تهيئة الإضافة (يتم تلقائيًا بعد التثبيت)
3. **Activate**: تفعيل الإضافة
4. **Deactivate**: تعطيل الإضافة
5. **Uninstall**: إزالة الإضافة

## أمثلة

راجع الوثائق في `documentation/` لمزيد من التفاصيل.

