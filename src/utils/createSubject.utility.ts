import type { Listener } from '../store.types'
import type { PlainObject } from '../types/types'

const createSubject = <TState extends PlainObject>() => {
  // eslint-disable-next-line functional/prefer-readonly-type -- Listeners are mutable
  const _listeners: Set<Listener<TState>> = new Set()

  const subscribe = (observer: Listener<TState>) => {
    _listeners.add(observer)

    return {
      body: observer,
      unsubscribe(this: void) {
        _listeners.delete(observer)
      },
    }
  }

  const notify = (
    state: TState,
    nextState: TState,
    emitter?: Listener<TState>
  ) => {
    const listeners = Array.from(_listeners)

    listeners.forEach((listener) => {
      if (emitter !== listener) {
        listener(state, nextState)
      }
    })
  }

  return {
    get listeners() {
      return Array.from(_listeners)
    },
    notify,
    subscribe,
  }
}

export { createSubject }
