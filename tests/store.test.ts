import { createStore } from '../src/store'
import type { Noop } from './test.types'
import { wait } from './test.utils'

describe('vanilla', () => {
  it('should subscriber invoke after state change', () => {
    // given
    type State = {
      counter: number
      increase: Noop
    }
    const store = createStore<State>((set) => ({
      counter: 0,
      increase: () => set((prevState) => ({ counter: prevState.counter + 1 })),
    }))
    const state = store.get.state
    const spy = jest.fn()

    // when
    store.subscribe(spy)

    // then
    expect(store.get.listeners).toHaveLength(1)

    // when
    const ingredient = 1
    const oldState = { ...state }
    store.get.state.increase()

    // then
    expect(state.counter).toBe(oldState.counter + ingredient)
  })

  it('should not invoke subscriber which has selector', () => {
    // given
    const store = createStore({
      counter: 0,
      darkMode: false,
    })
    const state = store.get.state
    const spy = jest.fn()

    // when
    store.subscribe(spy, (state) => state.darkMode)

    // then
    expect(store.get.listeners).toHaveLength(1)

    // when
    const ingredient = 1
    const oldState = { ...state }
    store.setState((prevState) => ({
      counter: prevState.counter + ingredient,
    }))

    // then
    expect(state.counter).toBe(oldState.counter + ingredient)
    expect(spy).not.toHaveBeenCalled()
  })

  it('should invoke subscriber which has selector', () => {
    // given
    const store = createStore({
      counter: 0,
      darkMode: false,
    })
    const state = store.get.state
    const spy = jest.fn()

    // when
    store.subscribe(spy, (state) => state.darkMode)

    // then
    expect(store.get.listeners).toHaveLength(1)

    // when
    store.setState({
      darkMode: true,
    })

    // then
    expect(state.darkMode).toBeTruthy()
    expect(spy).toHaveBeenCalled()
  })

  it('should unsubscribe all listener before notify', () => {
    // given
    const store = createStore({
      darkMode: false,
    })
    const state = store.get.state
    const spy = jest.fn()

    // when
    store.subscribe(spy)

    // then
    expect(store.get.listeners).toHaveLength(1)

    // when
    store.destroy()

    // then
    expect(store.get.listeners).toHaveLength(0)

    // when
    store.setState({
      darkMode: true,
    })

    // then
    expect(spy).not.toHaveBeenCalled()
    expect(state.darkMode).toBeTruthy()
  })

  it('should unsubscribe only dark mode listener', () => {
    // given
    const store = createStore({
      counter: 0,
      darkMode: false,
    })
    const darkModeSpy = jest.fn()
    const counterSpy = jest.fn()

    // when
    const dorkModeListener = store.subscribe(
      darkModeSpy,
      (state) => state.darkMode
    )
    store.subscribe(counterSpy, (state) => state.counter)

    // then
    expect(store.get.listeners).toHaveLength(2)

    // when
    dorkModeListener.unsubscribe()

    // then
    expect(store.get.listeners).toHaveLength(1)
  })

  it('should resolve initial state', () => {
    // arrange
    const initialState = {
      counter: 0,
    }
    const store = createStore(() => initialState)

    // assert
    expect(store.get.state).toEqual(initialState)
  })

  it('should subscriber invoke after state change by inner setState', () => {
    // given
    type State = { counter: number; increase: Noop }
    const ingredient = 1
    const store = createStore<State>((set) => ({
      counter: 0,
      increase: () =>
        set((prevState) => ({ counter: prevState.counter + ingredient })),
    }))
    const state = store.get.state
    const spy = jest.fn()

    // when
    const prevState = { ...state }
    store.subscribe(spy, (state) => state.counter)

    // then
    expect(store.get.listeners).toHaveLength(1)

    // when
    state.increase()

    // then
    expect(state.counter).toBe(prevState.counter + ingredient)
    expect(spy).toHaveBeenCalled()
  })

  it('should change the selected value of the object while not modifying the others', () => {
    // given
    const store = createStore({
      a: {
        b: {
          c: '',
          d: '',
        },
      },
    })

    // when
    store.setState({
      a: {
        b: {
          c: 'C',
        },
      },
    })

    // then
    expect(store.get.state).toEqual({
      a: {
        b: {
          c: 'C',
          d: '',
        },
      },
    })
  })

  it('should reset to initial value', () => {
    // given
    type State = {
      counter: number
      increase: Noop
    }
    const ingredient = 1
    const store = createStore<State>((set) => ({
      counter: 0,
      increase: () =>
        set((prevState) => ({
          counter: prevState.counter + ingredient,
        })),
    }))

    // when
    const oldState = { ...store.get.state }
    store.get.state.increase()

    // then
    expect(store.get.state.counter).toEqual(oldState.counter + ingredient)

    // when
    store.reset()

    // then
    expect(store.get.state.counter).toEqual(oldState.counter)
  })

  it('should resolve middleware', () => {
    // arrange
    type State = {
      counter: any
    }
    const store = createStore<State>({
      counter: (value = 0) => ({ next: true, value }),
    })

    expect(store.get.state.counter).toBe(0)
  })

  it('middleware should block setState action', () => {
    // given
    type State = {
      counter: any
      increase: Noop
    }
    const store = createStore<State>((set) => ({
      counter: (value = 0) => ({ next: false, value }),
      increase: () => set((prevState) => ({ counter: prevState.counter + 1 })),
    }))

    // when
    store.get.state.increase()

    // then
    expect(store.get.state.counter).toBe(0)
  })

  it('middleware should not block the setState action', () => {
    // given
    type State = {
      counter: any
      increase: Noop
    }
    const store = createStore<State>((set) => ({
      counter: (value = 0) => ({ next: true, value }),
      increase: () => set((prevState) => ({ counter: prevState.counter + 1 })),
    }))

    // when
    store.get.state.increase()

    // then
    expect(store.get.state.counter).toBe(1)
  })

  it('middleware should block the inner setState action', () => {
    // given
    type State = {
      counter: any
      increase: Noop
    }
    const store = createStore<State>((set) => ({
      counter: (value = 0) => ({ next: false, value }),
      increase: () => set((prevState) => ({ counter: prevState.counter + 1 })),
    }))

    // when
    store.get.state.increase()

    // then
    expect(store.get.state.counter).toBe(0)
  })

  it('middleware should not block the inner setState action', () => {
    // given
    type State = {
      counter: any
      increase: Noop
    }
    const store = createStore<State>((set) => ({
      counter: (value = 0) => ({ next: true, value }),
      increase: () => set((prevState) => ({ counter: prevState.counter + 1 })),
    }))

    // when
    store.get.state.increase()

    // then
    expect(store.get.state.counter).toBe(1)
  })

  it('not invoke listener when state after setState action is the same', () => {
    // given
    const store = createStore({
      counter: 0,
    })

    // when
    const listener = jest.fn()
    store.subscribe(listener)

    // then
    expect(store.get.listeners).toHaveLength(1)

    // when
    store.setState({
      counter: 0,
    })

    // then
    expect(listener).not.toHaveBeenCalled()
  })

  it('should wait for async actions', async () => {
    // given
    type State = {
      counter: number
      increase: () => Promise<void>
    }
    const store = createStore<State>((set) => ({
      counter: 0,
      increase: async () => {
        await wait(1000)
        set((prevState) => ({ counter: prevState.counter + 1 }))
      },
    }))
    const state = store.get.state

    // when
    await state.increase()

    // then
    expect(state.counter).toBe(1)
  })

  it('it should return true when counter is divisible', async () => {
    // given
    type State = {
      counter: number
      increase: () => void
      isDivisible: () => boolean
    }
    const store = createStore<State>((set, get) => ({
      counter: 0,
      increase: () => set((prevState) => ({ counter: prevState.counter + 1 })),
      isDivisible: () => get().counter % 2 === 0,
    }))
    const state = store.get.state

    // when
    state.increase()
    state.increase()

    // then
    expect(store.get.state.isDivisible()).toBeTruthy()
  })

  it('should invoke listener when next value is bigger', () => {
    // given
    type State = {
      counter: number
      increase: () => void
      decrease: () => void
    }
    const store = createStore<State>((set) => ({
      counter: 0,
      increase: () => set((prevState) => ({ counter: prevState.counter + 1 })),
      decrease: () => set((prevState) => ({ counter: prevState.counter - 1 })),
    }))
    const state = store.get.state

    // when
    const logger = jest.fn()
    store.subscribe(
      logger,
      (state) => state.counter,
      (nextSlice, slice) => nextSlice > slice
    )

    // then
    expect(store.get.listeners).toHaveLength(1)

    // when
    state.increase()

    // then
    expect(logger).toHaveBeenCalled()

    // when
    state.decrease()

    // then
    expect(logger).toHaveBeenCalledTimes(1)
  })
})
