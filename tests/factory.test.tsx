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
    }).init()

    const Counter = () => {
      const [globalState, setGlobalState] = useRemind()

      useDidMount(() => {
        setGlobalState((prevState) => ({
          counter: prevState.counter + 1,
        }))
      })

      return <p>counter {globalState.counter}</p>
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
    }).init()

    const Counter = () => {
      const [globalState, setGlobalState] = useRemind((state) => state.darkMode)

      useDidMount(() => {
        setGlobalState((prevState) => ({
          counter: prevState.counter + 1,
        }))
      })

      return <p>counter {globalState.counter}</p>
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
    }).init()

    const Component = () => {
      const [globalState, setGlobalState] = useRemind(
        (state) => state.counter.name
      )

      const increase = () => {
        setGlobalState((prevState) => ({
          counter: {
            value: prevState.counter.value + 1,
          },
        }))
      }

      const changeName = (newName: string) => {
        setGlobalState({
          counter: {
            name: newName,
          },
        })
      }

      return (
        <div>
          <p>name {globalState.counter.name}</p>
          <button onClick={() => changeName(random(additionalNames))}>
            change name
          </button>
          <p>counter {globalState.counter.value}</p>
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
    const { useRemind } = remind({
      counter: 0,
    }).init()
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
        const [globalState] = useRemind()

        return (
          <div>
            <p>component: Child1</p>
            <p>counter {globalState.counter}</p>
          </div>
        )
      },
      Child2() {
        const [globalState] = useRemind()

        return (
          <div>
            <p>component: Child2</p>
            <p>counter {globalState.counter}</p>
          </div>
        )
      },
    }

    const { getByText } = await render(<Root.Parent />)

    // when
    fireEvent.click(getByText('unmount child 1'))

    // then
    expect(useRemind.listeners).toHaveLength(1)
  })
})
