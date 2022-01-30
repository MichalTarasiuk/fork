type Listener<TState> = (newState: TState, prevState?: TState) => void

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

  const notify = (newState: TState, prevState?: TState) => {
    for (const listener of _listeners) {
      listener(newState, prevState)
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
