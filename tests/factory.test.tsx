import { useState } from 'react'
import { render, fireEvent, act } from '@testing-library/react'

import { useDidMount } from '../src/hooks'
import remind from '../src/remind'
import { random, wait } from './test.utils'
import type { Noop } from './test.types'

describe('factory', () => {
  it('should rerender component', async () => {
    // arrange
    type State = {
      counter: number
      increase: Noop
    }
    const { useRemind } = remind<State>((set) => ({
      counter: 0,
      increase: () => set((prevState) => ({ counter: prevState.counter + 1 })),
    }))

    const Counter = () => {
      const [{ counter, increase }] = useRemind()

      useDidMount(() => {
        increase()
      })

      return <p>counter {counter}</p>
    }

    const { findByText } = render(<Counter />)

    // assert
    await findByText('counter 1')
  })

  it('should not rerender component when use selector', async () => {
    // arrange
    const { useRemind } = remind({
      counter: 0,
      darkMode: false,
    })

    const Counter = () => {
      const [mind, setMind] = useRemind((state) => state.darkMode)

      useDidMount(() => {
        setMind((prevState) => ({
          counter: prevState.counter + 1,
        }))
      })

      return <p>counter {mind.counter}</p>
    }

    const { findByText } = render(<Counter />)

    // asserts
    await findByText('counter 0')
  })

  it('should not rerender component when use deep selector', () => {
    // given
    const initialName = 'you can count, count on yourself'
    const additionalNames = [
      'keep counting!!!',
      "you're doing better and better",
    ]
    const { useRemind, get } = remind({
      counter: {
        name: initialName,
        value: 0,
      },
      dakrMode: false,
    })
    get.state.counter.name

    const Component = () => {
      const [mind, setMind] = useRemind((state) => state.counter.name)

      const increase = () => {
        setMind((prevState) => ({
          counter: {
            value: prevState.counter.value + 1,
          },
        }))
      }

      const changeName = (newName: string) => {
        setMind({
          counter: {
            name: newName,
          },
        })
      }

      return (
        <div>
          <p>name {mind.counter.name}</p>
          <button onClick={() => changeName(random(additionalNames))}>
            change name
          </button>
          <p>counter {mind.counter.value}</p>
          <button onClick={increase}>increse</button>
        </div>
      )
    }

    const { getByText } = render(<Component />)

    // when
    fireEvent.click(getByText('increse'))

    // then
    getByText('counter 0')

    // when
    const nameElement = getByText(`name ${initialName}`)
    fireEvent.click(getByText('change name'))

    // then
    expect(nameElement.nodeValue).not.toBe(initialName)
  })

  it('should remove listener from component which is not mounted', () => {
    // given
    const store = remind({
      counter: 0,
    })
    const { useRemind } = store

    const Root = {
      Parent() {
        const [isMounted, setIsMounted] = useState(true)

        const unmount = () => setIsMounted(false)

        return (
          <>
            {isMounted && <Root.Child1 />}
            <Root.Child2 />
            <button onClick={unmount}>unmount child 1</button>
          </>
        )
      },
      Child1() {
        const [mind] = useRemind()

        return (
          <div>
            <p>component: Child1</p>
            <p>counter {mind.counter}</p>
          </div>
        )
      },
      Child2() {
        const [mind] = useRemind()

        return (
          <div>
            <p>component: Child2</p>
            <p>counter {mind.counter}</p>
          </div>
        )
      },
    }

    const { getByText } = render(<Root.Parent />)

    // when
    fireEvent.click(getByText('unmount child 1'))

    // then
    expect(store.get.listeners).toHaveLength(1)
  })

  it('should remove listeners and back to initial state', async () => {
    // given
    type State = {
      counter: any
      increase: Noop
    }
    const store = remind<State>((set) => ({
      counter: 0,
      increase: () => set((prevState) => ({ counter: prevState.counter + 1 })),
    }))
    const { useRemind } = store

    const Counter = () => {
      const [{ counter, increase }] = useRemind()

      return (
        <div>
          <p>counter {counter}</p>
          <button onClick={increase}>increase</button>
        </div>
      )
    }
    const { getByText, findByText } = render(<Counter />)

    // when
    act(() => {
      fireEvent.click(getByText('increase'))
    })

    // then
    await findByText('counter 1')

    // when
    act(() => {
      store.destroy()
    })

    // then
    expect(store.get.state.counter).toBe(0)
    expect(store.get.listeners).toHaveLength(0)
  })

  it('subscriber with selector should not rerender after invoke setState function outside component', async () => {
    // given
    const store = remind({
      counter: 0,
      darkMode: false,
    })
    const { useRemind, setState } = store

    const Counter = () => {
      const { mind } = useRemind((state) => state.darkMode)

      return <p>counter {mind.counter}</p>
    }

    const { findByText } = render(<Counter />)

    // when
    setState((prevState) => ({
      counter: prevState.counter + 1,
    }))

    // then
    await findByText('counter 0')
  })

  it('subscriber should rerender after invoke setState function outside component', async () => {
    // given
    const store = remind({
      counter: 0,
      darkMode: false,
    })
    const { useRemind, setState } = store

    const Counter = () => {
      const [mind] = useRemind()

      return <p>counter {mind.counter}</p>
    }

    const { findByText } = render(<Counter />)

    // when
    act(() => {
      setState((prevState) => ({
        counter: prevState.counter + 1,
      }))
    })

    // then
    await findByText('counter 1')
  })

  it('should resolve middleware', async () => {
    // arrange
    const { useRemind } = remind<any>({
      counter: (value = 0) => {
        return { next: false, value }
      },
    })

    const Counter = () => {
      const [{ counter }] = useRemind()

      return <p>counter {counter}</p>
    }

    const { findByText } = render(<Counter />)

    // assert
    await findByText('counter 0')
  })

  it('middleware should block setState action', async () => {
    // given
    type State = {
      counter: any
      increase: Noop
    }
    const { useRemind } = remind<State>((set) => ({
      counter: (value = 0) => {
        return { next: false, value }
      },
      increase: () => set((prevState) => ({ counter: prevState.counter + 1 })),
    }))

    const Counter = () => {
      const [{ counter, increase }] = useRemind()

      return (
        <div>
          <p>counter {counter}</p>
          <button onClick={increase}>increase</button>
        </div>
      )
    }

    const { getByText, findByText } = render(<Counter />)

    // when
    fireEvent.click(getByText('increase'))

    // then
    await findByText('counter 0')
  })

  it('middleware should not block setState action', async () => {
    // given
    type State = {
      counter: any
      increase: Noop
    }
    const { useRemind } = remind<State>((set) => ({
      counter: (value = 0) => {
        return { next: true, value }
      },
      increase: () => set((prevState) => ({ counter: prevState.counter + 1 })),
    }))

    const Counter = () => {
      const [{ counter, increase }] = useRemind()

      return (
        <div>
          <p>counter {counter}</p>
          <button onClick={increase}>increase</button>
        </div>
      )
    }

    const { getByText, findByText } = render(<Counter />)

    // when
    fireEvent.click(getByText('increase'))

    // then
    await findByText('counter 1')
  })

  it('middleware should block inner setState action', async () => {
    // given
    type State = {
      counter: any
      increase: Noop
    }
    const { useRemind } = remind<State>((set) => ({
      counter: (value = 0) => {
        return { next: false, value }
      },
      increase: () => set((prevState) => ({ counter: prevState.counter + 1 })),
    }))

    const Counter = () => {
      const [{ counter, increase }] = useRemind()

      return (
        <div>
          <p>counter {counter}</p>
          <button onClick={increase}>increase</button>
        </div>
      )
    }

    const { getByText, findByText } = render(<Counter />)

    // when
    fireEvent.click(getByText('increase'))

    // then
    await findByText('counter 0')
  })

  it('middleware should not block inner setState action', async () => {
    // given
    type State = {
      counter: any
      increase: Noop
    }
    const { useRemind } = remind<State>((set) => ({
      counter: (value = 0) => {
        return { next: true, value }
      },
      increase: () => set((prevState) => ({ counter: prevState.counter + 1 })),
    }))

    const Counter = () => {
      const [{ counter, increase }] = useRemind()

      return (
        <div>
          <p>counter {counter}</p>
          <button onClick={increase}>increase</button>
        </div>
      )
    }

    const { getByText, findByText } = render(<Counter />)

    // when
    fireEvent.click(getByText('increase'))

    // then
    await findByText('counter 1')
  })

  it('should reset store', async () => {
    // given
    type State = {
      counter: number
      increase: Noop
    }
    const store = remind<State>((set) => ({
      counter: 0,
      increase: () => set((prevState) => ({ counter: prevState.counter + 1 })),
    }))
    const { useRemind } = store

    const Counter = () => {
      const [{ counter, increase }] = useRemind()

      return (
        <div>
          <p>counter {counter}</p>
          <button onClick={increase}>increase</button>
        </div>
      )
    }

    const { getByText, findByText } = render(<Counter />)

    // when
    act(() => {
      fireEvent.click(getByText('increase'))
    })

    // then
    await findByText('counter 1')

    // when
    act(() => {
      store.destroy()
    })

    // then
    await findByText('counter 0')
    expect(store.get.state.counter).toBe(0)
    expect(store.get.listeners).toHaveLength(0)
  })

  it('should not rerender listener when state after setState action is the same', () => {
    // given
    type State = {
      counter: number
      increase: Noop
    }
    const store = remind<State>((set) => ({
      counter: 0,
      increase: () => set({ counter: 0 }),
    }))
    const { useRemind } = store

    const Counter = () => {
      const [{ counter, increase }] = useRemind()

      return (
        <div>
          <p>counter {counter}</p>
          <button onClick={increase}>increase</button>
        </div>
      )
    }

    const { getByText } = render(<Counter />)

    // when
    fireEvent.click(getByText('increase'))

    // then
    getByText('counter 0')
  })

  it('should wait for async actions', async () => {
    // given
    type State = {
      counter: number
      increase: () => Promise<void>
    }
    const store = remind<State>((set) => ({
      counter: 0,
      increase: async () => {
        await wait(1000)
        set({ counter: 1 })
      },
    }))
    const { useRemind } = store

    const Counter = () => {
      const [{ counter, increase }] = useRemind()

      return (
        <div>
          <p>counter {counter}</p>
          <button onClick={increase}>increase</button>
        </div>
      )
    }

    const { findByText, getByText } = render(<Counter />)

    // when
    fireEvent.click(getByText('increase'))

    // then
    await findByText('counter 1')
  })
})
