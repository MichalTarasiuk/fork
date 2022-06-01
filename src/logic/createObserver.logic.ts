/* eslint-disable @typescript-eslint/no-non-null-assertion -- safty assertion */
import { createProxy } from '../utils/utils'

export const createObserver = <
  TState extends Record<PropertyKey, unknown>
>() => {
  type Listener = (state: TState) => void

  const observers = new WeakMap<TState, TState>()
  let savedListener: Listener | null = null

  const observe = (state: TState) => {
    if (observers.has(state)) {
      return observers.get(state)!
    }

    const proxy = createProxy(state, (state) => {
      if (savedListener) {
        savedListener(state)
      }
    })

    observers.set(state, proxy)

    return proxy
  }

  const setListener = (listener: Listener) => {
    savedListener = listener
  }

  return {
    observe,
    setListener,
  }
}
