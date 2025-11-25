// Authentication API Route
// POST /api/auth/register

import { NextRequest } from 'next/server'
import { success, error } from '@/lib/api-response'
import { registerSchema } from '@/lib/validations'
import { queryOne, query } from '@/lib/db'
import { hashPassword, createToken } from '@/lib/auth'
import type { Merchant } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = registerSchema.parse(body)

    // Check if email already exists
    const existingMerchant = await queryOne<Merchant>(
      `SELECT * FROM merchants WHERE email = $1`,
      [validatedData.email]
    )

    if (existingMerchant) {
      return error('البريد الإلكتروني مستخدم بالفعل', 400)
    }

    // Hash password
    const passwordHash = await hashPassword(validatedData.password)

    // Create merchant
    const newMerchant = await queryOne<Merchant>(
      `INSERT INTO merchants (email, phone, password_hash, name, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        validatedData.email,
        validatedData.phone || null,
        passwordHash,
        validatedData.name,
        'merchant',
        true,
      ]
    )

    if (!newMerchant) {
      return error('فشل في إنشاء الحساب', 500)
    }

    // Create JWT token
    const token = createToken({
      userId: newMerchant.id,
      email: newMerchant.email,
      role: newMerchant.role,
    })

    return success(
      {
        token,
        user: {
          id: newMerchant.id,
          email: newMerchant.email,
          name: newMerchant.name,
          role: newMerchant.role,
        },
      },
      'تم إنشاء الحساب بنجاح'
    )
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return error('بيانات غير صحيحة', 400, err.errors)
    }
    console.error('Error during registration:', err)
    return error('فشل في إنشاء الحساب', 500)
  }
}

