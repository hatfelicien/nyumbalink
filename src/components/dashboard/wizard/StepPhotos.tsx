import { useRef, useState } from 'react'
import type { DragEvent } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { GripVertical, Star, UploadCloud, X } from 'lucide-react'
import { Input } from '../../ui/Input'
import { cn } from '../../../utils/cn'
import type { WizardValues } from './wizardSchema'

export function StepPhotos({ form }: { form: UseFormReturn<WizardValues> }) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form
  const images = watch('images')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  function addFiles(files: FileList | null) {
    if (!files) return
    const next = Array.from(files).map((file) => ({ url: URL.createObjectURL(file), isCover: false }))
    const combined = [...images, ...next]
    const hasCover = combined.some((img) => img.isCover)
    const withCover = hasCover ? combined : combined.map((img, i) => (i === 0 ? { ...img, isCover: true } : img))
    setValue('images', withCover, { shouldValidate: true })
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragOver(false)
    addFiles(event.dataTransfer.files)
  }

  function removeImage(index: number) {
    const filtered = images.filter((_, i) => i !== index)
    const hasCover = filtered.some((img) => img.isCover)
    const next = hasCover ? filtered : filtered.map((img, i) => (i === 0 ? { ...img, isCover: true } : img))
    setValue('images', next, { shouldValidate: true })
  }

  function setCover(index: number) {
    const chosen = images[index]
    const rest = images.filter((_, i) => i !== index)
    const next = [{ ...chosen, isCover: true }, ...rest.map((img) => ({ ...img, isCover: false }))]
    setValue('images', next, { shouldValidate: true })
  }

  function reorder(from: number, to: number) {
    if (from === to) return
    const next = [...images]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setValue('images', next, { shouldValidate: true })
  }

  return (
    <div className="space-y-5">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors',
          dragOver ? 'border-blue-500 bg-blue-500/5' : 'border-navy-700/20 hover:border-blue-400 dark:border-navy-700',
        )}
      >
        <UploadCloud className="h-8 w-8 text-blue-500 dark:text-blue-400" aria-hidden="true" />
        <p className="mt-3 text-sm font-medium text-navy-900 dark:text-white">Drag photos here, or click to browse</p>
        <p className="mt-1 text-xs text-slate-500">PNG or JPG, at least 4 photos recommended</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>
      {errors.images?.message && <p className="text-sm text-rose-500">{errors.images.message}</p>}

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image, index) => (
            <div
              key={image.url}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null) reorder(dragIndex, index)
                setDragIndex(null)
              }}
              className="group relative aspect-square overflow-hidden rounded-xl border border-navy-700/10 dark:border-navy-700"
            >
              <img src={image.url} alt={`Upload ${index + 1}`} className="h-full w-full object-cover" />
              {image.isCover && (
                <span className="absolute left-2 top-2 rounded-full bg-blue-500 px-2 py-0.5 text-xs font-medium text-white">
                  Cover
                </span>
              )}
              <div className="absolute inset-0 flex items-start justify-between bg-navy-950/0 p-2 opacity-0 transition-opacity group-hover:bg-navy-950/40 group-hover:opacity-100">
                <span className="cursor-grab rounded-full bg-white/90 p-1.5 text-navy-900">
                  <GripVertical className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <div className="flex gap-1.5">
                  {!image.isCover && (
                    <button
                      type="button"
                      onClick={() => setCover(index)}
                      aria-label="Set as cover photo"
                      className="rounded-full bg-white/90 p-1.5 text-navy-900 hover:bg-white"
                    >
                      <Star className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    aria-label="Remove photo"
                    className="rounded-full bg-white/90 p-1.5 text-rose-500 hover:bg-white"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Input
        label="Video tour link (optional)"
        placeholder="https://youtu.be/…"
        {...register('videoUrl')}
        error={errors.videoUrl?.message}
        hint="A YouTube link or a direct .mp4 link. It only loads when a tenant presses play."
      />
    </div>
  )
}
