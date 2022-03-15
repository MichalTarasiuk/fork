import { useEffect } from 'react'
import type { EffectCallback } from 'react'

export const useDidMount = (effectCallback: EffectCallback) => {
  useEffect(effectCallback, [])
}
