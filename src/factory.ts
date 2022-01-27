import { useState } from 'react'

import { create } from 'src/vanilla'
import { useDidMount, useHistoryOf } from 'src/hooks'
import type { Selector, StateCreator } from 'src/vanilla'

export const factory = <TState>(stateCreator: StateCreator<TState>) => {
  const store = create(stateCreator)
  const hook = (selector?: Selector<TState>) => {
    const [state, listener] = useState(store.getState)
    const history = useHistoryOf(state)

    useDidMount(() => {
      const subscriber = store.subscribe(listener, selector)

      return () => {
        subscriber.unsubscribe()
      }
    })

    return [state, store.setState, history] as const
  }

  hook.listeners = store.listeners
  hook.destroy = store.destroy

  const {
    destroy: destorySubscribers,
    reset: resetToInitial,
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

      resetToInitial()
      destorySubscribers()

      return {
        init: this.init,
      }
    },
  }

  return handler
}
