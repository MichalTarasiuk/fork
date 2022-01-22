type Observer<TValue> = {
  call: (value: TValue) => void
}

const createObserver = <TValue>() => {
  const _observers: Observer<TValue>[] = []

  const subscribe = (observer: Observer<TValue>) => {
    _observers.push(observer)

    return () => ({
      unsubscribe() {
        _observers.filter((currentObserver) => currentObserver !== observer)
      },
    })
  }

  const destroy = () => {
    _observers.length = 0
  }

  const notify = (value: TValue) => {
    for (const observer of _observers) {
      observer.call(value)
    }
  }

  return {
    get observers() {
      return _observers
    },
    notify,
    destroy,
    subscribe,
  }
}

export { createObserver }
