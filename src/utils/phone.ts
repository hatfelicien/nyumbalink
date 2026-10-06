/**
 * Rwandan mobile numbers: 07X XXX XXXX locally, +250 7X XXX XXXX internationally, where
 * 078/079 are MTN and 072/073 are Airtel. Accepts any of the common ways people type them.
 */
const MOBILE_PATTERN = /^(?:250)?0?(7[2389]\d{7})$/

export function parseRwandaPhone(value: string): string | null {
  const digits = value.replace(/\D/g, '')
  return digits.match(MOBILE_PATTERN)?.[1] ?? null
}

export function isValidRwandaPhone(value: string) {
  return parseRwandaPhone(value) !== null
}

/** "0788100002", "250788100002" and "+250 788 100 002" all become "+250 788 100 002". */
export function formatRwandaPhone(value: string) {
  const local = parseRwandaPhone(value)
  if (!local) return value.trim()
  return `+250 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`
}

export function phoneNetwork(value: string): 'MTN' | 'Airtel' | null {
  const local = parseRwandaPhone(value)
  if (!local) return null
  return local.startsWith('78') || local.startsWith('79') ? 'MTN' : 'Airtel'
}
