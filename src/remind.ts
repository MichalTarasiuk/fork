import { useCallback } from 'react'

import { createStore } from './store'
import { useDidMount, useListener } from './hooks'
import { merge, isFunction, watch, pick, compose } from './utils'
import type { StateCreator, Selector } from './store'

type Options<TState> =
  | [Selector<TState>, Config]
  | [Config, Selector<TState>]
  | [Config]
  | [Selector<TState>]
  | []
type Config = {
  watch?: boolean
}

const getSourcesMap = <TStore extends Record<string, any>>(store: TStore) => ({
  watch<TState extends Record<string, any>>(nextState: TState, state?: TState) {
    return watch(nextState, () => {
      store.notify(nextState, state)
    })
  },
})

const remind = <TState extends object>(stateCreator: StateCreator<TState>) => {
  const store = createStore(stateCreator)
  const sourcesMap = getSourcesMap(store)

  const useRemind = (...options: Options<TState>) => {
    const listener = useCallback((nextState: TState, state?: TState) => {
      const config = options.find((option) => !isFunction(option)) as Config
      const pickedSources = Object.values(
        pick(sourcesMap, Object.keys(config || {}))
      )
      const combinedSources = compose(...pickedSources)

      return combinedSources(nextState, state)
    }, [])

    const [mind, observer] = useListener(store.get.state, listener)

    useDidMount(() => {
      const selector = options.find((option) =>
        isFunction(option)
      ) as Selector<TState>
      const subscriber = store.subscribe(observer, selector)

      return () => {
        subscriber.unsubscribe()
      }
    })

    const handler = {
      mind,
      setMind: store.setState,
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
