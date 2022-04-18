import { useMemo, useCallback } from 'react'
import { unstable_batchedUpdates } from 'react-dom'

import { createStore } from './store'
import { useDidMount, useListener, useFollow } from './hooks/hooks'
import { assign, pick, compose, noop, pickKeysByValue } from './helpers/helpers'
import { getPlugins } from './logic/logic'
import type { StateCreator, Selector, Patch, SetConfig } from './store.types'
import type { Config } from './remind.types'

const remind = <TState extends Record<PropertyKey, unknown>>(
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

    const savedSubscriber = useFollow<Subscriber | null>(null, () => {})
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

    const setMind = useCallback((patch: Patch<TState>, config: SetConfig) => {
      const emitter = savedSubscriber.current?.body

      setState(patch, config, emitter)
    }, [])

    const output = useMemo(
      () => ({
        mind,
        setMind,
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

export default remind
