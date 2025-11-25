'use client'

// Login Form Client Component
// Login form with validation

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'

export default function LoginFormClient() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
          setErrors({ submit: data.error })
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
          setErrors({ submit: 'حدث خطأ أثناء تسجيل الدخول' })
        }
      }
    } catch (err) {
      console.error('Login error:', err)
      setErrors({ submit: 'حدث خطأ أثناء تسجيل الدخول' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md p-6 md:p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            تسجيل الدخول
          </h1>
          <p className="text-gray-600 text-sm">
            أدخل بياناتك للوصول إلى حسابك
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="أدخل كلمة المرور"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
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
            {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </Button>

          {/* Signup Link */}
          <div className="text-center text-sm text-gray-600">
            ليس لديك حساب؟{' '}
            <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
              إنشاء حساب جديد
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}

