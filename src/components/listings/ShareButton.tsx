import { Share2 } from 'lucide-react'
import { useToast } from '../../hooks/useToast'

export function ShareButton({ title }: { title: string }) {
  const { showToast } = useToast()

  async function handleShare() {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        // user cancelled the share sheet — no toast needed
      }
      return
    }

    try {
      await navigator.clipboard.writeText(url)
      showToast('Link copied', { description: 'The listing link is on your clipboard.', variant: 'success' })
    } catch {
      showToast('Could not copy link', { variant: 'error' })
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex h-10 items-center gap-1.5 rounded-full border border-navy-700/15 px-4 text-sm font-medium text-navy-900 transition-colors hover:border-blue-400 hover:text-blue-500 active:scale-95 dark:border-navy-700 dark:text-white"
    >
      <Share2 className="h-4 w-4" aria-hidden="true" />
      Share
    </button>
  )
}
