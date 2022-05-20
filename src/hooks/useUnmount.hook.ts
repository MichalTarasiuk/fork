import { useMount } from './hooks'

import type { EffectCallback } from 'react'

export const useUnmount = (effectCallback: ReturnType<EffectCallback>) => {
  useMount(() => effectCallback)
}
