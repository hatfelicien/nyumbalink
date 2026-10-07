import { cn } from '../../utils/cn'

function score(password: string) {
  let points = 0
  if (password.length >= 8) points++
  if (password.length >= 12) points++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) points++
  if (/\d/.test(password)) points++
  if (/[^A-Za-z0-9]/.test(password)) points++
  return Math.min(points, 4)
}

const LABELS = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong']
const COLORS = ['bg-rose-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-500']

/** Four-segment meter under a new-password field. */
export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const value = score(password)
  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn('h-1 flex-1 rounded-full transition-colors', i < value ? COLORS[value] : 'bg-navy-900/10 dark:bg-white/10')}
          />
        ))}
      </div>
      <p className="mt-1 text-xs text-slate-500">Password strength: {LABELS[value]}</p>
    </div>
  )
}
