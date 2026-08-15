/**
 * The mock data model does not track per-day view history, only a running
 * total. This distributes that total across a trailing window using a
 * deterministic growth curve, so dashboard charts have something plausible
 * to render without inventing a whole analytics backend.
 */
export function buildWeeklyTrend(total: number, weeks = 8) {
  const weights = Array.from({ length: weeks }, (_, i) => i + 1)
  const weightSum = weights.reduce((sum, w) => sum + w, 0)

  return weights.map((weight, index) => ({
    label: `W${index + 1}`,
    value: Math.max(1, Math.round((total * weight) / weightSum)),
  }))
}

export function buildMonthlyTrend(createdDates: string[], months = 6) {
  const now = new Date()
  const buckets = Array.from({ length: months }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1)
    return { label: date.toLocaleDateString('en-GB', { month: 'short' }), year: date.getFullYear(), month: date.getMonth() }
  })

  return buckets.map((bucket) => ({
    label: bucket.label,
    value: createdDates.filter((iso) => {
      const date = new Date(iso)
      return date.getFullYear() === bucket.year && date.getMonth() === bucket.month
    }).length,
  }))
}
