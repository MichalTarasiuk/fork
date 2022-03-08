import { useCallback, useRef, useMemo } from 'react'

import { createStore } from './store'
import {
  useDidMount,
  useListener,
  useEventListenr,
  useSyncedRef,
} from './hooks'
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
import { getSourcesMap, broadcastChannel } from './logic'
import type { StateCreator, Selector } from './store.types'
import type { Options, Config } from './remind.types'

const remind = <TState extends Record<PropertyKey, any>>(
  stateCreator: StateCreator<TState>
) => {
  const store = createStore(stateCreator)
  const sourcesMap = getSourcesMap(store)
  const state = store.get.state

  const useRemind = <
    TSelector extends Selector<TState>,
    TConfig extends Config<TState, TSelector>
  >(
    ...options: Options<TState, TSelector>
  ) => {
    type Subscriber = ReturnType<typeof store['subscribe']>
    const savedSubscriber = useRef<Subscriber | null>(null)
    const syncedConfig = useSyncedRef<TConfig | undefined>(
      options.find((option) => !isFunction(option)) as TConfig
    )

    const listener = useCallback((nextState: TState, state?: TState) => {
      const pickedSources = Object.values(
        pick(sourcesMap, pickKeysByType(syncedConfig.current || {}, true))
      )
      const combinedSources = compose(...pickedSources)

      return combinedSources({ nextState, state }).nextState
    }, [])

    const [mind, observer] = useListener(state, listener)

    useDidMount(() => {
      const selector = options.find((option) => isFunction(option)) as TSelector
      const { equalityFn } = syncedConfig.current || {}
      const subscriber = store.subscribe(observer, selector, equalityFn)

      savedSubscriber.current = subscriber

      return () => {
        subscriber.unsubscribe()
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
