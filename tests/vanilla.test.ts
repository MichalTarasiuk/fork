import { create } from 'src/remind'

describe('vanilla', () => {
  it('should subscriber invoke after state change', () => {
    // given
    const store = create({
      counter: 0,
    })
    const state = store.getState
    const spy = jest.fn()

    // when
    store.subscribe(spy)

    // then
    expect(store.listeners).toHaveLength(1)

    // when
    const ingredient = 1
    const oldState = { ...state }
    store.setState((prevState) => ({
      counter: prevState.counter + ingredient,
    }))

    // then
    expect(state.counter).toBe(oldState.counter + ingredient)
  })

  it('should not invoke subscriber which has selector', () => {
    // given
    const store = create({
      counter: 0,
      darkMode: false,
    })
    const state = store.getState
    const spy = jest.fn()

    // when
    store.subscribe(spy, (state) => state.darkMode)

    // then
    expect(store.listeners).toHaveLength(1)

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
    const store = create({
      counter: 0,
      darkMode: false,
    })
    const state = store.getState
    const spy = jest.fn()

    // when
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

  it('should unsubscribe all listener before notify', () => {
    // given
    const store = create({
      darkMode: false,
    })
    const state = store.getState
    const spy = jest.fn()

    // when
    store.subscribe(spy)

    // then
    expect(store.listeners).toHaveLength(1)

    // when
    store.destroy()

    // then
    expect(store.listeners).toHaveLength(0)

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
    const store = create({
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
    expect(store.listeners).toHaveLength(2)

    // when
    dorkModeListener.unsubscribe()

    // then
    expect(store.listeners).toHaveLength(1)
  })

  it('should resolve initial state', () => {
    // arrange
    const initialState = {
      counter: 0,
    }
    const store = create(() => initialState)

    // assert
    expect(store.getState).toEqual(initialState)
  })

  it('should subscriber invoke after state change by inner setState', () => {
    // given
    type State = { counter: number; setCounter: Noop }
    const ingredient = 1
    const store = create<State>((set) => ({
      counter: 0,
      setCounter: () =>
        set((prevState) => ({ counter: prevState.counter + ingredient })),
    }))
    const state = store.getState
    const spy = jest.fn()

    // when
    const prevState = { ...state }
    store.subscribe(spy, (state) => state.counter)

    // then
    expect(store.listeners).toHaveLength(1)

    // when
    state.setCounter()

    // then
    expect(state.counter).toBe(prevState.counter + ingredient)
    expect(spy).toHaveBeenCalled()
  })

  it('should change the selected value of the object while not modifying the others', () => {
    // given
    const store = create({
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
    expect(store.getState).toEqual({
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
      setCounter: Noop
    }
    const ingredient = 1
    const store = create<State>((set) => ({
      counter: 0,
      setCounter: () =>
        set((prevState) => ({
          counter: prevState.counter + ingredient,
        })),
    }))

    // when
    const oldState = { ...store.getState }
    store.getState.setCounter()

    // then
    expect(store.getState.counter).toEqual(oldState.counter + ingredient)

    // when
    store.reset()

    // then
    expect(store.getState.counter).toEqual(oldState.counter)
  })
})
