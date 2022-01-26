import { useEffect } from 'react'
import type { EffectCallback } from 'react'

export const useUpdate = (
  effectCallback: EffectCallback,
  ...dependencies: any[]
) => {
  useEffect(effectCallback, dependencies)
}
