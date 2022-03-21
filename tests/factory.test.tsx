import { useState } from 'react'
import { render, fireEvent, act, waitFor } from '@testing-library/react'

import { useDidMount } from '../src/hooks/hooks'
import remind from '../src/factory'
import { random, wait } from './tests.utils'
import type { Noop } from '../src/typings'

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

    // assert
    await findByText('counter 0')
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

  it('should observe state on change', () => {
    // given
    const { useRemind } = remind({
      list: [] as number[],
    })
    const Todo = () => {
      const { mind } = useRemind((state) => state.list, { watch: true })

      const add = () => {
        mind.list.push(Math.random())
      }

      return (
        <div>
          <ul data-testid="list">
            {mind.list.map((element) => (
              <li key={element}>{element}</li>
            ))}
          </ul>
          <button onClick={add}>add</button>
        </div>
      )
    }
    const { getByText, getByTestId } = render(<Todo />)

    // when
    fireEvent.click(getByText('add'))

    // then
    expect(getByTestId('list').children).toHaveLength(1)
  })

  it('should notify all subscribers by watch option', () => {
    // given
    const { useRemind } = remind({
      list: [] as number[],
    })
    const Root = {
      Parent() {
        return (
          <>
            <Root.Child1 />
            <Root.Child2 />
          </>
        )
      },
      Child1() {
        const { mind } = useRemind((state) => state, { watch: true })

        const add = () => {
          mind.list.push(Math.random())
        }

        return <button onClick={add}>add</button>
      },
      Child2() {
        const { mind } = useRemind((state) => state.list)

        return (
          <ul data-testid="numbers-list">
            {mind.list.map((element) => (
              <li key={element}>{element}</li>
            ))}
          </ul>
        )
      },
    }
    const { getByText, getByTestId } = render(<Root.Parent />)

    // when
    fireEvent.click(getByText('add'))

    // then
    expect(getByTestId('numbers-list').children).toHaveLength(1)
  })

  it('should unregister component', () => {
    // given
    type State = {
      counter: number
      increase: () => void
    }
    const store = remind<State>((set) => ({
      counter: 0,
      increase: () => {
        set({ counter: 1 })
      },
    }))
    const { useRemind } = store

    const Counter = () => {
      const { mind, unregister } = useRemind()

      return (
        <div>
          <p>counter {mind.counter}</p>
          <button onClick={mind.increase}>increase</button>
          <button onClick={unregister}>unregister</button>
        </div>
      )
    }

    const { getByText } = render(<Counter />)

    // when
    fireEvent.click(getByText('increase'))

    // then
    getByText('counter 1')

    // when
    fireEvent.click(getByText('unregister'))
    fireEvent.click(getByText('increase'))

    // then
    getByText('counter 1')
  })

  it('it should return true when counter is divisible', () => {
    // given
    type State = {
      counter: number
      increase: () => void
      isDivisible: () => boolean
    }
    const { useRemind } = remind<State>((set, get) => ({
      counter: 0,
      increase: () => set((prevState) => ({ counter: prevState.counter + 1 })),
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
    type State = {
      counter: number
      increase: () => void
      decrease: () => void
    }
    const { useRemind } = remind<State>((set) => ({
      counter: 0,
      increase: () => set((prevState) => ({ counter: prevState.counter + 1 })),
      decrease: () => set((prevState) => ({ counter: prevState.counter - 1 })),
    }))

    const Counter = () => {
      const { mind } = useRemind((state) => state.counter, {
        equalityFn: (nextSlice, slice) => nextSlice > slice,
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
})
