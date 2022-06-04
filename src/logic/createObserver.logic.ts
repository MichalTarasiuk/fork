/* eslint-disable @typescript-eslint/no-non-null-assertion -- safty assertion */
import ObserveImpl from 'on-change'

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

    const proxy = ObserveImpl(state, function (this: TState) {
      if (savedListener) {
        // eslint-disable-next-line functional/no-this-expression -- liblary api
        savedListener(this)
      }
    })

    observers.set(state, proxy)

    return proxy
  }

  const addListener = (listener: Listener) => {
    savedListener = listener

    return {
      removeListener: () => {
        savedListener = null
      },
    }
  }

  return {
    observe,
    addListener,
  }
}
