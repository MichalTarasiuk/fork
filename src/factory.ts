import { useCallback, useMemo } from 'react'

import { create } from './vanilla'
import { useDidMount, useListener } from './hooks'
import { merge, isFunction, follow } from './utils'
import type { StateCreator, Selector } from './vanilla'

type Options<TState> =
  | [Selector<TState>, Config]
  | [Config, Selector<TState>]
  | [Config]
  | [Selector<TState>]
  | []
type Config = {
  watch?: boolean
}

const factory = <TState extends object>(stateCreator: StateCreator<TState>) => {
  const store = create(stateCreator)
  const useRemind = (...options: Options<TState>) => {
    const listener = useCallback((nextState: TState, state?: TState) => {
      const config = options.find((option) => !isFunction(option)) as Config
      const { watch = false } = config || {}

      if (watch) {
        return follow(nextState, () => {
          store.notify(nextState, state)
        })
      }

      return nextState
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

    const handler = useMemo(
      () => ({
        mind,
        setMind: store.setState,
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

export default factory
