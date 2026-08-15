import type { UseFormReturn } from 'react-hook-form'
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import type { LeafletEvent, Marker as LeafletMarker } from 'leaflet'
import { LocateFixed } from 'lucide-react'
import { Input } from '../../ui/Input'
import { useReverseGeocode } from '../../../hooks/useReverseGeocode'
import { createPinIcon } from '../../../utils/leafletIcons'
import type { WizardValues } from './wizardSchema'

function ClickToPlace({ onPlace }: { onPlace: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onPlace(event.latlng.lat, event.latlng.lng)
    },
  })
  return null
}

export function StepLocation({ form }: { form: UseFormReturn<WizardValues> }) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form

  const lat = watch('coordinates.lat')
  const lng = watch('coordinates.lng')
  const coordinates = { lat, lng }
  const { address, loading } = useReverseGeocode(coordinates)

  function handlePlace(lat: number, lng: number) {
    setValue('coordinates', { lat, lng }, { shouldValidate: true })
  }

  return (
    <div className="space-y-5">
      <Input label="Street address" placeholder="e.g. KG 11 Ave, Kimironko" {...register('address')} error={errors.address?.message} />

      <div>
        <p className="mb-1.5 text-sm font-medium text-navy-900 dark:text-white">Pin the exact location</p>
        <p className="mb-3 text-sm text-slate-500">Click on the map, or drag the pin, to set the exact position.</p>
        <div className="h-80 overflow-hidden rounded-2xl border border-navy-700/10 dark:border-navy-700">
          <MapContainer center={[coordinates.lat, coordinates.lng]} zoom={14} scrollWheelZoom className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClickToPlace onPlace={handlePlace} />
            <Marker
              position={[coordinates.lat, coordinates.lng]}
              icon={createPinIcon(true)}
              draggable
              eventHandlers={{
                dragend: (event: LeafletEvent) => {
                  const marker = event.target as LeafletMarker
                  const position = marker.getLatLng()
                  handlePlace(position.lat, position.lng)
                },
              }}
            />
          </MapContainer>
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl bg-navy-900/[0.03] p-3.5 text-sm text-slate-500 dark:bg-white/5">
        <LocateFixed className="mt-0.5 h-4 w-4 shrink-0 text-blue-500 dark:text-blue-400" aria-hidden="true" />
        <div>
          <p>
            {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
          </p>
          <p className="mt-0.5 text-xs">{loading ? 'Looking up address…' : address ?? 'Address lookup unavailable — coordinates above are exact.'}</p>
        </div>
      </div>
    </div>
  )
}
