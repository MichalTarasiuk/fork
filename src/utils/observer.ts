export type Listener<TState> = (nextState: TState, state?: TState) => void

const createObserver = <TState>() => {
  const _listeners: Set<Listener<TState>> = new Set()

  const subscribe = (observer: Listener<TState>) => {
    _listeners.add(observer)

    return {
      unsubscribe() {
        _listeners.delete(observer)
      },
    }
  }

  const destroy = () => _listeners.clear()

  const notify = (nextState: TState, state?: TState) => {
    for (const listener of _listeners) {
      listener(nextState, state)
    }
  }

  return {
    get listeners() {
      return Array.from(_listeners)
    },
    notify,
    destroy,
    subscribe,
  }
}

export { createObserver }
