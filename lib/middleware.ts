// API Middleware for Authentication and Authorization

import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest, type JWTPayload } from './auth'
import { unauthorized, forbidden } from './api-response'
import type { UserRole } from '@/types/database'

export type AuthResult = 
  | { success: true; user: JWTPayload }
  | { success: false; response: NextResponse }

/**
 * Authentication middleware
 * Verifies JWT token and returns user or error response
 */
export function requireAuth(request: NextRequest): AuthResult {
  // Try to get token from cookies first (Next.js default)
  const cookies = request.cookies
  const tokenFromCookie = cookies.get('token')?.value
  
  // Also try from Authorization header
  const authHeader = request.headers.get('authorization')
  
  // Create headers object for getUserFromRequest
  const headers = new Headers()
  if (authHeader) {
    headers.set('authorization', authHeader)
  }
  if (tokenFromCookie) {
    headers.set('cookie', `token=${tokenFromCookie}`)
  }
  
  const user = getUserFromRequest(headers)
  
  if (!user) {
    return { success: false, response: unauthorized('يجب تسجيل الدخول') }
  }
  
  return { success: true, user }
}

/**
 * Role-based authorization middleware
 */
export function requireRole(
  request: NextRequest,
  allowedRoles: UserRole[]
): AuthResult {
  const authResult = requireAuth(request)
  
  if (!authResult.success) {
    return authResult
  }
  
  if (!allowedRoles.includes(authResult.user.role)) {
    return { success: false, response: forbidden('ليس لديك الصلاحية للوصول إلى هذا المورد') }
  }
  
  return authResult
}

/**
 * Require merchant role
 */
export function requireMerchant(request: NextRequest): AuthResult {
  return requireRole(request, ['merchant', 'admin'])
}

/**
 * Require admin role
 */
export function requireAdmin(request: NextRequest): AuthResult {
  return requireRole(request, ['admin'])
}

/**
 * Optional authentication (doesn't return error if no user)
 */
export function optionalAuth(request: NextRequest): JWTPayload | null {
  return getUserFromRequest(request.headers)
}

/**
 * Require user authentication (alias for requireAuth)
 */
export function requireUser(request: NextRequest): AuthResult {
  return requireAuth(request)
}

/**
 * Business ownership result type
 */
export type BusinessOwnershipResult =
  | { success: true; user: JWTPayload; business: { id: string; merchant_id: string } }
  | { success: false; response: NextResponse }

/**
 * Require business ownership
 * Verifies that the authenticated user owns the specified business
 */
export async function requireBusinessOwnership(
  request: NextRequest,
  businessId: string
): Promise<BusinessOwnershipResult> {
  const authResult = requireAuth(request)
  
  if (!authResult.success) {
    return { success: false, response: authResult.response }
  }

  // Check if business exists and user owns it
  const { queryOne } = await import('./db')
  
  const business = await queryOne<{ id: string; merchant_id: string }>(
    `SELECT id, merchant_id FROM business_profiles WHERE id = $1`,
    [businessId]
  )

  if (!business) {
    const { notFound } = await import('./api-response')
    return { success: false, response: notFound('الملف التجاري غير موجود') }
  }

  if (business.merchant_id !== authResult.user.userId) {
    return { success: false, response: forbidden('ليس لديك الصلاحية للوصول إلى هذا المورد') }
  }

  return { success: true, user: authResult.user, business }
}

