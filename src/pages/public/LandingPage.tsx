import { FaqSection } from '../../components/marketing/FaqSection'
import { FeaturedListingsSection } from '../../components/marketing/FeaturedListingsSection'
import { HeroSection } from '../../components/marketing/HeroSection'
import { HowItWorksSection } from '../../components/marketing/HowItWorksSection'
import { PopularLocationsSection } from '../../components/marketing/PopularLocationsSection'
import { RecentlyViewedSection } from '../../components/marketing/RecentlyViewedSection'
import { StatsSection } from '../../components/marketing/StatsSection'
import { TestimonialsSection } from '../../components/marketing/TestimonialsSection'

export function LandingPage() {
  return (
    <>
      <HeroSection />
      <RecentlyViewedSection />
      <HowItWorksSection />
      <StatsSection />
      <FeaturedListingsSection />
      <PopularLocationsSection />
      <TestimonialsSection />
      <FaqSection />
    </>
  )
}
