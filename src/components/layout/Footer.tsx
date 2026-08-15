import { Link } from 'react-router-dom'
import { Facebook, Instagram, Twitter } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { Logo } from './Logo'

const COLUMNS = [
  {
    heading: 'Explore',
    links: [
      { to: '/browse', label: 'Browse listings' },
      { to: '/map', label: 'Map search' },
      { to: '/become-an-owner', label: 'Become an owner' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { to: '/about', label: 'About us' },
      { to: '/contact', label: 'Contact' },
      { to: '/terms', label: 'Terms of service' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { to: '/login', label: 'Log in' },
      { to: '/register', label: 'Sign up' },
    ],
  },
]

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="border-t border-navy-700 bg-navy-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo inverted />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">{t('footer.tagline')}</p>
            <div className="mt-5 flex gap-3">
              {[Facebook, Instagram, Twitter].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  aria-label="Social link"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-blue-500 hover:text-white"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.heading}>
              <h3 className="text-sm font-semibold text-white">{column.heading}</h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm text-white/60 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} NyumbaLink. {t('footer.rights')}</p>
          <p>{t('footer.madeFor')}</p>
        </div>
      </div>
    </footer>
  )
}
