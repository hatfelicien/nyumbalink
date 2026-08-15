import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import { Mail, MapPin, Phone } from 'lucide-react'
import { z } from 'zod'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { useToast } from '../../hooks/useToast'
import { withDelay } from '../../services/delay'
import { createPinIcon } from '../../utils/leafletIcons'

const OFFICE_LOCATION: [number, number] = [-1.9536, 30.0925]

const contactSchema = z.object({
  name: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email address'),
  message: z.string().min(10, 'Message should be at least 10 characters'),
})

type ContactFormValues = z.infer<typeof contactSchema>

export function ContactPage() {
  const { showToast } = useToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', message: '' },
  })

  async function onSubmit() {
    await withDelay(() => undefined)
    showToast('Message sent', { description: 'We will get back to you within one business day.', variant: 'success' })
    reset()
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-navy-900 dark:text-white sm:text-4xl">Get in touch</h1>
      <p className="mt-3 max-w-xl text-slate-500">
        Questions about a listing, your account, or partnering with us? Send a message or visit our office in
        Kigali Heights.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Full name" {...register('name')} error={errors.name?.message} />
            <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
            <Textarea label="Message" rows={5} {...register('message')} error={errors.message?.message} />
            <Button type="submit" className="w-full" loading={isSubmitting}>
              Send message
            </Button>
          </form>

          <div className="mt-6 space-y-3 border-t border-navy-700/10 pt-6 dark:border-navy-700">
            <p className="flex items-center gap-2.5 text-sm text-slate-500">
              <Mail className="h-4 w-4 text-blue-500 dark:text-blue-400" aria-hidden="true" />
              hello@nyumbalink.rw
            </p>
            <p className="flex items-center gap-2.5 text-sm text-slate-500">
              <Phone className="h-4 w-4 text-blue-500 dark:text-blue-400" aria-hidden="true" />
              +250 788 100 000
            </p>
            <p className="flex items-center gap-2.5 text-sm text-slate-500">
              <MapPin className="h-4 w-4 text-blue-500 dark:text-blue-400" aria-hidden="true" />
              Kigali Heights, KG 7 Ave, Kigali
            </p>
          </div>
        </Card>

        <div className="h-80 overflow-hidden rounded-2xl lg:h-full">
          <MapContainer center={OFFICE_LOCATION} zoom={15} scrollWheelZoom={false} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={OFFICE_LOCATION} icon={createPinIcon(true)} />
          </MapContainer>
        </div>
      </div>
    </div>
  )
}
