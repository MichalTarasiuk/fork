import { useState } from 'react'

import { create } from 'src/vanilla'
import { useDidMount } from 'src/hooks'
import type { Selector, StateCreator } from 'src/vanilla'

export const factory = <TState>(stateCreator: StateCreator<TState>) => {
  const store = create(stateCreator)

  return (selector?: Selector<TState>) => {
    const [state, listener] = useState(store.getState)

    useDidMount(() => {
      const subscriber = store.subscribe(listener, selector)

      return () => {
        subscriber.unsubscribe()
      }
    })

    return [state, store.setState] as const
  }
}
