import { useEffect, useState } from 'react'
import { animate, useReducedMotion } from 'framer-motion'

export function useCountUp(target: number, duration = 1.2) {
  const [value, setValue] = useState(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion) {
      setValue(target)
      return
    }

    const controls = animate(0, target, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => setValue(Math.round(latest)),
    })

    return () => controls.stop()
  }, [target, duration, reduceMotion])

  return value
}
