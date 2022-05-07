import { useEffect } from 'react'

import type { EffectCallback } from 'react'

export const useMount = (effectCallback: EffectCallback) => {
  useEffect(effectCallback, [])
}
