import { createStore } from '../src/store'

import { wait } from './tests.utils'

describe('store', () => {
  it('should resolve plain action', () => {
    // given
    const store = createStore(
      { counter: 0 },
      {
        increase: () => {
          return { type: 'increase' }
        },
      }
    )

    // when
    const { actions } = store.subscribe(() => ({}))

    // then
    expect(actions).toMatchInlineSnapshot(`
      Object {
        "increase": [Function],
      }
    `)
  })

  it('should return resolved actions after subscribe', () => {
    // given
    const store = createStore({ counter: 0 }, (set) => ({
      increase: () => {
        set((state) => ({ counter: state.counter + 1 }))
      },
    }))

    // when
    const { actions } = store.subscribe(() => ({}))

    // then
    expect(actions).toMatchInlineSnapshot(`
      Object {
        "increase": [Function],
      }
    `)
  })

  it('should subscribe store', () => {
    // given
    const store = createStore({ counter: 0 }, () => ({}))

    // when
    store.subscribe(() => ({}))

    // then
    expect(store.listeners).toHaveLength(1)
  })

  it('should update state after inner set state action', () => {
    // given
    const store = createStore({ counter: 0 }, (set) => ({
      increase: () => {
        set((state) => ({ counter: state.counter + 1 }))
      },
    }))

    // when
    const spy = jest.fn()
    const { actions } = store.subscribe(spy)

    // then
    expect(store.listeners).toHaveLength(1)

    if (actions) {
      // when
      actions.increase()

      // then
      expect(spy).toHaveBeenCalledWith({ counter: 0 }, { counter: 1 })
    }
  })

  it('should update state after set state action', () => {
    // given
    const store = createStore({ counter: 0 })

    // when
    const spy = jest.fn()
    store.subscribe(spy)

    // then
    expect(store.listeners).toHaveLength(1)

    // when
    store.setState((state) => {
      state.counter++
    })

    // then
    expect(spy).toHaveBeenCalledWith({ counter: 0 }, { counter: 1 })
  })

  it('should invoke subscriber after set state action', () => {
    // given
    const store = createStore({ counter: 0 }, (set) => ({
      increase: () => {
        set((state) => ({ counter: state.counter + 1 }))
      },
    }))

    // when
    const spy = jest.fn()
    const { actions } = store.subscribe(spy)

    // then
    expect(store.listeners).toHaveLength(1)

    if (actions) {
      // when
      actions.increase()

      // then
      expect(spy).toHaveBeenCalled()
    }
  })

  it('should not invoke subscriber when scope state is the same', () => {
    // given
    const store = createStore({ counter: 0, finished: false }, (set) => ({
      increase: () => {
        set((state) => ({ counter: state.counter + 1 }))
      },
    }))

    // when
    const spy = jest.fn()
    const { actions } = store.subscribe(spy, (state) => state.finished)

    // then
    expect(store.listeners).toHaveLength(1)

    if (actions) {
      // when
      actions.increase()

      // then
      expect(spy).not.toHaveBeenCalled()
    }
  })

  it('should not invoke subscriber when scope state is not the same', () => {
    // given
    const store = createStore({ counter: 0, finished: false }, (set) => ({
      increase: () => {
        set((state) => ({ counter: state.counter + 1 }))
      },
    }))

    // when
    const spy = jest.fn()
    const { actions } = store.subscribe(spy, (state) => state.counter)

    // then
    expect(store.listeners).toHaveLength(1)

    if (actions) {
      // when
      actions.increase()

      // then
      expect(spy).toHaveBeenCalled()
    }
  })

  it('should remove subscriber', () => {
    // given
    const store = createStore({ counter: 0 }, () => ({}))

    // when
    const subscriber = store.subscribe(() => ({}))

    // then
    expect(store.listeners).toHaveLength(1)

    // when
    subscriber.unsubscribe()

    // then
    expect(store.listeners).toHaveLength(0)
  })

  it('should wait for async actions', async () => {
    // given
    const store = createStore(
      {
        counter: 0,
      },
      (set) => ({
        increase: async () => {
          await wait(2000)
          set((state) => ({ counter: state.counter + 1 }))
        },
      })
    )

    // when
    const spy = jest.fn()
    const { actions } = store.subscribe(spy)

    // then
    expect(store.listeners).toHaveLength(1)

    if (actions) {
      // when
      await actions.increase()

      // then
      expect(spy).toHaveBeenCalledWith({ counter: 0 }, { counter: 1 })
    }
  })

  it('should return true when counter is divisible', () => {
    // given
    const store = createStore({ counter: 0 }, (set, get) => ({
      increase: () => set((prevState) => ({ counter: prevState.counter + 1 })),
      isDivisible: () => get().counter % 2 === 0,
    }))

    // when
    const { actions } = store.subscribe(() => ({}))

    // then
    expect(store.listeners).toHaveLength(1)

    if (actions) {
      // when
      actions.increase()
      actions.increase()

      // then
      expect(actions.isDivisible()).toBe(true)
    }
  })

  it('should invoke subscriber when next counter value is bigger', () => {
    // given
    const store = createStore(
      {
        counter: 0,
      },
      (set) => ({
        increase: () => {
          set((prevState) => ({ counter: prevState.counter + 1 }))
        },
        decrease: () => {
          set((prevState) => ({ counter: prevState.counter - 1 }))
        },
      })
    )

    // when
    const spy = jest.fn()
    const { actions } = store.subscribe(
      spy,
      (state) => state.counter,
      (slice, nextSlice) => nextSlice > slice
    )

    // then
    expect(store.listeners).toHaveLength(1)

    if (actions) {
      // when
      actions.increase()

      // then
      expect(spy).toHaveBeenCalled()

      // when
      actions.decrease()

      // then
      expect(spy).toHaveBeenCalledTimes(1)
    }
  })

  it('should replace state after set state action with replace option', () => {
    // given
    const store = createStore(
      {
        counter: 0,
        status: 'happy',
      },
      () => ({})
    )

    // when
    const spy = jest.fn()
    store.subscribe(spy)

    // then
    expect(store.listeners).toHaveLength(1)

    // when
    store.setState(
      (state) => ({
        counter: state.counter + 1,
      }),
      { replace: true }
    )

    // then
    expect(spy).toHaveBeenCalledWith(
      { counter: 0, status: 'happy' },
      { counter: 1 }
    )
  })

  it('should set state action work with immer', () => {
    // given
    const store = createStore(
      {
        counter: 0,
      },
      (set) => ({
        increase: () => {
          set((state) => {
            state.counter++
          })
        },
      })
    )

    // when
    const spy = jest.fn()
    const { actions } = store.subscribe(spy)

    // then
    expect(store.listeners).toHaveLength(1)

    if (actions) {
      // when
      actions.increase()

      // then
      expect(spy).toHaveBeenCalledWith({ counter: 0 }, { counter: 1 })
    }
  })

  it('should not invoke emitter', () => {
    // given
    const store = createStore(
      {
        counter: 0,
      },
      (set) => ({
        increase: () => {
          set(
            (state) => {
              state.counter++
            },
            { emitt: false }
          )
        },
      })
    )

    // when
    const spy = jest.fn()
    const { actions } = store.subscribe(spy)

    // then
    expect(store.listeners).toHaveLength(1)

    if (actions) {
      // when
      actions.increase()

      // then
      expect(spy).not.toHaveBeenCalled()
    }
  })
})
