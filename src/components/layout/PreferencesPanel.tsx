import { Moon, Sun } from 'lucide-react'
import { useDataSaver } from '../../context/DataSaverContext'
import { LANGUAGES, useLanguage } from '../../context/LanguageContext'
import { useTheme } from '../../context/ThemeContext'
import { cn } from '../../utils/cn'
import { Switch } from '../ui/Switch'

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: T; label: string; icon?: typeof Sun }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-xl bg-navy-900/5 p-1 dark:bg-white/10">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium transition-all',
            value === option.value
              ? 'bg-white text-navy-900 shadow-sm dark:bg-navy-700 dark:text-white'
              : 'text-slate-500 hover:text-navy-900 dark:hover:text-white',
          )}
        >
          {option.icon && <option.icon className="h-4 w-4" aria-hidden="true" />}
          {option.label}
        </button>
      ))}
    </div>
  )
}

/** Appearance, language and data saver — the settings both menus (public and dashboard) expose on small screens. */
export function PreferencesPanel({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage } = useLanguage()
  const { dataSaver, setDataSaver } = useDataSaver()

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Appearance</p>
        <Segmented
          label="Appearance"
          value={theme}
          onChange={(next) => next !== theme && toggleTheme()}
          options={[
            { value: 'light', label: 'Light', icon: Sun },
            { value: 'dark', label: 'Dark', icon: Moon },
          ]}
        />
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Language</p>
        <Segmented
          label="Language"
          value={language}
          onChange={setLanguage}
          options={LANGUAGES.map((l) => ({ value: l.code, label: l.code === 'rw' ? 'Ikinyarwanda' : l.label }))}
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-navy-900 dark:text-white">Data saver</p>
          <p className="text-xs text-slate-500">Smaller photos on slow or metered connections</p>
        </div>
        <Switch checked={dataSaver} onChange={setDataSaver} label="Data saver" />
      </div>
    </div>
  )
}
