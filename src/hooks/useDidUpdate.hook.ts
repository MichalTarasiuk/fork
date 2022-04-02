import { useEffect } from 'react'
import type { EffectCallback } from 'react'

import { useHasMounted } from '../hooks/hooks'

export const useDidUpdate = (
  effectCallback: EffectCallback,
  ...dependencies: unknown[]
) => {
  const hasMounted = useHasMounted()

  useEffect(() => {
    if (hasMounted.current) {
      return effectCallback()
    }
  }, dependencies)
}
