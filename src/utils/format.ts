const currencyFormatter = new Intl.NumberFormat('en-RW', {
  style: 'currency',
  currency: 'RWF',
  maximumFractionDigits: 0,
})

export function formatRwf(amount: number) {
  return currencyFormatter.format(amount)
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export function formatDate(iso: string) {
  return dateFormatter.format(new Date(iso))
}

export function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffMinutes = Math.round(diffMs / 60000)

  if (diffMinutes < 1) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`

  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.round(diffHours / 24)
  if (diffDays < 30) return `${diffDays}d ago`

  return formatDate(iso)
}

export function buildWhatsAppLink(phone: string, message: string) {
  const digits = phone.replace(/[^\d]/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
