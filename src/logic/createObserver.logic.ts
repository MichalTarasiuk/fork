/* eslint-disable @typescript-eslint/no-non-null-assertion -- safty assertion */
import ObserveImpl from 'on-change'

export const createObserver = <
  TState extends Record<PropertyKey, unknown>
>() => {
  const observers = new WeakMap<TState, TState>()
  let savedListener: ((state: TState) => void) | null = null

  const observe = (state: TState) => {
    if (observers.has(state)) {
      return observers.get(state)!
    }

    const observer = ObserveImpl(state, function (this: TState) {
      if (savedListener) {
        // eslint-disable-next-line functional/no-this-expression -- liblary api
        savedListener(this)
      }
    })

    observers.set(state, observer)

    return state
  }

  const addListener = (listener: (state: TState) => void) => {
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
