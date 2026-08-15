import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { cn } from '../../utils/cn'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full text-navy-900 transition-colors hover:bg-navy-900/5 dark:text-white dark:hover:bg-white/10',
        className,
      )}
    >
      {theme === 'light' ? (
        <Moon className="h-[18px] w-[18px]" aria-hidden="true" />
      ) : (
        <Sun className="h-[18px] w-[18px]" aria-hidden="true" />
      )}
    </button>
  )
}
