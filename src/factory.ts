import { useRef, useMemo } from 'react'
import { unstable_batchedUpdates } from 'react-dom'

import { createStore } from './store'
import { useDidMount, useListener } from './hooks/hooks'
import { assign, pick, compose, noop, pickKeysByValue } from './helpers/helpers'
import { getPlugins, createStash, createTabIndex } from './logic/logic'
import { SHOULD_UPDATE_COMPONENT, HOSTNAME } from './constants'
import type { StateCreator, Selector } from './store.types'
import type { Config } from './factory.types'

export const { useTabIndex, setTabIndex } = createTabIndex(HOSTNAME)

const factory = <TState extends Record<PropertyKey, unknown>>(
  stateCreator: StateCreator<TState>
) => {
  const stash = createStash<TState>(HOSTNAME)
  const store = createStore<TState>(stateCreator, {
    onMount(initialState) {
      const deserialized = stash.read()

      if (deserialized.success) {
        // FIXME
        return { ...initialState, ...deserialized.current }
      }

      stash.save(initialState)

      return initialState
    },
    onUpdate(state) {
      stash.save(state)
      setTabIndex(SHOULD_UPDATE_COMPONENT)
    },
  })
  // @ts-ignore
  const plugins = getPlugins(store)
  const state = store.state

  const useRemind = <TSelector extends Selector<TState>>(
    selector?: TSelector,
    config?: Config<TState, TSelector>
  ) => {
    type Subscriber = ReturnType<typeof store['subscribe']>

    const savedSubscriber = useRef<Subscriber | null>(null)
    // @ts-ignore
    const [mind, listener] = useListener(state, (nextState, state) => {
      const pickedPlugins = Object.values(
        pick(plugins, pickKeysByValue(config || {}, true))
      )
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

    const handler = useMemo(
      () => ({
        mind,
        setMind: store.setState,
        unregister: savedSubscriber.current?.unsubscribe ?? noop,
      }),
      [mind]
    )

    return assign([handler.mind, handler.setMind] as const, handler)
  }

  const { setState, subscribe } = store

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
