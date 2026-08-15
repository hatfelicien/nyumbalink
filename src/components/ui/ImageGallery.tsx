import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { cn } from '../../utils/cn'

export interface ImageGalleryProps {
  images: string[]
  alt: string
  className?: string
}

export function ImageGallery({ images, alt, className }: ImageGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  return (
    <div className={cn('grid grid-cols-4 grid-rows-2 gap-2', className)}>
      <button
        type="button"
        onClick={() => setLightboxIndex(0)}
        className="col-span-4 row-span-2 overflow-hidden rounded-2xl sm:col-span-2"
      >
        <img src={images[0]} alt={`${alt} — main photo`} className="h-64 w-full object-cover sm:h-full" loading="lazy" />
      </button>
      {images.slice(1, 5).map((src, index) => (
        <button
          key={src}
          type="button"
          onClick={() => setLightboxIndex(index + 1)}
          className="hidden overflow-hidden rounded-2xl sm:block"
        >
          <img src={src} alt={`${alt} — photo ${index + 2}`} className="h-full w-full object-cover" loading="lazy" />
        </button>
      ))}
      <Lightbox images={images} alt={alt} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onIndexChange={setLightboxIndex} />
    </div>
  )
}

interface LightboxProps {
  images: string[]
  alt: string
  index: number | null
  onClose: () => void
  onIndexChange: (index: number) => void
}

function Lightbox({ images, alt, index, onClose, onIndexChange }: LightboxProps) {
  const open = index !== null
  const containerRef = useFocusTrap<HTMLDivElement>(open)

  useEffect(() => {
    if (!open || index === null) return
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') onIndexChange((index! + 1) % images.length)
      if (event.key === 'ArrowLeft') onIndexChange((index! - 1 + images.length) % images.length)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, index, images.length, onClose, onIndexChange])

  return createPortal(
    <AnimatePresence>
      {open && index !== null && (
        <motion.div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${alt} gallery`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col bg-navy-950/95 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between p-4">
            <p className="text-sm text-white/70">
              {index + 1} / {images.length}
            </p>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close gallery"
              className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center px-4 pb-4">
            <button
              type="button"
              onClick={() => onIndexChange((index - 1 + images.length) % images.length)}
              aria-label="Previous photo"
              className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <motion.img
              key={images[index]}
              src={images[index]}
              alt={`${alt} — photo ${index + 1}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-h-[75vh] max-w-full rounded-xl object-contain"
            />
            <button
              type="button"
              onClick={() => onIndexChange((index + 1) % images.length)}
              aria-label="Next photo"
              className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="flex justify-center gap-2 overflow-x-auto p-4">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => onIndexChange(i)}
                className={cn(
                  'h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2',
                  i === index ? 'border-blue-400' : 'border-transparent opacity-60 hover:opacity-100',
                )}
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
