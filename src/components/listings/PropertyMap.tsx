import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Coordinates, Property } from '../../types'
import { KIGALI_CENTER } from '../../utils/constants'
import { formatRwf } from '../../utils/format'
import { createLandmarkIcon, createPinIcon } from '../../utils/leafletIcons'

export interface PropertyMapProps {
  properties: Property[]
  selectedId?: string | null
  onSelect?: (id: string) => void
  onHover?: (id: string | null) => void
  landmarks?: { name: string; coordinates: Coordinates }[]
  zoom?: number
  fitToMarkers?: boolean
  className?: string
}

function FitBounds({ points }: { points: Coordinates[] }) {
  const map = useMap()

  useEffect(() => {
    if (points.length === 0) return
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 15)
      return
    }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]))
    map.fitBounds(bounds, { padding: [40, 40] })
  }, [map, points])

  return null
}

export function PropertyMap({
  properties,
  selectedId,
  onSelect,
  onHover,
  landmarks,
  zoom = 13,
  fitToMarkers = true,
  className,
}: PropertyMapProps) {
  const center = properties[0]
    ? ([properties[0].coordinates.lat, properties[0].coordinates.lng] as [number, number])
    : KIGALI_CENTER

  return (
    <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} className={className}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {fitToMarkers && <FitBounds points={properties.map((p) => p.coordinates)} />}

      {properties.map((property) => (
        <Marker
          key={property.id}
          position={[property.coordinates.lat, property.coordinates.lng]}
          icon={createPinIcon(property.id === selectedId)}
          eventHandlers={{
            click: () => onSelect?.(property.id),
            mouseover: () => onHover?.(property.id),
            mouseout: () => onHover?.(null),
          }}
        >
          <Popup>
            <div className="min-w-[10rem]">
              <p className="font-semibold text-navy-900">
                {formatRwf(property.price)}
                {property.purpose === 'rent' && '/mo'}
              </p>
              <p className="text-sm text-slate-500">{property.title}</p>
              <Link to={`/listings/${property.id}`} className="mt-1 inline-block text-sm font-medium text-blue-500">
                View listing →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}

      {landmarks?.map((landmark) => (
        <Marker
          key={landmark.name}
          position={[landmark.coordinates.lat, landmark.coordinates.lng]}
          icon={createLandmarkIcon()}
        >
          <Popup>{landmark.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
