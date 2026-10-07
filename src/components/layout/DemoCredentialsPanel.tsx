import { ShieldCheck, User, UserCog } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { cn } from '../../utils/cn'

export interface DemoAccount {
  role: string
  email: string
  icon: typeof User
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  { role: 'Admin', email: 'admin@nyumbalink.rw', icon: ShieldCheck },
  { role: 'Owner', email: 'owner@nyumbalink.rw', icon: UserCog },
  { role: 'Guest', email: 'guest@nyumbalink.rw', icon: User },
]

export function DemoCredentialsPanel({ onSelect, loading }: { onSelect: (email: string) => void; loading?: boolean }) {
  const { t } = useLanguage()

  return (
    <div className="rounded-xl border border-dashed border-navy-700/20 p-4 dark:border-navy-700">
      <p className="text-sm font-medium text-navy-900 dark:text-white">{t('auth.demo.title')}</p>
      <p className="mt-1 text-xs text-slate-500">{t('auth.demo.subtitle')}</p>
      <div className="mt-3 space-y-2">
        {DEMO_ACCOUNTS.map((account) => (
          <button
            key={account.email}
            type="button"
            disabled={loading}
            onClick={() => onSelect(account.email)}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg border border-navy-700/10 px-3 py-2 text-left text-sm transition-colors hover:border-blue-400 hover:bg-blue-500/5 disabled:pointer-events-none disabled:opacity-50 dark:border-navy-700',
            )}
          >
            <account.icon className="h-4 w-4 shrink-0 text-blue-500 dark:text-blue-400" aria-hidden="true" />
            <span className="font-medium text-navy-900 dark:text-white">{account.role}</span>
            <span className="ml-auto min-w-0 truncate text-xs text-slate-500">{account.email}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
