import { useEffect } from 'react'

import { useFirstMount } from './hooks'

import type { EffectCallback } from 'react'

export const useUpdate = (
  effectCallback: EffectCallback,
  ...dependencies: readonly unknown[]
) => {
  const isFirstMount = useFirstMount()

  useEffect(() => {
    if (!isFirstMount) {
      return effectCallback()
    }
  }, dependencies)
}
