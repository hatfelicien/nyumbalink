import { Footer } from '../components/layout/Footer'
import { Navbar } from '../components/layout/Navbar'
import { SkipToContent } from '../components/layout/SkipToContent'
import { AnimatedOutlet } from './AnimatedOutlet'

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-navy-950">
      <SkipToContent />
      <Navbar />
      <main id="main-content" className="flex-1">
        <AnimatedOutlet />
      </main>
      <Footer />
    </div>
  )
}
