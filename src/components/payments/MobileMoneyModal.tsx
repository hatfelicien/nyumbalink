import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { CheckCircle2, Smartphone, XCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { paymentService } from '../../services/paymentService'
import type { Payment, PaymentPurpose, Property } from '../../types'
import { PAYMENT_METHODS } from '../../utils/constants'
import { formatRwf } from '../../utils/format'
import { cn } from '../../utils/cn'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'

const phoneSchema = z.object({
  phone: z
    .string()
    .regex(/^(\+?250|0)?7[2389]\d{7}$/, 'Enter a valid Rwandan mobile number, e.g. 0788 123 456'),
})

type PhoneValues = z.infer<typeof phoneSchema>

export interface MobileMoneyModalProps {
  open: boolean
  onClose: () => void
  property: Property
  purpose: PaymentPurpose
  amount: number
}

type Stage = 'form' | 'pending' | 'result'

export function MobileMoneyModal({ open, onClose, property, purpose, amount }: MobileMoneyModalProps) {
  const { user } = useAuth()
  const [method, setMethod] = useState(PAYMENT_METHODS[0].value)
  const [stage, setStage] = useState<Stage>('form')
  const [payment, setPayment] = useState<Payment | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PhoneValues>({ resolver: zodResolver(phoneSchema), defaultValues: { phone: user?.phone ?? '' } })

  function handleClose() {
    onClose()
    setTimeout(() => {
      setStage('form')
      setPayment(null)
      reset({ phone: user?.phone ?? '' })
    }, 200)
  }

  async function onSubmit(values: PhoneValues) {
    if (!user) return
    setStage('pending')
    const initiated = await paymentService.initiatePayment({
      propertyId: property.id,
      guestId: user.id,
      method,
      phone: values.phone,
      amount,
      purpose,
    })
    setPayment(initiated)
    const confirmed = await paymentService.confirmPayment(initiated.id)
    if (confirmed) setPayment(confirmed)
    setStage('result')
  }

  const purposeLabel = purpose === 'caution' ? 'caution money' : 'reservation deposit'

  return (
    <Modal open={open} onClose={handleClose} title="Pay with Mobile Money" description={`${purposeLabel} for "${property.title}"`}>
      {stage === 'form' && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="rounded-xl border border-navy-700/10 bg-navy-900/5 p-4 dark:border-navy-700 dark:bg-white/5">
            <p className="text-sm text-slate-500">Amount due</p>
            <p className="text-2xl font-semibold text-navy-900 dark:text-white">{formatRwf(amount)}</p>
          </div>

          <div>
            <p className="mb-1.5 text-sm font-medium text-navy-900 dark:text-white">Choose a provider</p>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMethod(option.value)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors',
                    method === option.value
                      ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                      : 'border-navy-700/15 text-navy-900 hover:border-blue-400 dark:border-navy-700 dark:text-white',
                  )}
                >
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: option.color }} aria-hidden="true" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Mobile Money number"
            placeholder="078X XXX XXX"
            leftIcon={<Smartphone className="h-4 w-4" />}
            {...register('phone')}
            error={errors.phone?.message}
          />

          <Button type="submit" className="w-full">
            Send payment request
          </Button>
          <p className="text-center text-xs text-slate-500">
            This is a demo flow — no real Mobile Money charge is made.
          </p>
        </form>
      )}

      {stage === 'pending' && (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-blue-500/20" aria-hidden="true" />
            <Smartphone className="h-8 w-8 text-blue-500" aria-hidden="true" />
          </div>
          <div>
            <p className="font-medium text-navy-900 dark:text-white">Check your phone</p>
            <p className="mt-1 text-sm text-slate-500">
              Enter your Mobile Money PIN on the prompt sent to {payment?.phone} to approve {formatRwf(amount)}.
            </p>
          </div>
        </div>
      )}

      {stage === 'result' && payment && (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          {payment.status === 'success' ? (
            <>
              <CheckCircle2 className="h-14 w-14 text-emerald-500" aria-hidden="true" />
              <div>
                <p className="font-medium text-navy-900 dark:text-white">Payment successful</p>
                <p className="mt-1 text-sm text-slate-500">
                  Reference <span className="font-mono">{payment.reference}</span>. The owner has been notified.
                </p>
              </div>
            </>
          ) : (
            <>
              <XCircle className="h-14 w-14 text-rose-500" aria-hidden="true" />
              <div>
                <p className="font-medium text-navy-900 dark:text-white">Payment failed</p>
                <p className="mt-1 text-sm text-slate-500">The request wasn't approved in time. You can try again.</p>
              </div>
            </>
          )}
          <Button variant="secondary" onClick={handleClose} className="w-full">
            Close
          </Button>
        </div>
      )}
    </Modal>
  )
}
