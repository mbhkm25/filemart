'use client'

// Signup Form Client Component
// Registration form with validation

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import Link from 'next/link'

export default function SignupFormClient() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'الاسم مطلوب'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'الاسم يجب أن يكون على الأقل حرفين'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح'
    }

    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة'
    } else if (formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون على الأقل 6 أحرف'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمة المرور غير متطابقة'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      })

      const data = await res.json()

      if (data.success) {
        // Set token in cookie
        document.cookie = `token=${data.data.token}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 days
        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        // Handle API errors
        if (data.error) {
          if (data.error.includes('مستخدم')) {
            setErrors({ email: data.error })
          } else {
            setErrors({ submit: data.error })
          }
        } else if (data.details) {
          // Zod validation errors
          const zodErrors: Record<string, string> = {}
          data.details.forEach((err: any) => {
            if (err.path && err.path.length > 0) {
              zodErrors[err.path[0]] = err.message
            }
          })
          setErrors(zodErrors)
        } else {
          setErrors({ submit: 'حدث خطأ أثناء إنشاء الحساب' })
        }
      }
    } catch (err) {
      console.error('Registration error:', err)
      setErrors({ submit: 'حدث خطأ أثناء إنشاء الحساب' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md p-6 md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            إنشاء حساب جديد
          </h1>
          <p className="text-gray-600 text-sm">
            ابدأ بإنشاء ملفك التجاري الآن
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <Input
            type="text"
            name="name"
            label="الاسم"
            placeholder="أدخل اسمك الكامل"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
          />

          {/* Email */}
          <Input
            type="email"
            name="email"
            label="البريد الإلكتروني"
            placeholder="example@email.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />

          {/* Password */}
          <Input
            type="password"
            name="password"
            label="كلمة المرور"
            placeholder="6 أحرف على الأقل"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
          />

          {/* Confirm Password */}
          <Input
            type="password"
            name="confirmPassword"
            label="تأكيد كلمة المرور"
            placeholder="أعد إدخال كلمة المرور"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
          />

          {/* Submit Error */}
          {errors.submit && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
          </Button>

          {/* Login Link */}
          <div className="text-center text-sm text-gray-600">
            لديك حساب بالفعل؟{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
              تسجيل الدخول
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}

