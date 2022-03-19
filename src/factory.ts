import { useCallback, useRef, useMemo } from 'react'

import { createStore } from './store'
import { useDidMount, useListener } from './hooks/hooks'
import { merge, pick, compose, noop, pickKeysByType } from './helpers/helpers'
import { getPluginsMap } from './logic/logic'
import type { StateCreator, Selector } from './store.types'
import type { Config } from './factory.types'

const factory = <TState extends Record<PropertyKey, any>>(
  stateCreator: StateCreator<TState>
) => {
  const store = createStore<TState>(stateCreator)
  const pluginsMap = getPluginsMap(store)
  const state = store.get.state

  const useRemind = <TSelector extends Selector<TState>>(
    selector?: TSelector,
    config?: Config<TState, TSelector>
  ) => {
    type Subscriber = ReturnType<typeof store['subscribe']>
    const savedSubscriber = useRef<Subscriber | null>(null)

    const listener = useCallback(
      (nextState: TState, state?: TState) => {
        const pickedPlugins = Object.values(
          pick(pluginsMap, pickKeysByType(config || {}, true))
        )
        const combinedPlugins = compose(...pickedPlugins)

        return combinedPlugins({ nextState, state }).nextState
      },
      [config]
    )

    const [mind, observer] = useListener(state, listener)

    useDidMount(() => {
      const { equalityFn } = config || {}
      const subscriber = store.subscribe(observer, selector, equalityFn)

      savedSubscriber.current = subscriber

      return () => {
        subscriber.unsubscribe()
      }
    })

    const handler = useMemo(
      () => ({
        mind,
        setMind: store.setState,
        unregister: savedSubscriber.current?.unsubscribe || noop,
      }),
      [mind]
    )

    return merge([handler.mind, handler.setMind] as const, handler)
  }

  const { get, setState } = store

  return {
    useRemind,
    get,
    setState,
  }
}

export default factory
