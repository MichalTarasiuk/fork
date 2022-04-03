import { createStore } from '../src/store'
import { wait } from './tests.utils'
import type { Noop } from './test.types'

describe('store', () => {
  it('should invoke subscriber after state change', () => {
    // given
    type State = {
      counter: number
      increase: Noop
    }
    const store = createStore<State>((set) => ({
      counter: 0,
      increase: () => set((prevState) => ({ counter: prevState.counter + 1 })),
    }))

    // when
    const spy = jest.fn()
    store.subscribe(spy)

    // then
    expect(store.listeners).toHaveLength(1)

    // when
    store.state.increase()

    // then
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should not invoke subscriber which has selector', () => {
    // given
    const store = createStore({
      counter: 0,
      darkMode: false,
    })
    const state = store.state

    // when
    const spy = jest.fn()
    store.subscribe(spy, (state) => state.darkMode)

    // then
    expect(store.listeners).toHaveLength(1)

    // when
    const oldState = { ...state }
    store.setState((prevState) => ({
      counter: prevState.counter + 1,
    }))

    // then
    expect(state.counter).toBe(oldState.counter + 1)
    expect(spy).not.toHaveBeenCalled()
  })

  it('should invoke subscriber which has selector', () => {
    // given
    const store = createStore({
      counter: 0,
      darkMode: false,
    })
    const state = store.state

    // when
    const spy = jest.fn()
    store.subscribe(spy, (state) => state.darkMode)

    // then
    expect(store.listeners).toHaveLength(1)

    // when
    store.setState({
      darkMode: true,
    })

    // then
    expect(state.darkMode).toBeTruthy()
    expect(spy).toHaveBeenCalled()
  })

  it('should unsubscribe only counter listener', () => {
    // given
    const store = createStore({
      counter: 0,
      darkMode: false,
    })
    const darkModeSpy = jest.fn()
    const counterSpy = jest.fn()

    // when
    const counterListener = store.subscribe(
      counterSpy,
      (state) => state.counter
    )
    store.subscribe(darkModeSpy, (state) => state.darkMode)

    // then
    expect(store.listeners).toHaveLength(2)

    // when
    counterListener.unsubscribe()

    // then
    expect(store.listeners).toHaveLength(1)
  })

  it('should resolve initial state', () => {
    // arrange
    const initialState = {
      counter: 0,
    }
    const store = createStore(() => initialState)

    // assert
    expect(store.state).toEqual(initialState)
  })

  it('should invoke subscriber after state change by inner setState', () => {
    // given
    type State = { counter: number; increase: Noop }
    const store = createStore<State>((set) => ({
      counter: 0,
      increase: () => set((prevState) => ({ counter: prevState.counter + 1 })),
    }))
    const state = store.state

    // when
    const prevState = { ...state }
    const spy = jest.fn()
    store.subscribe(spy, (state) => state.counter)

    // then
    expect(store.listeners).toHaveLength(1)

    // when
    state.increase()

    // then
    expect(spy).toHaveBeenCalled()
  })

  it('should reset to initial value', () => {
    // given
    type State = {
      counter: number
      increase: Noop
    }
    const store = createStore<State>((set) => ({
      counter: 0,
      increase: () =>
        set((prevState) => ({
          counter: prevState.counter + 1,
        })),
    }))
    const state = store.state

    // when
    const oldState = { ...state }
    state.increase()

    // then
    expect(state.counter).toEqual(oldState.counter + 1)

    // when
    store.reset()

    // then
    expect(store.state)
  })

  it('should not invoke listener when state after call setState action is the same', () => {
    // given
    const store = createStore({
      counter: 0,
    })

    // when
    const spy = jest.fn()
    store.subscribe(spy)

    // then
    expect(store.listeners).toHaveLength(1)

    // when
    store.setState({
      counter: 0,
    })

    // then
    expect(spy).not.toHaveBeenCalled()
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
    const state = store.state

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
    const state = store.state

    // when
    state.increase()
    state.increase()

    // then
    expect(store.state.isDivisible()).toBeTruthy()
  })

  it('should invoke listener when next counter value is bigger', () => {
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
    const state = store.state

    // when
    const logger = jest.fn()
    store.subscribe(
      logger,
      (state) => state.counter,
      (nextSlice, slice) => nextSlice > slice
    )

    // then
    expect(store.listeners).toHaveLength(1)

    // when
    state.increase()

    // then
    expect(logger).toHaveBeenCalled()

    // when
    state.decrease()

    // then
    expect(logger).toHaveBeenCalledTimes(1)
  })

  it('should replace state', () => {
    // given
    type State = {
      counter: number
      increase?: () => void
    }
    const store = createStore<State>((set) => ({
      counter: 0,
      increase: () => set((prevState) => ({ counter: prevState.counter + 1 })),
    }))

    // when
    store.setState(
      (prevState) => ({
        counter: prevState.counter,
      }),
      true
    )

    // then
    expect(store.state).toEqual({ counter: 0 })
  })
})
