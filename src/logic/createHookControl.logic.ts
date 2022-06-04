import ObserveImpl from 'on-change'

import { useForce, useMount } from '../hooks/hooks'

import {
  createObserver,
  createSafeHookCall,
  createPluginsManager,
} from './logic'

import type { Store } from '../store.types'

export const createHookControl = <TState extends Record<PropertyKey, unknown>>(
  store: Store<TState>
) => {
  const pluginsManager = createPluginsManager<TState>({
    observe: (state) => observer.observe(state),
  })
  const observer = createObserver<TState>()

  const { Provider, safeHookCall, setProviderBody } = createSafeHookCall()

  setProviderBody(() => {
    const force = useForce()

    useMount(() => {
      const { removeListener } = observer.addListener((state) => {
        const target = ObserveImpl.target(state)

        store.setState(target, { replace: true })

        force()
      })

      return () => {
        removeListener()
      }
    })
  })

  return {
    Provider,
    safeHookCall,
    pluginsManager,
  }
}
