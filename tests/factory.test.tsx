import { useState } from 'react'
import { render, fireEvent, act } from '@testing-library/react'

import remind from '../src/factory'
import { useDidMount } from '../src/hooks/hooks'
import { createStash } from '../src/logic/logic'
import { HOSTNAME } from '../src/constants'
import { wait } from './tests.utils'
import type { Noop } from './test.types'

describe('factory', () => {
  const stash = createStash<Record<PropertyKey, unknown>>(HOSTNAME)

  afterEach(() => {
    stash.clear()
  })

  it('should rerender component', async () => {
    // arrange
    type Mind = {
      counter: number
      increase: Noop
    }
    const { useRemind } = remind<Mind>((set) => ({
      counter: 0,
      increase: () => set((prevMind) => ({ counter: prevMind.counter + 1 })),
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
      const [mind, setMind] = useRemind((mind) => mind.darkMode)

      useDidMount(() => {
        setMind((prevMind) => ({
          counter: prevMind.counter + 1,
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
    expect(store.listeners).toHaveLength(1)
  })

  it('should not rerender component which use selector after invoke setMind action beyond component', async () => {
    // given
    const store = remind({
      counter: 0,
      darkMode: false,
    })
    const { useRemind, setMind } = store

    const Counter = () => {
      const { mind } = useRemind((mind) => mind.darkMode)

      return <p>counter {mind.counter}</p>
    }

    const { findByText } = render(<Counter />)

    // when
    setMind((prevMind) => ({
      counter: prevMind.counter + 1,
    }))

    // then
    await findByText('counter 0')
  })

  it('should rerender component which use selector after invoke setMind action beyond component', async () => {
    // given
    const store = remind({
      counter: 0,
      darkMode: false,
    })
    const { useRemind, setMind } = store

    const Counter = () => {
      const [mind] = useRemind()

      return <p>counter {mind.counter}</p>
    }

    const { findByText } = render(<Counter />)

    // when
    act(() => {
      setMind((prevMind) => ({
        counter: prevMind.counter + 1,
      }))
    })

    // then
    await findByText('counter 1')
  })

  it('should not rerender component when mind after setMind action is the same', () => {
    // given
    type Mind = {
      counter: number
    }
    const store = remind<Mind>((set) => ({
      counter: 0,
    }))
    const { useRemind } = store

    const Counter = () => {
      const [{ counter }] = useRemind()

      const increase = () => {
        store.setMind({
          counter: 0,
        })
      }

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
    type Mind = {
      counter: number
      increase: () => Promise<void>
    }
    const store = remind<Mind>((set) => ({
      counter: 0,
      increase: async () => {
        await wait(1000)
        set((prevState) => ({ counter: prevState.counter + 1 }))
      },
    }))
    const { useRemind } = store

    const Counter = () => {
      const { mind } = useRemind()
      const [increase] = mind.increase

      return (
        <div>
          <p>counter {mind.counter}</p>
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

  it('should observe mind by watch option', () => {
    // given
    const { useRemind } = remind({
      list: [] as number[],
    })
    const Todo = () => {
      const { mind } = useRemind((mind) => mind.list, { watch: true })

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
        const { mind } = useRemind((mind) => mind, { watch: true })

        const add = () => {
          mind.list.push(Math.random())
        }

        return <button onClick={add}>add</button>
      },
      Child2() {
        const { mind } = useRemind((mind) => mind.list)

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

  it('should unsubscribe component', () => {
    // given
    type Mind = {
      counter: number
      increase: Noop
    }
    const store = remind<Mind>((set) => ({
      counter: 0,
      increase: () => {
        set((prevState) => ({ counter: prevState.counter + 1 }))
      },
    }))
    const { useRemind } = store

    const Counter = () => {
      const { mind, unsubscribe } = useRemind()

      return (
        <div>
          <p>counter {mind.counter}</p>
          <button onClick={mind.increase}>increase</button>
          <button onClick={unsubscribe}>unsubscribe</button>
        </div>
      )
    }

    const { getByText } = render(<Counter />)

    // when
    fireEvent.click(getByText('increase'))

    // then
    getByText('counter 1')

    // when
    fireEvent.click(getByText('unsubscribe'))
    fireEvent.click(getByText('increase'))

    // then
    getByText('counter 1')
  })

  it('should return true when counter value is divisible', () => {
    // given
    type Mind = {
      counter: number
      increase: () => void
      isDivisible: () => boolean
    }
    const { useRemind } = remind<Mind>((set, get) => ({
      counter: 0,
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
    type Mind = {
      counter: number
      increase: () => void
      decrease: () => void
    }
    const { useRemind } = remind<Mind>((set) => ({
      counter: 0,
      increase: () => set((prevMind) => ({ counter: prevMind.counter + 1 })),
      decrease: () => set((prevMind) => ({ counter: prevMind.counter - 1 })),
    }))

    const Counter = () => {
      const { mind } = useRemind((mind) => mind.counter, {
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

  it('should replace state', () => {
    // given
    type Mind = {
      counter: number
      increase: Noop
    }
    const store = remind<Mind>((set) => ({
      counter: 0,
      increase: () => {
        set((prevMind) => ({ counter: prevMind.counter + 1 }))
      },
    }))
    const { useRemind } = store

    const Counter = () => {
      const { mind, setMind } = useRemind()

      const block = () => {
        setMind(
          (prevMind) => ({
            counter: prevMind.counter,
          }),
          true
        )
      }

      if (mind.increase) {
        return (
          <div>
            <p>counter: {mind.counter}</p>
            <button onClick={mind.increase}>increase</button>
            <button onClick={block}>block</button>
          </div>
        )
      }

      return null
    }

    const { getByText } = render(<Counter />)

    // when
    fireEvent.click(getByText('increase'))

    // then
    getByText('counter: 1')

    // when
    fireEvent.click(getByText('block'))

    // then
    expect(store.mind).toEqual({ counter: 1 })
  })

  it('should generate staus for new async actions', async () => {
    // given
    type Mind = {
      counter: number
      increase?: () => Promise<void>
    }
    const store = remind<Mind>({
      counter: 0,
    })
    const { useRemind } = store

    const Counter = () => {
      const { mind, setMind } = useRemind()

      if (mind.increase) {
        const [increase] = mind.increase

        return (
          <div>
            <p>counter: {mind.counter}</p>
            <button onClick={increase}>increase</button>
          </div>
        )
      }

      const upgrade = () => {
        setMind((_, set) => ({
          increase: async () => {
            await wait(1000)
            set((prevMind) => ({ counter: prevMind.counter + 1 }))
          },
        }))
      }

      return <button onClick={upgrade}>upgrade</button>
    }

    const { getByText, findByText } = render(<Counter />)

    // when
    fireEvent.click(getByText('upgrade'))

    // then
    getByText('counter: 0')

    // when
    fireEvent.click(getByText('increase'))

    // then
    await findByText('counter: 1')
  })

  it(`should remove status when async action does't exist`, async () => {
    // given
    type Mind = {
      counter: number
      increase?: () => Promise<void>
    }
    const { useRemind } = remind<Mind>((set) => ({
      counter: 0,
      increase: async () => {
        await wait(1000)
        set((prevMind) => ({ counter: prevMind.counter + 1 }))
      },
    }))

    const Counter = () => {
      const { mind, setMind } = useRemind()

      if (mind.increase) {
        const [increase] = mind.increase

        const remove = () => {
          setMind(
            (prevMind) => ({
              counter: prevMind.counter,
            }),
            true
          )
        }

        return (
          <div>
            <p>counter: {mind.counter}</p>
            <button onClick={increase}>increase</button>
            <button onClick={remove}>remove</button>
          </div>
        )
      }

      return <pre>{JSON.stringify(mind)}</pre>
    }
    const { getByText, findByText } = render(<Counter />)

    // when
    fireEvent.click(getByText('increase'))

    // then
    await findByText('counter: 1')

    // when
    fireEvent.click(getByText('remove'))
  })
})
