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

  const create = (callback: (value: TValue) => void) => ({ call: callback })

  return {
    get observers() {
      return _observers
    },
    create,
    notify,
    destroy,
    subscribe,
  }
}

export { createObserver }
