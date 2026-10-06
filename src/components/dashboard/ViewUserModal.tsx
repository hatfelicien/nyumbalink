import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { Modal } from '../ui/Modal'
import { VerificationBadge } from '../trust/VerificationBadge'
import type { User } from '../../types'
import { formatDate } from '../../utils/format'

const STATUS_VARIANT = { active: 'success', pending: 'pending', suspended: 'danger' } as const

export function ViewUserModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  return (
    <Modal open={!!user} onClose={onClose} title="Account details" size="sm">
      {user && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <Avatar name={user.name} src={user.avatar} size="lg" />
            <div>
              <p className="font-semibold text-navy-900 dark:text-white">{user.name}</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <Badge variant={STATUS_VARIANT[user.status]} className="capitalize">
                  {user.status}
                </Badge>
                {user.role === 'owner' && (
                  <VerificationBadge kind="landlord" status={user.verification ?? 'unverified'} showUnverified />
                )}
              </div>
            </div>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Email</dt>
              <dd className="text-navy-900 dark:text-white">{user.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Phone</dt>
              <dd className="text-navy-900 dark:text-white">{user.phone ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">City</dt>
              <dd className="text-navy-900 dark:text-white">{user.city ?? '—'}</dd>
            </div>
            {user.nationalId && (
              <div className="flex justify-between">
                <dt className="text-slate-500">National ID</dt>
                <dd className="text-navy-900 dark:text-white">{user.nationalId}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-slate-500">Joined</dt>
              <dd className="text-navy-900 dark:text-white">{formatDate(user.createdAt)}</dd>
            </div>
          </dl>
        </div>
      )}
    </Modal>
  )
}
