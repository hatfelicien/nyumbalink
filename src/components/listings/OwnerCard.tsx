import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import type { Property, User } from '../../types'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { buildWhatsAppLink, formatDate } from '../../utils/format'
import { ContactOwnerModal } from './ContactOwnerModal'

export function OwnerCard({ owner, property }: { owner: User; property: Property }) {
  const [contactOpen, setContactOpen] = useState(false)

  const whatsAppHref = owner.phone
    ? buildWhatsAppLink(owner.phone, `Hi, I am interested in "${property.title}" on NyumbaLink. Is it still available?`)
    : null

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Avatar name={owner.name} src={owner.avatar} size="lg" />
        <div>
          <p className="font-semibold text-navy-900 dark:text-white">{owner.name}</p>
          <p className="text-sm text-slate-500">Owner since {formatDate(owner.createdAt)}</p>
        </div>
      </div>
      <Button onClick={() => setContactOpen(true)} icon={<MessageCircle className="h-4 w-4" />}>
        Contact owner
      </Button>
      {whatsAppHref && (
        <a
          href={whatsAppHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-500/15 dark:text-emerald-400"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.77.46 3.45 1.32 4.94L2 22l5.2-1.36A9.94 9.94 0 0 0 12.04 22c5.52 0 10-4.48 10-10s-4.48-10-10-10Zm0 18.15c-1.6 0-3.15-.43-4.5-1.24l-.32-.19-3.09.81.82-3-.21-.32a8.14 8.14 0 0 1-1.26-4.36c0-4.52 3.68-8.2 8.2-8.2 4.52 0 8.2 3.68 8.2 8.2 0 4.52-3.68 8.3-8.2 8.3Zm4.51-6.13c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.13-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.22-1.46-1.37-1.7-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.23.89 2.41 1.02 2.58.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28Z" />
          </svg>
          WhatsApp
        </a>
      )}
      <ContactOwnerModal open={contactOpen} onClose={() => setContactOpen(false)} property={property} />
    </Card>
  )
}
