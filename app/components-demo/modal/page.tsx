// Modal Component Demo

'use client'

import { useState } from 'react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'

export default function ModalDemoPage() {
  const [isOpen1, setIsOpen1] = useState(false)
  const [isOpen2, setIsOpen2] = useState(false)
  const [isOpen3, setIsOpen3] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Modal Component</h1>
          <p className="text-gray-600">النوافذ المنبثقة مع Animations</p>
        </div>

        {/* Basic Modal */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">نافذة بسيطة</h2>
          <Button onClick={() => setIsOpen1(true)}>فتح النافذة</Button>
          <Modal
            isOpen={isOpen1}
            onClose={() => setIsOpen1(false)}
            title="نافذة بسيطة"
          >
            <p className="text-gray-600 mb-4">
              هذه نافذة منبثقة بسيطة مع عنوان.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsOpen1(false)}>
                إلغاء
              </Button>
              <Button onClick={() => setIsOpen1(false)}>موافق</Button>
            </div>
          </Modal>
        </Card>

        {/* Modal without Title */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">بدون عنوان</h2>
          <Button onClick={() => setIsOpen2(true)}>فتح بدون عنوان</Button>
          <Modal
            isOpen={isOpen2}
            onClose={() => setIsOpen2(false)}
            showCloseButton={true}
          >
            <p className="text-gray-600 mb-4">
              هذه نافذة بدون عنوان ولكن مع زر إغلاق.
            </p>
            <Button onClick={() => setIsOpen2(false)}>إغلاق</Button>
          </Modal>
        </Card>

        {/* Confirmation Modal */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">نافذة تأكيد</h2>
          <Button variant="danger" onClick={() => setIsOpen3(true)}>
            حذف عنصر
          </Button>
          <Modal
            isOpen={isOpen3}
            onClose={() => setIsOpen3(false)}
            title="تأكيد الحذف"
          >
            <p className="text-gray-600 mb-4">
              هل أنت متأكد من رغبتك في حذف هذا العنصر؟ لا يمكن التراجع عن هذه العملية.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsOpen3(false)}>
                إلغاء
              </Button>
              <Button variant="danger" onClick={() => setIsOpen3(false)}>
                حذف
              </Button>
            </div>
          </Modal>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-2">ملاحظات</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>النافذة تظهر مع fade-in 150ms</li>
            <li>slide-up 10px عند الفتح</li>
            <li>يمكن الإغلاق بالضغط خارج النافذة</li>
            <li>يمكن الإغلاق بزر X أو Escape</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}

