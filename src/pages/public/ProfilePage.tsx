import { ProfileSettings } from '../../components/account/ProfileSettings'

export function ProfilePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <h1 className="text-2xl font-semibold text-navy-900 dark:text-white sm:text-3xl">Profile & settings</h1>
      <p className="mt-2 text-slate-500">Your photo, contact details and preferences.</p>
      <div className="mt-6">
        <ProfileSettings />
      </div>
    </div>
  )
}
