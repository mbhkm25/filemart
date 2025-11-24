// 404 Page for Business Profile
// When business slug is not found

import Link from 'next/link'
import Button from '@/components/common/Button'
import StateBox from '@/components/common/StateBox'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <StateBox
        type="error"
        title="الملف التجاري غير موجود"
        description="عذراً، الملف التجاري الذي تبحث عنه غير موجود أو تم حذفه."
        actionLabel="العودة إلى الصفحة الرئيسية"
        onAction={() => {
          window.location.href = '/'
        }}
      />
    </div>
  )
}

