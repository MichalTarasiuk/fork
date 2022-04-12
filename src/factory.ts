import { useRef, useMemo } from 'react'
import { unstable_batchedUpdates } from 'react-dom'

import { createStore } from './store'
import { useDidMount, useListener } from './hooks/hooks'
import { assign, pick, compose, noop, pickKeysByValue } from './helpers/helpers'
import { getPlugins, createStash, createTabIndex } from './logic/logic'
import { SHOULD_UPDATE_COMPONENT } from './constants'
import type { StateCreator, Selector } from './store.types'
import type { Config } from './factory.types'

export const { useTabIndex, setTabIndex } = createTabIndex()
export const stash = createStash()

const factory = <TState extends Record<PropertyKey, unknown>>(
  stateCreator: StateCreator<TState>
) => {
  const store = createStore<TState>(stateCreator, {
    onMount(initialState) {
      // const cachedState = stash.read()

      // if (cachedState) {
      //   return cachedState
      // }

      // const cachedInitialState = stash.save(initialState)

      return initialState
    },
    onUpdate() {
      // stash.save(state)

      setTabIndex(SHOULD_UPDATE_COMPONENT)
    },
  })
  const plugins = getPlugins<TState>(store)
  const state = store.state

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
