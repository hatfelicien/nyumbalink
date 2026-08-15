/**
 * Simulates network latency so loading states are real. Swapping a service
 * function's body for a `fetch()` call later does not require touching any
 * caller — this is the only file that needs to change.
 */
export function withDelay<T>(getValue: () => T, minMs = 400, maxMs = 700): Promise<T> {
  const duration = Math.random() * (maxMs - minMs) + minMs
  return new Promise((resolve) => {
    setTimeout(() => resolve(getValue()), duration)
  })
}
