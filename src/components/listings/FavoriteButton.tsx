import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useFavorites } from '../../context/FavoritesContext'
import { cn } from '../../utils/cn'

export interface FavoriteButtonProps {
  propertyId: string
  className?: string
}

export function FavoriteButton({ propertyId, className }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorited = isFavorite(propertyId)

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.85 }}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        toggleFavorite(propertyId)
      }}
      aria-label={favorited ? 'Remove from saved listings' : 'Save listing'}
      aria-pressed={favorited}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-navy-900 shadow-soft backdrop-blur transition-colors hover:bg-white dark:bg-navy-900/80 dark:text-white',
        className,
      )}
    >
      <motion.span animate={favorited ? { scale: [1, 1.3, 1] } : { scale: 1 }} transition={{ duration: 0.3 }}>
        <Heart className={cn('h-4 w-4', favorited && 'fill-rose-500 text-rose-500')} aria-hidden="true" />
      </motion.span>
    </motion.button>
  )
}
