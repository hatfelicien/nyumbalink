import { useEffect, useState } from 'react'
import type { Coordinates } from '../types'
import { useDebounce } from './useDebounce'

/** Free, keyless reverse geocoding via OpenStreetMap's Nominatim, matching the no-API-key map stack. */
export function useReverseGeocode(coordinates: Coordinates | null) {
  const debounced = useDebounce(coordinates, 600)
  const [address, setAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!debounced) return
    let cancelled = false
    setLoading(true)

    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${debounced.lat}&lon=${debounced.lng}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { display_name?: string } | null) => {
        if (!cancelled) setAddress(json?.display_name ?? null)
      })
      .catch(() => {
        if (!cancelled) setAddress(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [debounced])

  return { address, loading }
}
