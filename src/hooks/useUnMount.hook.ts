import { useMount } from './hooks'

import type { EffectCallback } from 'react'

export const useUnmount = (effect: ReturnType<EffectCallback>) => {
  useMount(() => effect)
}
