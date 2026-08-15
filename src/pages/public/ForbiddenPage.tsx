import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { Button } from '../../components/ui/Button'

export function ForbiddenPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
        <ShieldAlert className="h-7 w-7" aria-hidden="true" />
      </div>
      <p className="mt-6 text-sm font-semibold text-rose-500">403</p>
      <h1 className="mt-2 text-3xl font-semibold text-navy-900 dark:text-white">Access denied</h1>
      <p className="mt-3 text-slate-500">
        Your account does not have permission to view this page. Try switching accounts or head back home.
      </p>
      <Link to="/" className="mt-8">
        <Button>Back to home</Button>
      </Link>
    </div>
  )
}
