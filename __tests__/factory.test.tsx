import { render, fireEvent, act } from '@testing-library/react'

import { factory as fork } from '../src/factory'
import { useMount } from '../src/hooks/hooks'

import type { PlainFunction } from '../src/types/types'

describe('fork', () => {
  it('should resolve plain action', () => {
    // arrange
    const { ForkProvider, useFork } = fork(
      { counter: 0 },
      {
        increase: () => {
          return { counter: 1 }
        },
      }
    )
    const spy = jest.fn()
    const Counter = () => {
      const { state } = useFork()

      useMount(() => {
        spy(state.increase())
      })

      return null
    }
    render(
      <ForkProvider>
        <Counter />
      </ForkProvider>
    )

    // assert
    expect(spy).toHaveBeenCalledWith({ counter: 1 })
  })

  it('should rerender component', () => {
    // arrange
    const { ForkProvider, useFork } = fork({ counter: 0 }, (set) => ({
      increase: () => {
        set((state) => ({ counter: state.counter + 1 }))
      },
    }))
    const Counter = () => {
      const { state } = useFork()

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
    const { getByText } = render(
      <ForkProvider>
        <Counter />
      </ForkProvider>
    )

    // assert
    getByText('counter: 1')
  })

  it('should not rerender component when state is not changed', () => {
    // arrange
    const spy = jest.fn()
    const { ForkProvider, useFork } = fork({ counter: 0 }, () => ({}))
    const Counter = () => {
      const { setState } = useFork()

      spy()

      useMount(() => {
        setState((state) => state)
      })

      return null
    }
    render(
      <ForkProvider>
        <Counter />
      </ForkProvider>
    )

    // assert
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should not rerender component when scope state is the same', async () => {
    // arrange
    const { ForkProvider, useFork } = fork(
      {
        counter: 0,
        darkMode: false,
      },
      () => ({})
    )
    const Counter = () => {
      const { state, setState } = useFork((state) => state.darkMode)

      useMount(() => {
        setState((state) => ({
          counter: state.counter + 1,
        }))
      })

      return <p>counter {state.counter}</p>
    }

    const { findByText } = render(
      <ForkProvider>
        <Counter />
      </ForkProvider>
    )

    // assert
    await findByText('counter 0')
  })

  it('should not rerender component when scope state is not the same', async () => {
    // arrange
    const { ForkProvider, useFork } = fork(
      {
        counter: 0,
        darkMode: false,
      },
      () => ({})
    )
    const Counter = () => {
      const { state, setState } = useFork((state) => state.counter)

      useMount(() => {
        setState((state) => ({
          counter: state.counter + 1,
        }))
      })

      return <p>counter {state.counter}</p>
    }

    const { findByText } = render(
      <ForkProvider>
        <Counter />
      </ForkProvider>
    )

    // assert
    await findByText('counter 1')
  })

  it('should rerender component when scope state is not the same after setState action from beyond component', () => {
    // given
    const { ForkProvider, useFork, setState } = fork(
      {
        counter: 0,
        darkMode: false,
      },
      () => ({})
    )
    const spy = jest.fn()
    const Counter = () => {
      const { state } = useFork((state) => state.counter)

      spy()

      return <p>counter {state.counter}</p>
    }

    render(
      <ForkProvider>
        <Counter />
      </ForkProvider>
    )

    // when
    setState((state) => state)

    // then
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should unsubscribe after unmount', () => {
    // given
    const { ForkProvider, useFork } = fork(
      { isUnmount: false, counter: 0 },
      (set) => ({
        unmount: () => {
          set({ isUnmount: true })
        },
        increase: () => {
          set((state) => ({ counter: state.counter + 1 }))
        },
      })
    )
    const spy1 = jest.fn()
    const spy2 = jest.fn()
    const Root = {
      Parent() {
        const { state } = useFork()

        return (
          <>
            <Root.Child spy={spy1} />
            {state.isUnmount && <Root.Child spy={spy2} />}
            <button onClick={state.unmount}>unmount</button>
            <button onClick={state.increase}>increase</button>
          </>
        )
      },
      Child({ spy }: { readonly spy: PlainFunction }) {
        useFork()

        spy()

        return null
      },
    }
    const { getByText } = render(
      <ForkProvider>
        <Root.Parent />
      </ForkProvider>
    )

    // when
    fireEvent.click(getByText('unmount'))
    fireEvent.click(getByText('increase'))

    // then
    expect(spy1).toHaveBeenCalledTimes(3)
    expect(spy2).toHaveBeenCalledTimes(2)
  })

  it('should return true when counter value is divisible', () => {
    // given
    const { ForkProvider, useFork } = fork({ counter: 0 }, (set, get) => ({
      increase: () => set((state) => ({ counter: state.counter + 1 })),
      isDivisible: () => get().counter % 2 === 0,
    }))

    const Counter = () => {
      const { state } = useFork()

      return (
        <div>
          <p>is divisible: {state.isDivisible().toString()}</p>
          <p>counter {state.counter}</p>
          <button onClick={state.increase}>increase</button>
        </div>
      )
    }

    const { getByText } = render(
      <ForkProvider>
        <Counter />
      </ForkProvider>
    )

    // when
    fireEvent.click(getByText('increase'))
    fireEvent.click(getByText('increase'))

    // then
    getByText('is divisible: true')
  })

  it('should rerender component when next value is bigger', () => {
    // given
    const { ForkProvider, useFork } = fork({ counter: 0 }, (set) => ({
      increase: () => set((state) => ({ counter: state.counter + 1 })),
      decrease: () => set((state) => ({ counter: state.counter - 1 })),
    }))

    const Counter = () => {
      const { state } = useFork((state) => state.counter, {
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

    const { getByText } = render(
      <ForkProvider>
        <Counter />
      </ForkProvider>
    )

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
    const { ForkProvider, useFork } = fork({ counter: 0 }, () => ({}))

    const Counter = () => {
      const { state, setState } = useFork()

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

    const { getByText } = render(
      <ForkProvider>
        <Counter />
      </ForkProvider>
    )

    // when
    fireEvent.click(getByText('block'))

    // then
    getByText('status: block')
  })

  it('should immer work with setState action', () => {
    // given
    const { ForkProvider, useFork } = fork(
      {
        counter: 0,
      },
      () => ({})
    )
    const Counter = () => {
      const { state, setState } = useFork()

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
    const { getByText } = render(
      <ForkProvider>
        <Counter />
      </ForkProvider>
    )

    // when
    fireEvent.click(getByText('increase'))

    // then
    getByText('counter: 1')
  })

  it('should immer work with setState action from beyond component', () => {
    // given
    const { ForkProvider, useFork, setState } = fork(
      {
        counter: 0,
      },
      () => ({})
    )
    const Counter = () => {
      const { state } = useFork()

      return (
        <div>
          <p>counter: {state.counter}</p>
        </div>
      )
    }
    const { getByText } = render(
      <ForkProvider>
        <Counter />
      </ForkProvider>
    )

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
    const { ForkProvider, useFork } = fork(
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
      const { state } = useFork()

      return (
        <div>
          <p>counter: {state.counter}</p>
          <button onClick={state.increase}>increase</button>
        </div>
      )
    }
    const { getByText } = render(
      <ForkProvider>
        <Counter />
      </ForkProvider>
    )

    // when
    fireEvent.click(getByText('increase'))

    // then
    getByText('counter: 0')
  })

  it('should observe state on change', () => {
    // given
    const { ForkProvider, useFork } = fork({
      counter: 0,
    })
    const Counter = () => {
      const { state } = useFork((state) => state, {
        observe: true,
      })

      const increase = () => {
        state.counter++
      }

      return (
        <div>
          <p>counter: {state.counter}</p>
          <button onClick={increase}>increase</button>
        </div>
      )
    }
    const { getByText } = render(
      <ForkProvider>
        <Counter />
      </ForkProvider>
    )

    // when
    fireEvent.click(getByText('increase'))

    // then
    getByText('counter: 1')
  })

  it('it should overwrite user', () => {
    // given
    type User = {
      readonly name: string
      readonly age: number
    }

    const { ForkProvider, useFork } = fork(
      { user: null as User | null },
      (set) => ({
        fetchUser: () => {
          set({ user: { name: 'John', age: 15 } })
        },
      }),
      {
        context: {
          isValidUser: (user: User | null) => (user ? user.age < 18 : false),
        },
        resolver: (state, context) => {
          return {
            state: { user: null },
            errors: {
              user: context.isValidUser(state.user)
                ? { type: 'age error', message: 'too young' }
                : null,
            },
          }
        },
      }
    )
    const UserInterface = () => {
      const { state } = useFork()

      return (
        <div>
          {state.user ? state.user.name : 'guest'}
          <button onClick={state.fetchUser}>fetch user</button>
        </div>
      )
    }
    const { getByText } = render(
      <ForkProvider>
        <UserInterface />
      </ForkProvider>
    )

    // when
    fireEvent.click(getByText('fetch user'))

    // then
    getByText('guest')
  })
})
