// Dashboard Home Page
// BIRM: Shows business picker if multiple businesses, or redirects to single business

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import BusinessPicker from '@/components/dashboard/BusinessPicker'
import { BusinessProvider } from '@/contexts/BusinessContext'

export default async function DashboardHomePage() {
  // Check authentication
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) {
    redirect('/login')
  }

  const user = verifyToken(token)
  if (!user || (user.role !== 'merchant' && user.role !== 'admin')) {
    redirect('/login')
  }

  // Client-side BusinessPicker will fetch /api/user/businesses and handle CTA / navigation
  return (
    <BusinessProvider>
      <BusinessPicker />
    </BusinessProvider>
  )
}
