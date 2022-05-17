/* eslint-disable @typescript-eslint/no-non-null-assertion -- safty assertion */
import { createProxy, createRef } from '../utils/utils'

export const createObserver = <
  TState extends Record<PropertyKey, unknown>
>() => {
  type Fn = (state: TState) => void

  const observers = new WeakMap<TState, TState>()
  const { ref, setRef } = createRef<Fn | null>(null)

  const observe = (state: TState) => {
    if (observers.has(state)) {
      return observers.get(state)!
    }

    const proxy = createProxy(state, (state) => {
      if (ref.current) {
        ref.current(state)
      }
    })

    observers.set(state, proxy)

    return proxy
  }

  const configure = (fn: Fn) => {
    setRef(fn)
  }

  return {
    observe,
    configure,
  }
}
