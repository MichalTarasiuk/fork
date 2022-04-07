import { useRef, useMemo } from 'react'

import { createStore } from './store'
import { useDidMount, useListener } from './hooks/hooks'
import { assign, pick, compose, noop, pickKeysByValue } from './helpers/helpers'
import { getPlugins, createStash } from './logic/logic'
import type { StateCreator, Selector } from './store.types'
import type { Config } from './factory.types'

const factory = <TState extends Record<PropertyKey, unknown>>(
  stateCreator: StateCreator<TState>
) => {
  const stash = createStash<TState>()
  const store = createStore<TState>(stateCreator, {
    onMount(initialState) {
      const deserialized = stash.read()

      if (deserialized.success) {
        return deserialized.value
      }

      const savedState = stash.save(initialState)

      return savedState
    },
    onUpdate(state) {
      stash.save(state)
    },
  })
  // @ts-ignore
  const plugins = getPlugins(store)
  const state = store.state

  const hook = <TSelector extends Selector<TState>>(
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
        unregister: savedSubscriber.current?.unsubscribe || noop,
      }),
      [mind]
    )

    return assign([handler.mind, handler.setMind] as const, handler)
  }

  const { setState, subscribe } = store

  return {
    get mind() {
      return store.state
    },
    get listeners() {
      return store.listeners
    },
    useRemind: hook,
    setMind: setState,
    subscribe,
  }
}

export default factory
