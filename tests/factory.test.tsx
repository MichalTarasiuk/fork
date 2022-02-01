import React, { useState } from 'react'
import { render, fireEvent } from '@testing-library/react'

import { useDidMount } from 'src/hooks'
import { remind } from 'src/remind'
import { random } from 'src/utils'

describe('factory', () => {
  it('should rerender component', async () => {
    // arrange
    const { useRemind } = remind({
      counter: 0,
    })

    const Counter = () => {
      const [mind, setMind] = useRemind()

      useDidMount(() => {
        setMind((prevState) => ({
          counter: prevState.counter + 1,
        }))
      })

      return <p>counter {mind.counter}</p>
    }

    const { findByText } = await render(<Counter />)

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

    const { findByText } = await render(<Counter />)

    // asserts
    await findByText('counter 0')
  })

  it('should not rerender component when use deep selector', async () => {
    // given
    const initialName = 'you can count, count on yourself'
    const additionalNames = [
      'keep counting!!!',
      "you're doing better and better",
    ]
    const { useRemind } = remind({
      counter: {
        name: initialName,
        value: 0,
      },
      dakrMode: false,
    })

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

    const { getByText } = await render(<Component />)

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

  it('should remove listener from component which is not mounted', async () => {
    // given
    const store = remind({
      counter: 0,
    })
    const { useRemind } = store
    const Root = {
      Parent() {
        const [isMounted, setIsMounted] = useState(false)

        const unmount = () => setIsMounted(true)

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

    const { getByText } = await render(<Root.Parent />)

    // when
    fireEvent.click(getByText('unmount child 1'))

    // then
    expect(store.listeners).toHaveLength(1)
  })

  it('should remove listeners and back to initial state', async () => {
    // given
    const initialValue = {
      counter: 0,
    }
    const store = remind(initialValue)
    const { useRemind } = store

    const Counter = () => {
      const [mind, setMind] = useRemind()

      const increase = () => {
        setMind((prevState) => ({
          counter: prevState.counter + 1,
        }))
      }

      return (
        <div>
          <p>counter {mind.counter}</p>
          <button onClick={increase}>increase</button>
        </div>
      )
    }
    const { getByText, findByText } = await render(<Counter />)

    // when
    fireEvent.click(getByText('increase'))

    // then
    await findByText('counter 1')

    // when
    store.destory()

    // then
    expect(store.getState).toEqual(initialValue)
    expect(store.listeners).toHaveLength(0)
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

    const { findByText } = await render(<Counter />)

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

    const { findByText } = await render(<Counter />)

    // when
    setState((prevState) => ({
      counter: prevState.counter + 1,
    }))

    // then
    await findByText('counter 0')
  })
})
