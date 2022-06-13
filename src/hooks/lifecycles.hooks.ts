import { useEffect, useRef } from 'react'

import type { EffectCallback } from 'react'

export const useMount = (effect: EffectCallback) => {
  useEffect(effect, [])
}

export const useUnmount = (effect: ReturnType<EffectCallback>) => {
  useMount(() => effect)
}

export const useHasMounted = () => {
  const hasMounted = useRef(false)

  useMount(() => {
    hasMounted.current = true

    return () => {
      hasMounted.current = false
    }
  })

  return hasMounted
}

export function useFirstMount() {
  const isFirst = useRef(true)

  if (isFirst.current) {
    isFirst.current = false

    return true
  }

  return isFirst.current
}
