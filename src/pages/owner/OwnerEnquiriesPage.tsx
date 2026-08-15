import { useState } from 'react'
import { Mail, MailOpen } from 'lucide-react'
import { Avatar } from '../../components/ui/Avatar'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Modal } from '../../components/ui/Modal'
import { Skeleton } from '../../components/ui/Skeleton'
import { useAuth } from '../../context/AuthContext'
import { useAsync } from '../../hooks/useAsync'
import { enquiriesService } from '../../services/enquiriesService'
import { propertiesService } from '../../services/propertiesService'
import type { Enquiry } from '../../types'
import { formatRelativeTime } from '../../utils/format'
import { cn } from '../../utils/cn'

export function OwnerEnquiriesPage() {
  const { user } = useAuth()
  const { data: enquiries, loading, error, reload } = useAsync(() => enquiriesService.getByOwner(user!.id), [user?.id])
  const { data: properties } = useAsync(() => propertiesService.getByOwner(user!.id), [user?.id])
  const [selected, setSelected] = useState<Enquiry | null>(null)

  async function openEnquiry(enquiry: Enquiry) {
    setSelected(enquiry)
    if (!enquiry.read) {
      await enquiriesService.markRead(enquiry.id)
      reload()
    }
  }

  function propertyTitle(propertyId: string) {
    return properties?.find((p) => p.id === propertyId)?.title ?? 'Listing'
  }

  if (error) return <ErrorState onRetry={reload} />
  if (loading) return <Skeleton className="h-96 w-full" />

  if ((enquiries ?? []).length === 0) {
    return <EmptyState title="No enquiries yet" description="Messages from interested tenants will appear here." />
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-navy-700/10 dark:border-navy-700">
      <ul className="divide-y divide-navy-700/10 dark:divide-navy-700">
        {enquiries!.map((enquiry) => (
          <li key={enquiry.id}>
            <button
              type="button"
              onClick={() => openEnquiry(enquiry)}
              className={cn(
                'flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-navy-900/[0.03] dark:hover:bg-white/5',
                !enquiry.read && 'bg-blue-500/5',
              )}
            >
              <Avatar name={enquiry.name} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={cn('truncate text-sm', enquiry.read ? 'font-medium text-navy-900 dark:text-white' : 'font-semibold text-navy-900 dark:text-white')}>
                    {enquiry.name}
                  </p>
                  <span className="shrink-0 text-xs text-slate-500">{formatRelativeTime(enquiry.createdAt)}</span>
                </div>
                <p className="text-xs text-slate-500">Re: {propertyTitle(enquiry.propertyId)}</p>
                <p className="mt-1 line-clamp-1 text-sm text-slate-500">{enquiry.message}</p>
              </div>
              {enquiry.read ? (
                <MailOpen className="mt-1 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
              ) : (
                <Mail className="mt-1 h-4 w-4 shrink-0 text-blue-500" aria-hidden="true" />
              )}
            </button>
          </li>
        ))}
      </ul>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name} description={selected ? `Re: ${propertyTitle(selected.propertyId)}` : undefined}>
        {selected && (
          <div className="space-y-3 text-sm">
            <p className="text-slate-500">{selected.email} · {selected.phone}</p>
            <p className="leading-relaxed text-navy-900 dark:text-white">{selected.message}</p>
            <p className="text-xs text-slate-500">{formatRelativeTime(selected.createdAt)}</p>
          </div>
        )}
      </Modal>
    </div>
  )
}
