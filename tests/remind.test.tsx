import { render, fireEvent, waitFor } from '@testing-library/react'
import { wait } from './tests.utils'

import remind from '../src/remind'
import { useDidMount } from '../src/hooks/hooks'

describe('remind', () => {
  it('should rerender component', () => {
    // arrange
    const { useRemind } = remind({ counter: 0 }, (set) => ({
      increase: () => {
        set((mind) => ({ counter: mind.counter + 1 }))
      },
    }))
    const Counter = () => {
      const { mind } = useRemind()

      useDidMount(() => {
        mind.increase()
      })

      return (
        <div>
          <p>counter: {mind.counter}</p>
          <button onClick={mind.increase}>increase</button>
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
    const { useRemind } = remind({ counter: 0 }, (set) => ({}))
    const Counter = () => {
      const { setMind } = useRemind()

      spy()

      useDidMount(() => {
        setMind((mind) => mind)
      })

      return null
    }
    render(<Counter />)

    // assert
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should not rerender component when scope state is the same', async () => {
    // arrange
    const { useRemind } = remind(
      {
        counter: 0,
        darkMode: false,
      },
      () => ({})
    )
    const Counter = () => {
      const [mind, setMind] = useRemind((mind) => mind.darkMode)

      useDidMount(() => {
        setMind((mind) => ({
          counter: mind.counter + 1,
        }))
      })

      return <p>counter {mind.counter}</p>
    }

    const { findByText } = render(<Counter />)

    // assert
    await findByText('counter 0')
  })

  it('should not rerender component when scope state is not the same', async () => {
    // arrange
    const { useRemind } = remind(
      {
        counter: 0,
        darkMode: false,
      },
      () => ({})
    )
    const Counter = () => {
      const [mind, setMind] = useRemind((mind) => mind.counter)

      useDidMount(() => {
        setMind((mind) => ({
          counter: mind.counter + 1,
        }))
      })

      return <p>counter {mind.counter}</p>
    }

    const { findByText } = render(<Counter />)

    // assert
    await findByText('counter 1')
  })

  it('should rerender component when scope state is not the same after setState action from beyond component', () => {
    // given
    const { useRemind, setMind } = remind(
      {
        counter: 0,
        darkMode: false,
      },
      () => ({})
    )
    const spy = jest.fn()
    const Counter = () => {
      const [mind] = useRemind((mind) => mind.counter)

      spy()

      return <p>counter {mind.counter}</p>
    }

    render(<Counter />)

    // when
    setMind((mind) => mind)

    // then
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should unsubscribe after unmount', () => {
    // given
    const { useRemind } = remind({ isUnmount: false, counter: 0 }, (set) => ({
      unmount: () => {
        set({ isUnmount: true })
      },
      increase: () => {
        set((mind) => ({ counter: mind.counter + 1 }))
      },
    }))
    const spy1 = jest.fn()
    const spy2 = jest.fn()
    const Root = {
      Parent() {
        const { mind } = useRemind()

        return (
          <>
            <Root.Child spy={spy1} />
            {mind.isUnmount && <Root.Child spy={spy2} />}
            <button onClick={mind.unmount}>unmount</button>
            <button onClick={mind.increase}>increase</button>
          </>
        )
      },
      Child({ spy }) {
        useRemind()

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
    expect(spy2).toHaveBeenCalledTimes(1)
  })

  it('should update async action status', () => {
    // given
    const { useRemind } = remind({ counter: 0 }, (set) => ({
      increase: async () => {
        await wait(1000)

        set((mind) => ({ counter: mind.counter + 1 }))
      },
    }))
    const spy = jest.fn()
    const Counter = () => {
      const { mind } = useRemind()
      const [increase, status] = mind.increase

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
    const { useRemind } = remind({ counter: 0 }, (set) => ({
      increase: () => {
        set((mind) => ({ counter: mind.counter + 1 }))
      },
    }))
    const spy = jest.fn()
    const Counter = () => {
      const { mind, unsubscribe } = useRemind()

      useDidMount(() => {
        unsubscribe()
      })

      spy('rerender')

      return <button onClick={mind.increase}>increase</button>
    }
    const { getByText } = render(<Counter />)

    // when
    fireEvent.click(getByText('increase'))

    // when
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should return true when counter value is divisible', () => {
    // given
    const { useRemind } = remind({ counter: 0 }, (set, get) => ({
      increase: () => set((prevMind) => ({ counter: prevMind.counter + 1 })),
      isDivisible: () => get().counter % 2 === 0,
    }))

    const Counter = () => {
      const { mind } = useRemind()

      return (
        <div>
          <p>is divisible: {mind.isDivisible().toString()}</p>
          <p>counter {mind.counter}</p>
          <button onClick={mind.increase}>increase</button>
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
    const { useRemind } = remind({ counter: 0 }, (set) => ({
      increase: () => set((prevMind) => ({ counter: prevMind.counter + 1 })),
      decrease: () => set((prevMind) => ({ counter: prevMind.counter - 1 })),
    }))

    const Counter = () => {
      const { mind } = useRemind((mind) => mind.counter, {
        equality: (slice, nextSlice) => nextSlice > slice,
      })

      return (
        <div>
          <p>counter {mind.counter}</p>
          <button onClick={mind.increase}>increase</button>
          <button onClick={mind.decrease}>decrease</button>
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
    const store = remind({ counter: 0 }, () => ({}))
    const { useRemind } = store

    const Counter = () => {
      const { mind, setMind } = useRemind()

      const block = () => {
        setMind({}, { replace: true })
      }

      if ('counter' in mind) {
        return (
          <div>
            <p>counter: {mind.counter}</p>
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
    const { useRemind } = remind({ counter: 0 }, (set) => ({
      increase: async () => {
        await wait(1000)

        set((mind) => ({ counter: mind.counter + 1 }))
      },
    }))
    const spy = jest.fn()
    const Counter = () => {
      const { mind } = useRemind()
      const [_, status] = mind.increase

      spy(status)

      return null
    }
    render(<Counter />)

    // assert
    expect(spy).toHaveBeenCalledWith('idle')
  })

  it('should immer work with setState action', () => {
    // given
    const { useRemind } = remind(
      {
        counter: 0,
      },
      () => ({})
    )
    const Counter = () => {
      const { mind, setMind } = useRemind()

      const increase = () => {
        setMind((prevMind) => {
          prevMind.counter++
        })
      }

      return (
        <div>
          <p>counter: {mind.counter}</p>
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
    const { useRemind, setMind } = remind(
      {
        counter: 0,
      },
      () => ({})
    )
    const Counter = () => {
      const { mind } = useRemind()

      return (
        <div>
          <p>counter: {mind.counter}</p>
        </div>
      )
    }
    const { getByText } = render(<Counter />)

    // when
    setMind((prevMind) => {
      prevMind.counter++
    })

    // then
    getByText('counter: 1')
  })

  it('should not rerender component when emitt option in config is falsy', () => {
    // given
    const { useRemind } = remind(
      {
        counter: 0,
      },
      (set) => ({
        increase: () => {
          set((prevMind) => ({ counter: prevMind.counter + 1 }), {
            emitt: false,
          })
        },
      })
    )
    const Counter = () => {
      const { mind } = useRemind()

      return (
        <div>
          <p>counter: {mind.counter}</p>
          <button onClick={mind.increase}>increase</button>
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
