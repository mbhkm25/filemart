// Unified API Response Helper

import { NextResponse } from 'next/server'
import type { ApiResponse } from '@/types/api'

/**
 * Create a successful API response
 */
export function success<T = any>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  )
}

/**
 * Create an error API response
 */
export function error(
  error: string,
  status: number = 400,
  details?: any
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(details && { details }),
    },
    { status }
  )
}

/**
 * Create a not found response
 */
export function notFound(message: string = 'المورد غير موجود'): NextResponse<ApiResponse> {
  return error(message, 404)
}

/**
 * Create an unauthorized response
 */
export function unauthorized(message: string = 'غير مصرح'): NextResponse<ApiResponse> {
  return error(message, 401)
}

/**
 * Create a forbidden response
 */
export function forbidden(message: string = 'غير مسموح'): NextResponse<ApiResponse> {
  return error(message, 403)
}

/**
 * Create a server error response
 */
export function serverError(
  message: string = 'خطأ في الخادم',
  details?: any
): NextResponse<ApiResponse> {
  return error(message, 500, details)
}

