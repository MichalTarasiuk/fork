import { useCallback, useRef } from 'react'

import { createStore } from './store'
import { useDidMount, useListener, useEventListenr } from './hooks'
import {
  merge,
  isFunction,
  pick,
  compose,
  noop,
  pickKeysByType,
  isMessageEvent,
  isStateMap,
} from './utils'
import { getSourcesMap } from './logic'
import type { StateCreator, Selector } from './store.types'
import type { Options, Config } from './remind.types'

export const broadcastChannel = new BroadcastChannel('remind')

const remind = <TState extends Record<PropertyKey, any>>(
  stateCreator: StateCreator<TState>
) => {
  const store = createStore(stateCreator)
  const sourcesMap = getSourcesMap(store)

  const useRemind = (...options: Options<TState>) => {
    type Subscriber = ReturnType<typeof store['subscribe']>
    const savedSubscriber = useRef<Subscriber | null>(null)

    const listener = useCallback((nextState: TState, state?: TState) => {
      const config = options.find((option) => !isFunction(option)) as Config
      const pickedSources = Object.values(
        pick(sourcesMap, pickKeysByType(config, true))
      )
      const combinedSources = compose(...pickedSources)

      return combinedSources({ nextState, state }).nextState
    }, [])

    const [mind, observer] = useListener(store.get.state, listener)

    useDidMount(() => {
      const selector = options.find((option) =>
        isFunction(option)
      ) as Selector<TState>
      const subscriber = store.subscribe(observer, selector)
      savedSubscriber.current = subscriber

      return () => {
        subscriber.unsubscribe()
      }
    })

    useEventListenr(broadcastChannel, 'message', (event) => {
      if (isMessageEvent(event) && isStateMap<TState>(JSON.parse(event.data))) {
        const { nextState } = JSON.parse(event.data)

        store.setState(nextState)
      }
    })

    const handler = {
      mind,
      setMind: store.setState,
      unregister: savedSubscriber.current?.unsubscribe || noop,
    }

    return merge([mind, store.setState] as const, handler)
  }

  const {
    destroy: destorySubscribers,
    reset: resetToInitialState,
    ...restStore
  } = store

  const destroy = () => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'WARN - destroy store may have unexpected effects on your application'
      )
    }

    resetToInitialState()
    destorySubscribers()

    return {
      useRemind,
      destroy,
      ...restStore,
    }
  }

  return {
    useRemind,
    destroy,
    ...restStore,
  }
}

export default remind
