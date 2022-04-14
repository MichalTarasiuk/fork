import { createStore } from '../src/store'
import { wait } from './tests.utils'
import type { Noop } from './test.types'

describe('store', () => {
  it('should resolve initial state', () => {
    // arrange
    const initialState = {
      counter: 0,
    }
    const store = createStore(() => initialState)

    // assert
    expect(store.state).toEqual(initialState)
  })

  it('should set state after set state action', () => {
    // given
    const initialState = {
      counter: 0,
    }
    const store = createStore(() => initialState)

    // when
    store.setState({
      counter: 1,
    })

    // then
    expect(store.state).toEqual({
      counter: 1,
    })
  })

  it('should set state after inner set state action', () => {
    // arrange
    type State = {
      counter: number
      increase: Noop
    }
    const store = createStore<State>((set) => ({
      counter: 0,
      increase: () => set((prevState) => ({ counter: prevState.counter + 1 })),
    }))

    // act
    store.state.increase()

    // assert
    expect(store.state.counter).toEqual(1)
  })

  it('should invoke subscriber after set state action', () => {
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

  it('should not invoke subscriber which has selector after set state action', () => {
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
    store.setState((prevState) => ({
      counter: prevState.counter + 1,
    }))

    // then
    expect(state.counter).toBe(1)
    expect(spy).not.toHaveBeenCalled()
  })

  it('should invoke subscriber which has selector after set state action', () => {
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

    // when
    const darkModeSpy = jest.fn()
    const counterSpy = jest.fn()

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

  it('should invoke subscriber after state change by inner setState', () => {
    // given
    type State = { counter: number; increase: Noop }
    const store = createStore<State>((set) => ({
      counter: 0,
      increase: () => set((prevState) => ({ counter: prevState.counter + 1 })),
    }))
    const state = store.state

    // when
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
    state.increase()

    // then
    expect(state.counter).toEqual(1)

    // when
    store.reset()

    // then
    expect(store.state)
  })

  it('should not invoke subscriber when state after setState action is the same', () => {
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

  it('should return true when counter is divisible', async () => {
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

  it('should invoke subscriber when next counter value is bigger', () => {
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
    const spy = jest.fn()
    store.subscribe(
      spy,
      (state) => state.counter,
      (nextSlice, slice) => nextSlice > slice
    )

    // then
    expect(store.listeners).toHaveLength(1)

    // when
    state.increase()

    // then
    expect(spy).toHaveBeenCalled()

    // when
    state.decrease()

    // then
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should replace state after set state action with replace option', () => {
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

  it('should invoke onMount lifecycle on create store', () => {
    // arrange
    const onMount = jest.fn()
    const store = createStore(
      {
        counter: 0,
      },
      { onMount, onUpdate() {} }
    )

    // assert
    expect(onMount).toHaveBeenCalled()
    expect(onMount).toHaveBeenCalledWith(store.state)
  })

  it('should replace state on mount', () => {
    // arrange
    const onMount = jest.fn().mockImplementation(() => ({ counter: 1 }))
    const store = createStore(
      {
        counter: 0,
      },
      { onMount, onUpdate() {} }
    )

    // assert
    expect(store.state).toEqual({ counter: 1 })
    expect(onMount).toHaveBeenCalled()
  })

  it('should invoke onUpdate lifecycle after set state action', () => {
    // given
    const onUpdate = jest.fn()
    const store = createStore(
      {
        counter: 0,
      },
      {
        onMount(state) {
          return state
        },
        onUpdate,
      }
    )

    // when
    store.setState((prevState) => ({ counter: prevState.counter + 1 }))

    // then
    expect(onUpdate).toHaveBeenCalled()
    expect(onUpdate).toHaveBeenCalledWith(store.state)
  })

  it('should state have the smae refference after set state action', () => {
    // given
    const store = createStore({
      counter: 0,
    })

    // when
    store.setState((prevState) => ({ counter: prevState.counter + 1 }))

    // then
    expect(store.state).toBe(store.state)
  })

  it('should set state action work with immer', () => {
    // given
    const store = createStore({
      counter: 0,
    })

    // when
    store.setState((prevState) => {
      prevState.counter++
    })

    // then
    expect(store.state).toEqual({ counter: 1 })
  })
})
