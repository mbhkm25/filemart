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
  const user = getUserFromRequest(request.headers)
  
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

