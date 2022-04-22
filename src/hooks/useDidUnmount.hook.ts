import type { EffectCallback } from 'react'

import { useDidMount } from '../hooks/hooks'

export const useDidUnmount = (unmountCallback: ReturnType<EffectCallback>) => {
  useDidMount(() => unmountCallback)
}
