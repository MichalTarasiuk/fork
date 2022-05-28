import { useEffect } from 'react'

import type { EffectCallback } from 'react'

export const useMount = (effect: EffectCallback) => {
  useEffect(effect, [])
}
