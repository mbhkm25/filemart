// 404 Page for Product
// When product is not found

import Link from 'next/link'
import Button from '@/components/common/Button'
import StateBox from '@/components/common/StateBox'

export default function ProductNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <StateBox
        type="error"
        title="المنتج غير موجود"
        description="عذراً، المنتج الذي تبحث عنه غير موجود أو تم حذفه."
        actionLabel="العودة"
        onAction={() => {
          if (typeof window !== 'undefined') {
            window.history.back()
          }
        }}
      />
    </div>
  )
}

