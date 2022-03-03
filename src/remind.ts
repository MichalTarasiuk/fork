import { useCallback, useRef } from 'react'

import { createStore } from './store'
import { useDidMount, useListener } from './hooks'
import {
  merge,
  isFunction,
  watch,
  pick,
  compose,
  noop,
  equals,
  pickKeysByType,
} from './utils'
import type { StateCreator, Selector } from './store.types'
import type { Options, Config, StateMap } from './remind.types'

const broadcastChannel = new BroadcastChannel('remind')

const getSourcesMap = <TStore extends Record<string, any>>(store: TStore) => ({
  watch({ nextState, state }: StateMap<object>) {
    const modifiedNextState = watch(nextState, () => {
      store.notify(nextState, state)
    })

    return { nextState: modifiedNextState, state: state }
  },
  broadcast(stateMap: StateMap<object>) {
    if (!equals(stateMap.nextState, stateMap.state)) {
      broadcastChannel.postMessage(JSON.stringify(stateMap))
    }

    return stateMap
  },
})

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

    useDidMount(() => {
      const handleMessage = (event: MessageEvent<string>) => {
        const { nextState } = JSON.parse(event.data) as StateMap<TState>

        store.setState(nextState)
      }

      broadcastChannel.addEventListener('message', handleMessage)

      return () => {
        broadcastChannel.removeEventListener('message', handleMessage)
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
