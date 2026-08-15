import L from 'leaflet'

function pinSvg(selected: boolean) {
  const fill = selected ? '#2563EB' : '#0A1633'
  const glow = selected ? '<circle cx="18" cy="18" r="16" fill="#7DD3FC" opacity="0.35" />' : ''
  return `
    <svg width="36" height="46" viewBox="0 0 36 46" xmlns="http://www.w3.org/2000/svg">
      ${glow}
      <path d="M18 44C18 44 32 28.8 32 17.5C32 9.49 25.51 3 17.5 3C9.49 3 3 9.49 3 17.5C3 28.8 18 44 18 44Z"
        fill="${fill}" stroke="#7DD3FC" stroke-width="${selected ? 2 : 1}" />
      <circle cx="17.5" cy="17.5" r="6" fill="white" />
    </svg>
  `
}

export function createPinIcon(selected = false) {
  return L.divIcon({
    className: selected ? 'nyumba-pin nyumba-pin-selected' : 'nyumba-pin',
    html: pinSvg(selected),
    iconSize: [36, 46],
    iconAnchor: [18, 44],
    popupAnchor: [0, -40],
  })
}

export function createLandmarkIcon() {
  return L.divIcon({
    className: 'nyumba-landmark-pin',
    html: `<span class="flex h-3 w-3 rounded-full bg-slate-500 ring-4 ring-slate-500/20"></span>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  })
}
