import { useMount } from './hooks'

import type { EffectCallback } from 'react'

export const useUnmount = (unmountCallback: ReturnType<EffectCallback>) => {
  useMount(() => unmountCallback)
}
