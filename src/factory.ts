import { create } from './vanilla'
import { useDidMount, useListener } from './hooks'
import { merge } from './utils'
import type { StateCreator, Selector } from './vanilla'

const factory = <TState>(stateCreator: StateCreator<TState>) => {
  const store = create(stateCreator)
  const useRemind = (selector?: Selector<TState>) => {
    const [state, listener] = useListener(store.get.state)

    useDidMount(() => {
      const subscriber = store.subscribe(listener, selector)

      return () => {
        subscriber.unsubscribe()
      }
    })

    const handler = {
      mind: state,
      setMind: store.setState,
    }

    return merge([state, store.setState] as const, handler)
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
