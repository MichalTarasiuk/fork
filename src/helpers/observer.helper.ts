export type Listener<TState> = (
  state: TState | undefined,
  nextState: TState
) => void

const createObserver = <TState>() => {
  const _listeners: Set<Listener<TState>> = new Set()

  const subscribe = (observer: Listener<TState>) => {
    _listeners.add(observer)

    return {
      body: observer,
      unsubscribe() {
        _listeners.delete(observer)
      },
    }
  }

  const destroy = () => _listeners.clear()

  const notify = (
    state: TState | undefined,
    nextState: TState,
    emitter?: Listener<TState>
  ) => {
    for (const listener of _listeners) {
      if (emitter !== listener) {
        listener(state, nextState)
      }
    }
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
