import { useEffect } from 'react'
import type { EffectCallback } from 'react'

import { useFirstMountState } from '../hooks/hooks'

export const useDidUpdate = (
  effectCallback: EffectCallback,
  ...dependencies: unknown[]
) => {
  const isFirstMount = useFirstMountState()

  useEffect(() => {
    if (!isFirstMount) {
      return effectCallback()
    }
  }, dependencies)
}
