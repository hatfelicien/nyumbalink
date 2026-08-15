import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button } from '../../components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 dark:text-blue-400">
        <Compass className="h-7 w-7" aria-hidden="true" />
      </div>
      <p className="mt-6 text-sm font-semibold text-blue-500">404</p>
      <h1 className="mt-2 text-3xl font-semibold text-navy-900 dark:text-white">Page not found</h1>
      <p className="mt-3 text-slate-500">
        The page you are looking for might have been moved, renamed, or never existed.
      </p>
      <Link to="/" className="mt-8">
        <Button>Back to home</Button>
      </Link>
    </div>
  )
}
