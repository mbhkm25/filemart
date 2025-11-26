// Authentication Utilities (JWT)

import jwt, { SignOptions, Secret } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import type { UserRole } from '@/types/database'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
}

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

/**
 * Verify a password
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Create a JWT token
 */
export function createToken(payload: JWTPayload): string {
  // Cast options to any to satisfy jsonwebtoken type overloads at compile time
  const options = { expiresIn: JWT_EXPIRES_IN } as any
  return jwt.sign(payload, JWT_SECRET as Secret, options)
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    return null
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(
  authHeader: string | null
): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

/**
 * Get user from request headers or cookies
 */
export function getUserFromRequest(
  headers: Headers | HeadersInit
): JWTPayload | null {
  // Try to get token from Authorization header first
  const authHeader = headers instanceof Headers 
    ? headers.get('authorization')
    : (headers as Record<string, string>)['authorization']
  
  let token = extractTokenFromHeader(authHeader)
  
  // If no token in header, try to get from cookie
  if (!token) {
    const cookieHeader = headers instanceof Headers
      ? headers.get('cookie')
      : (headers as Record<string, string>)['cookie']
    
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=')
        acc[key] = value
        return acc
      }, {} as Record<string, string>)
      
      token = cookies['token'] || null
    }
  }
  
  if (!token) {
    return null
  }
  
  return verifyToken(token)
}

