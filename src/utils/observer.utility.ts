export type Listener<TState> = (state: TState, nextState: TState) => void

const createObserver = <TState>() => {
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

  const destroy = () => _listeners.clear()

  const notify = (
    state: TState,
    nextState: TState,
    emitter?: Listener<TState>
  ) => {
    const listeners = [..._listeners]

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
    destroy,
    notify,
    subscribe,
  }
}

export { createObserver }
