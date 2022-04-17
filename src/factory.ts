import { useRef, useMemo } from 'react'
import { unstable_batchedUpdates } from 'react-dom'

import { createStore } from './store'
import { useDidMount, useListener } from './hooks/hooks'
import { assign, pick, compose, noop, pickKeysByValue } from './helpers/helpers'
import { getPlugins } from './logic/logic'
import type { StateCreator, Selector } from './store.types'
import type { Config } from './factory.types'

const factory = <TState extends Record<PropertyKey, unknown>>(
  stateCreator: StateCreator<TState>
) => {
  const store = createStore<TState>(stateCreator)
  const plugins = getPlugins(store)
  const state = store.state

  const { setState, subscribe } = store

  const useRemind = <TSelector extends Selector<TState>>(
    selector?: TSelector,
    config?: Config<TState, TSelector>
  ) => {
    type Subscriber = ReturnType<typeof store['subscribe']>

    const savedSubscriber = useRef<Subscriber | null>(null)
    const [mind, listener] = useListener(state, (nextState, state) => {
      const pickedPlugins = Object.values(
        pick(plugins, pickKeysByValue(config || {}, true))
      )
      // @ts-ignore
      const combinedPlugins = compose(...pickedPlugins)

      return combinedPlugins({ nextState, state }).nextState
    })

    useDidMount(() => {
      const { equalityFn } = config || {}
      const subscriber = store.subscribe(listener, selector, equalityFn)

      savedSubscriber.current = subscriber

      return () => {
        subscriber.unsubscribe()
      }
    })

    const output = useMemo(
      () => ({
        mind,
        setMind: store.setState,
        unsubscribe: savedSubscriber.current?.unsubscribe ?? noop,
      }),
      [mind]
    )

    return assign([output.mind, output.setMind] as const, output)
  }

  const setMind = (...params: Parameters<typeof setState>) => {
    unstable_batchedUpdates(() => {
      setState(...params)
    })
  }

  return {
    get mind() {
      return store.state
    },
    get listeners() {
      return store.listeners
    },
    useRemind,
    setMind,
    subscribe,
  }
}

export default factory
