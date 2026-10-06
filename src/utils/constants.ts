import { Car, Container, Droplets, Fan, Fuel, Shield, Trees, Wifi, Zap } from 'lucide-react'
import type { Amenity, ListingPurpose, PaymentMethod, PropertyType } from '../types'

export const PRICE_MIN = 0
export const PRICE_MAX = 2500000

export const SALE_PRICE_MIN = 0
export const SALE_PRICE_MAX = 400000000

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'bungalow', label: 'Bungalow' },
  { value: 'studio', label: 'Studio' },
  { value: 'villa', label: 'Villa' },
  { value: 'shared room', label: 'Shared room' },
]

export const LISTING_PURPOSES: { value: ListingPurpose; label: string }[] = [
  { value: 'rent', label: 'For rent' },
  { value: 'sale', label: 'For sale' },
]

export const PAYMENT_METHODS: { value: PaymentMethod; label: string; color: string }[] = [
  { value: 'mtn_momo', label: 'MTN Mobile Money', color: '#FFCB05' },
  { value: 'airtel_money', label: 'Airtel Money', color: '#ED1C24' },
]

export const AMENITIES: { value: Amenity; label: string; icon: typeof Wifi }[] = [
  { value: 'piped water', label: 'WASAC water', icon: Droplets },
  { value: 'cash power', label: 'Cash power', icon: Zap },
  { value: 'wifi', label: 'Internet', icon: Wifi },
  { value: 'parking', label: 'Parking', icon: Car },
  { value: 'water tank', label: 'Water tank', icon: Container },
  { value: 'security', label: 'Security', icon: Shield },
  { value: 'generator', label: 'Generator', icon: Fuel },
  { value: 'garden', label: 'Garden', icon: Trees },
  { value: 'ac', label: 'AC', icon: Fan },
]

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top rated' },
] as const

export const KIGALI_DISTRICTS = ['Nyarugenge', 'Gasabo', 'Kicukiro']

export const KIGALI_NEIGHBOURHOODS = [
  'Kimironko',
  'Nyarutarama',
  'Kiyovu',
  'Remera',
  'Kacyiru',
  'Kicukiro',
  'Nyamirambo',
  'Gisozi',
  'Kinyinya',
  'Kanombe',
  'Gikondo',
  'Kagarama',
  'Niboye',
  'Muhima',
  'Kibagabaga',
  'CBD',
]

export const KIGALI_CENTER: [number, number] = [-1.9536, 30.0908]

export const KIGALI_LANDMARKS: { name: string; coordinates: { lat: number; lng: number } }[] = [
  { name: 'Kigali Convention Centre', coordinates: { lat: -1.9536, lng: 30.0925 } },
  { name: 'Kigali International Airport', coordinates: { lat: -1.9686, lng: 30.1394 } },
  { name: 'Kigali Heights', coordinates: { lat: -1.9522, lng: 30.0925 } },
  { name: 'Kigali Genocide Memorial', coordinates: { lat: -1.9436, lng: 30.0614 } },
  { name: 'Kimironko Market', coordinates: { lat: -1.9439, lng: 30.1119 } },
  { name: 'Nyabugogo Bus Terminal', coordinates: { lat: -1.9439, lng: 30.0511 } },
  { name: 'Kigali Business Center', coordinates: { lat: -1.9481, lng: 30.0594 } },
  { name: 'Amahoro Stadium', coordinates: { lat: -1.9522, lng: 30.1067 } },
]

function toRadians(deg: number) {
  return (deg * Math.PI) / 180
}

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371
  const dLat = toRadians(b.lat - a.lat)
  const dLng = toRadians(b.lng - a.lng)
  const lat1 = toRadians(a.lat)
  const lat2 = toRadians(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.asin(Math.sqrt(h))
}
