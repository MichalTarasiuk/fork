import { useEffect } from 'react'
import type { EffectCallback } from 'react'

import { useFirstMount } from '../hooks/hooks'

export const useDidUpdate = (
  effectCallback: EffectCallback,
  ...dependencies: unknown[]
) => {
  const isFirstMount = useFirstMount()

  useEffect(() => {
    if (!isFirstMount) {
      return effectCallback()
    }
  }, dependencies)
}
