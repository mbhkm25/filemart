// Authentication API Route
// POST /api/auth/login

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { loginSchema } from '@/lib/validations'
import { queryOne } from '@/lib/db'
import { verifyPassword, createToken } from '@/lib/auth'
import type { Merchant } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = loginSchema.parse(body)

    // Find merchant by email
    const merchant = await queryOne<Merchant>(
      `SELECT * FROM merchants WHERE email = $1 AND is_active = true`,
      [validatedData.email]
    )

    if (!merchant) {
      return error('البريد الإلكتروني أو كلمة المرور غير صحيحة', 401)
    }

    // Verify password
    const isPasswordValid = await verifyPassword(
      validatedData.password,
      merchant.password_hash
    )

    if (!isPasswordValid) {
      return error('البريد الإلكتروني أو كلمة المرور غير صحيحة', 401)
    }

    // Create JWT token
    const token = createToken({
      userId: merchant.id,
      email: merchant.email,
      role: merchant.role,
    })

    return success(
      {
        token,
        user: {
          id: merchant.id,
          email: merchant.email,
          name: merchant.name,
          role: merchant.role,
        },
      },
      'تم تسجيل الدخول بنجاح'
    )
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return error('بيانات غير صحيحة', 400, err.errors)
    }
    console.error('Error during login:', err)
    return error('فشل في تسجيل الدخول', 500)
  }
}

