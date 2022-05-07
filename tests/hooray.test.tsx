import { render, fireEvent, act } from '@testing-library/react'
import { wait } from './tests.utils'

import hooray from '../src/hooray'
import { useMount } from '../src/hooks/hooks'

describe('hooray', () => {
  it('should resolve plain action', () => {
    // arrange
    const { useHooray } = hooray(
      { counter: 0 },
      {
        increase: () => {
          return { counter: 1 }
        },
      }
    )
    const spy = jest.fn()
    const Counter = () => {
      const { state } = useHooray()

      useMount(() => {
        spy(state.increase())
      })

      return null
    }
    render(<Counter />)

    // assert
    expect(spy).toHaveBeenCalledWith({ counter: 1 })
  })

  it('should rerender component', () => {
    // arrange
    const { useHooray } = hooray({ counter: 0 }, (set) => ({
      increase: () => {
        set((state) => ({ counter: state.counter + 1 }))
      },
    }))
    const Counter = () => {
      const { state } = useHooray()

      useMount(() => {
        state.increase()
      })

      return (
        <div>
          <p>counter: {state.counter}</p>
          <button onClick={state.increase}>increase</button>
        </div>
      )
    }
    const { getByText } = render(<Counter />)

    // assert
    getByText('counter: 1')
  })

  it('should not rerender component when state is not changed', () => {
    // arrange
    const spy = jest.fn()
    const { useHooray } = hooray({ counter: 0 }, (set) => ({}))
    const Counter = () => {
      const { setState } = useHooray()

      spy()

      useMount(() => {
        setState((state) => state)
      })

      return null
    }
    render(<Counter />)

    // assert
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should not rerender component when scope state is the same', async () => {
    // arrange
    const { useHooray } = hooray(
      {
        counter: 0,
        darkMode: false,
      },
      () => ({})
    )
    const Counter = () => {
      const [state, setState] = useHooray((state) => state.darkMode)

      useMount(() => {
        setState((state) => ({
          counter: state.counter + 1,
        }))
      })

      return <p>counter {state.counter}</p>
    }

    const { findByText } = render(<Counter />)

    // assert
    await findByText('counter 0')
  })

  it('should not rerender component when scope state is not the same', async () => {
    // arrange
    const { useHooray } = hooray(
      {
        counter: 0,
        darkMode: false,
      },
      () => ({})
    )
    const Counter = () => {
      const [state, setState] = useHooray((state) => state.counter)

      useMount(() => {
        setState((state) => ({
          counter: state.counter + 1,
        }))
      })

      return <p>counter {state.counter}</p>
    }

    const { findByText } = render(<Counter />)

    // assert
    await findByText('counter 1')
  })

  it('should rerender component when scope state is not the same after setState action from beyond component', () => {
    // given
    const { useHooray, setState } = hooray(
      {
        counter: 0,
        darkMode: false,
      },
      () => ({})
    )
    const spy = jest.fn()
    const Counter = () => {
      const [state] = useHooray((state) => state.counter)

      spy()

      return <p>counter {state.counter}</p>
    }

    render(<Counter />)

    // when
    setState((state) => state)

    // then
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should unsubscribe after unmount', () => {
    // given
    const { useHooray } = hooray({ isUnmount: false, counter: 0 }, (set) => ({
      unmount: () => {
        set({ isUnmount: true })
      },
      increase: () => {
        set((state) => ({ counter: state.counter + 1 }))
      },
    }))
    const spy1 = jest.fn()
    const spy2 = jest.fn()
    const Root = {
      Parent() {
        const { state } = useHooray()

        return (
          <>
            <Root.Child spy={spy1} />
            {state.isUnmount && <Root.Child spy={spy2} />}
            <button onClick={state.unmount}>unmount</button>
            <button onClick={state.increase}>increase</button>
          </>
        )
      },
      Child({ spy }) {
        useHooray()

        spy()

        return null
      },
    }
    const { getByText } = render(<Root.Parent />)

    // when
    fireEvent.click(getByText('unmount'))
    fireEvent.click(getByText('increase'))

    // then
    expect(spy1).toHaveBeenCalledTimes(3)
    expect(spy2).toHaveBeenCalledTimes(2)
  })

  it('should update async action status', () => {
    // given
    const { useHooray } = hooray({ counter: 0 }, (set) => ({
      increase: async () => {
        await wait(1000)

        set((state) => ({ counter: state.counter + 1 }))
      },
    }))
    const spy = jest.fn()
    const Counter = () => {
      const { state } = useHooray()
      const [increase, status] = state.increase

      spy(status)

      return <button onClick={increase}>increase</button>
    }
    const { getByText } = render(<Counter />)

    // when
    fireEvent.click(getByText('increase'))

    // when
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('should remove listener after unsubscribe', () => {
    // given
    const { useHooray } = hooray({ counter: 0 }, (set) => ({
      increase: () => {
        set((state) => ({ counter: state.counter + 1 }))
      },
    }))
    const spy = jest.fn()
    const Counter = () => {
      const { state, unsubscribe } = useHooray()

      useMount(() => {
        unsubscribe()
      })

      spy('rerender')

      return <button onClick={state.increase}>increase</button>
    }
    const { getByText } = render(<Counter />)

    // when
    fireEvent.click(getByText('increase'))

    // when
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should return true when counter value is divisible', () => {
    // given
    const { useHooray } = hooray({ counter: 0 }, (set, get) => ({
      increase: () => set((state) => ({ counter: state.counter + 1 })),
      isDivisible: () => get().counter % 2 === 0,
    }))

    const Counter = () => {
      const { state } = useHooray()

      return (
        <div>
          <p>is divisible: {state.isDivisible().toString()}</p>
          <p>counter {state.counter}</p>
          <button onClick={state.increase}>increase</button>
        </div>
      )
    }

    const { getByText } = render(<Counter />)

    // when
    fireEvent.click(getByText('increase'))
    fireEvent.click(getByText('increase'))

    // then
    getByText('is divisible: true')
  })

  it('should rerender component when next value is bigger', () => {
    // given
    const { useHooray } = hooray({ counter: 0 }, (set) => ({
      increase: () => set((state) => ({ counter: state.counter + 1 })),
      decrease: () => set((state) => ({ counter: state.counter - 1 })),
    }))

    const Counter = () => {
      const { state } = useHooray((state) => state.counter, {
        equality: (slice, nextSlice) => nextSlice > slice,
      })

      return (
        <div>
          <p>counter {state.counter}</p>
          <button onClick={state.increase}>increase</button>
          <button onClick={state.decrease}>decrease</button>
        </div>
      )
    }

    const { getByText } = render(<Counter />)

    // when
    fireEvent.click(getByText('increase'))

    // then
    getByText('counter 1')

    // when
    fireEvent.click(getByText('decrease'))

    // then
    getByText('counter 1')
  })

  it('should replace state without rerender', () => {
    // given
    const { useHooray } = hooray({ counter: 0 }, () => ({}))

    const Counter = () => {
      const { state, setState } = useHooray()

      const block = () => {
        setState({}, { replace: true })
      }

      if ('counter' in state) {
        return (
          <div>
            <p>counter: {state.counter}</p>
            <button onClick={block}>block</button>
          </div>
        )
      }

      return <p>status: block</p>
    }

    const { getByText } = render(<Counter />)

    // when
    fireEvent.click(getByText('block'))

    // then
    getByText('status: block')
  })

  it('should generare status for async action', () => {
    // arrange
    const { useHooray } = hooray({ counter: 0 }, (set) => ({
      increase: async () => {
        await wait(1000)

        set((state) => ({ counter: state.counter + 1 }))
      },
    }))
    const spy = jest.fn()
    const Counter = () => {
      const { state } = useHooray()
      const [_, status] = state.increase

      spy(status)

      return null
    }
    render(<Counter />)

    // assert
    expect(spy).toHaveBeenCalledWith('idle')
  })

  it('should immer work with setState action', () => {
    // given
    const { useHooray } = hooray(
      {
        counter: 0,
      },
      () => ({})
    )
    const Counter = () => {
      const { state, setState } = useHooray()

      const increase = () => {
        setState((state) => {
          state.counter++
        })
      }

      return (
        <div>
          <p>counter: {state.counter}</p>
          <button onClick={increase}>increase</button>
        </div>
      )
    }
    const { getByText } = render(<Counter />)

    // when
    fireEvent.click(getByText('increase'))

    // then
    getByText('counter: 1')
  })

  it('should immer work with setState action from beyond component', () => {
    // given
    const { useHooray, setState } = hooray(
      {
        counter: 0,
      },
      () => ({})
    )
    const Counter = () => {
      const { state } = useHooray()

      return (
        <div>
          <p>counter: {state.counter}</p>
        </div>
      )
    }
    const { getByText } = render(<Counter />)

    // when
    act(() => {
      setState((state) => {
        state.counter++
      })
    })

    // then
    getByText('counter: 1')
  })

  it('should not rerender component when emitt option in config is falsy', () => {
    // given
    const { useHooray } = hooray(
      {
        counter: 0,
      },
      (set) => ({
        increase: () => {
          set((state) => ({ counter: state.counter + 1 }), {
            emitt: false,
          })
        },
      })
    )
    const Counter = () => {
      const { state } = useHooray()

      return (
        <div>
          <p>counter: {state.counter}</p>
          <button onClick={state.increase}>increase</button>
        </div>
      )
    }
    const { getByText } = render(<Counter />)

    // when
    fireEvent.click(getByText('increase'))

    // then
    getByText('counter: 0')
  })
})
