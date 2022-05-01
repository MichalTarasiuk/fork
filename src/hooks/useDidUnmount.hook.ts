import { useDidMount } from '../hooks/hooks'

import type { EffectCallback } from 'react'

export const useDidUnmount = (unmountCallback: ReturnType<EffectCallback>) => {
  useDidMount(() => unmountCallback)
}
