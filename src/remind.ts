import { useCallback } from 'react'

import { createStore } from './store'
import { useDidMount, useListener } from './hooks'
import {
  merge,
  isFunction,
  follow,
  pick,
  pickKeysByValue,
  compose,
} from './utils'
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

const defaultConfig = {
  watch: false,
}

const getConfigSources = <TStore extends Record<string, any>>(
  store: TStore
) => ({
  watch<TState extends Record<string, any>>(nextState: TState, state?: TState) {
    return follow(nextState, () => {
      store.notify(nextState, state)
    })
  },
})

const remind = <TState extends object>(stateCreator: StateCreator<TState>) => {
  const store = createStore(stateCreator)
  const configSources = getConfigSources(store)

  const useRemind = (...options: Options<TState>) => {
    const listener = useCallback((nextState: TState, state?: TState) => {
      const partialConfig = options.find(
        (option) => !isFunction(option)
      ) as Config
      const config = { ...defaultConfig, ...partialConfig }
      const sourcesMap = pick(configSources, pickKeysByValue(config, true))
      const combinedSources = compose(...Object.values(sourcesMap))

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
