// Landing Page
// Main landing page with hero section and features

import LandingHeader from '@/components/public/LandingHeader'
import LandingHero from '@/components/public/LandingHero'
import FeaturesSection from '@/components/public/FeaturesSection'

export default function Home() {
  return (
    <main className="min-h-screen">
      <LandingHeader />
      <LandingHero />
      <FeaturesSection />
    </main>
  )
}

