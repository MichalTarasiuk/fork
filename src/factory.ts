import { useCallback, useRef, useMemo } from 'react'

import { createStore } from './store'
import { useDidMount, useListener, useEventListenr } from './hooks/hooks'
import {
  merge,
  pick,
  compose,
  noop,
  pickKeysByType,
  isMessageEvent,
  isStateMap,
} from './helpers/helpers'
import { getPluginsMap, createStash, broadcastChannel } from './logic/logic'
import type { StateCreator, Selector } from './store.types'
import type { Config } from './factory.types'

const factory = <TState extends Record<PropertyKey, any>>(
  stateCreator: StateCreator<TState>
) => {
  const stash = createStash<TState>()
  const store = createStore<TState>(stateCreator, {
    onMount() {
      const state = stash.read()

      return state
    },
    onUpdate(nextState) {
      stash.set(nextState)
    },
  })
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

    useDidMount(() => {
      if (stash.isNotReadable) {
        stash.set(mind as TState)
      }
    })

    useEventListenr(broadcastChannel, 'message', (event) => {
      isMessageEvent(event, (data) => {
        const parseData = JSON.parse(data)

        if (isStateMap(parseData)) {
          const { nextState } = parseData
          store.setState(nextState)
        }
      })
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
