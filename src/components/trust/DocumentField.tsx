import { useId } from 'react'
import { FileCheck2, UploadCloud, X } from 'lucide-react'
import type { VerificationDocType, VerificationDocument } from '../../types'
import { cn } from '../../utils/cn'
import { generateId } from '../../utils/id'
import { DOC_TYPE_LABELS } from '../../utils/verification'

const MAX_FILE_BYTES = 5 * 1024 * 1024

export interface DocumentFieldProps {
  type: VerificationDocType
  value: VerificationDocument | undefined
  onChange: (document: VerificationDocument | undefined) => void
  hint?: string
  required?: boolean
  error?: string
  onError?: (message: string) => void
}

/** One upload slot per required document, so a reviewer always knows which file is which. */
export function DocumentField({ type, value, onChange, hint, required, error, onError }: DocumentFieldProps) {
  const inputId = useId()

  function handleFile(file: File | undefined) {
    if (!file) return
    if (file.size > MAX_FILE_BYTES) {
      onError?.('Files must be 5 MB or smaller. Try a photo instead of a scan.')
      return
    }
    // Like listing photos, documents are held as object URLs — there is no file storage behind the mock services.
    onChange({ id: generateId('doc'), type, fileName: file.name, url: URL.createObjectURL(file) })
  }

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-navy-900 dark:text-white">
        {DOC_TYPE_LABELS[type]}
        {!required && <span className="ml-1 font-normal text-slate-500">(optional)</span>}
      </p>
      {value ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-3.5 py-2.5">
          <span className="flex min-w-0 items-center gap-2 text-sm text-navy-900 dark:text-white">
            <FileCheck2 className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
            <span className="truncate">{value.fileName}</span>
          </span>
          <button
            type="button"
            onClick={() => onChange(undefined)}
            aria-label={`Remove ${DOC_TYPE_LABELS[type]}`}
            className="rounded-full p-1 text-slate-500 hover:bg-navy-900/5 hover:text-rose-500 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className={cn(
            'flex cursor-pointer items-center gap-2.5 rounded-xl border border-dashed px-3.5 py-2.5 text-sm text-slate-500 transition-colors hover:border-blue-400 hover:text-blue-500',
            error ? 'border-rose-500' : 'border-navy-700/20 dark:border-navy-700',
          )}
        >
          <UploadCloud className="h-4 w-4 shrink-0" aria-hidden="true" />
          Choose a photo or PDF
          <input
            id={inputId}
            type="file"
            accept="image/*,application/pdf"
            className="sr-only"
            onChange={(e) => {
              handleFile(e.target.files?.[0])
              e.target.value = ''
            }}
          />
        </label>
      )}
      {error ? <p className="mt-1.5 text-sm text-rose-500">{error}</p> : hint ? <p className="mt-1.5 text-xs text-slate-500">{hint}</p> : null}
    </div>
  )
}
