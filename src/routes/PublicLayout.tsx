import { Footer } from '../components/layout/Footer'
import { CompareBar } from '../components/listings/CompareBar'
import { Navbar } from '../components/layout/Navbar'
import { SkipToContent } from '../components/layout/SkipToContent'
import { AnimatedOutlet } from './AnimatedOutlet'

export function PublicLayout() {
  return (
    // Below md the fixed tab bar covers the bottom of the viewport, so the page reserves that space.
    <div className="pb-tabbar flex min-h-dvh flex-col bg-slate-50 dark:bg-navy-950 md:pb-0">
      <SkipToContent />
      <Navbar />
      <main id="main-content" className="flex-1">
        <AnimatedOutlet />
      </main>
      <Footer />
      <CompareBar />
    </div>
  )
}
