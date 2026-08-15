import { Share2 } from 'lucide-react'
import { Button } from '../ui/Button'
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
    <Button variant="secondary" size="sm" icon={<Share2 className="h-4 w-4" />} onClick={handleShare}>
      Share
    </Button>
  )
}
