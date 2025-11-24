// Client-side authentication utilities

'use client'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  
  // Get token from cookie
  const cookies = document.cookie.split(';')
  const tokenCookie = cookies.find(c => c.trim().startsWith('token='))
  
  if (!tokenCookie) return null
  
  return tokenCookie.split('=')[1] || null
}

export function setToken(token: string) {
  if (typeof window === 'undefined') return
  
  // Set token in cookie
  document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax` // 7 days
}

export function removeToken() {
  if (typeof window === 'undefined') return
  
  // Remove token cookie
  document.cookie = 'token=; path=/; max-age=0'
}

