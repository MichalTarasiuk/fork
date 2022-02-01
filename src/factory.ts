import { create } from 'src/vanilla'
import { useDidMount, useHistoryOf, useListener } from 'src/hooks'
import type { Selector, StateCreator } from 'src/vanilla'

export const factory = <TState>(stateCreator: StateCreator<TState>) => {
  const store = create(stateCreator)
  const hook = (selector?: Selector<TState>) => {
    const [state, listener] = useListener(store.getState)
    const history = useHistoryOf(state)

    useDidMount(() => {
      const subscriber = store.subscribe(listener, selector)

      return () => {
        subscriber.unsubscribe()
      }
    })

    return [state, store.setState, history] as const
  }

  const {
    destroy: destorySubscribers,
    reset: resetToInitialState,
    ...restStore
  } = store

  const handler = {
    init() {
      return {
        useRemind: hook,
        destory: this.destory,
        ...restStore,
      }
    },
    destory() {
      console.warn(
        'WARN - destroy store may have unexpected effects on your application'
      )

      resetToInitialState()
      destorySubscribers()

      return {
        init: this.init,
      }
    },
  }

  return handler.init()
}
