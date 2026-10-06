import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Images, X } from 'lucide-react'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { cn } from '../../utils/cn'

export interface ImageGalleryProps {
  images: string[]
  alt: string
  className?: string
}

export function ImageGallery({ images, alt, className }: ImageGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [slide, setSlide] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  function handleScroll() {
    const track = trackRef.current
    if (!track) return
    setSlide(Math.round(track.scrollLeft / track.clientWidth))
  }

  return (
    <div className={className}>
      {/* Phones: a swipeable, full-bleed carousel. */}
      <div className="relative -mx-4 sm:hidden">
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory overflow-x-auto scrollbar-none"
          aria-label={`${alt} photos`}
        >
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => setLightboxIndex(index)}
              className="aspect-[4/3] w-full shrink-0 snap-center"
              aria-label={`Open photo ${index + 1} of ${images.length}`}
            >
              <img
                src={src}
                alt={`${alt} — photo ${index + 1}`}
                className="h-full w-full object-cover"
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
            </button>
          ))}
        </div>
        {images.length > 1 && (
          <>
            <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-navy-950/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
              {slide + 1} / {images.length}
            </span>
            <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5" aria-hidden="true">
              {images.map((src, index) => (
                <span
                  key={src}
                  className={cn('h-1.5 rounded-full bg-white transition-all duration-300', index === slide ? 'w-4' : 'w-1.5 opacity-60')}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Tablets and up: a cover photo with up to four thumbnails. */}
      <div className="relative hidden h-[24rem] grid-cols-4 grid-rows-2 gap-2 sm:grid lg:h-[28rem]">
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          className={cn('group overflow-hidden rounded-2xl', images.length > 1 ? 'col-span-2 row-span-2' : 'col-span-4 row-span-2')}
        >
          <img
            src={images[0]}
            alt={`${alt} — main photo`}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        </button>
        {images.slice(1, 5).map((src, index) => (
          <button
            key={src}
            type="button"
            onClick={() => setLightboxIndex(index + 1)}
            className={cn('group overflow-hidden rounded-2xl', images.length === 2 && 'col-span-2 row-span-2')}
          >
            <img
              src={src}
              alt={`${alt} — photo ${index + 2}`}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
              loading="lazy"
            />
          </button>
        ))}
        {images.length > 1 && (
          <button
            type="button"
            onClick={() => setLightboxIndex(0)}
            className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl bg-white/95 px-3.5 py-2 text-sm font-medium text-navy-900 shadow-soft backdrop-blur transition-colors hover:bg-white"
          >
            <Images className="h-4 w-4" aria-hidden="true" />
            Show all {images.length} photos
          </button>
        )}
      </div>

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
              // Swipe left/right on touch screens.
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.4}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) onIndexChange((index + 1) % images.length)
                else if (info.offset.x > 60) onIndexChange((index - 1 + images.length) % images.length)
              }}
              draggable={false}
              className="max-h-[75dvh] max-w-full touch-pan-y select-none rounded-xl object-contain"
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

          <div className="flex gap-2 overflow-x-auto p-4 scrollbar-none">
            <div className="mx-auto flex gap-2">
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
