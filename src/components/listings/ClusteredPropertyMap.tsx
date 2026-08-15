import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.markercluster'
import type { Property } from '../../types'
import { KIGALI_CENTER } from '../../utils/constants'
import { createPinIcon } from '../../utils/leafletIcons'

export interface ClusteredPropertyMapProps {
  properties: Property[]
  selectedId: string | null
  onSelect: (id: string) => void
  className?: string
}

function ClusterLayer({ properties, selectedId, onSelect }: ClusteredPropertyMapProps) {
  const map = useMap()
  const markersRef = useRef<Map<string, L.Marker>>(new Map())

  useEffect(() => {
    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 50,
    })

    const markers = new Map<string, L.Marker>()

    properties.forEach((property) => {
      const marker = L.marker([property.coordinates.lat, property.coordinates.lng], {
        icon: createPinIcon(property.id === selectedId),
      })
      marker.on('click', () => onSelect(property.id))
      markers.set(property.id, marker)
      clusterGroup.addLayer(marker)
    })

    markersRef.current = markers
    map.addLayer(clusterGroup)

    return () => {
      map.removeLayer(clusterGroup)
      markersRef.current = new Map()
    }
  }, [map, properties])

  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      marker.setIcon(createPinIcon(id === selectedId))
    })
  }, [selectedId])

  return null
}

export function ClusteredPropertyMap({ properties, selectedId, onSelect, className }: ClusteredPropertyMapProps) {
  return (
    <MapContainer center={KIGALI_CENTER} zoom={12} scrollWheelZoom className={className}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClusterLayer properties={properties} selectedId={selectedId} onSelect={onSelect} />
    </MapContainer>
  )
}
