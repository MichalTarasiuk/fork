import React from 'react'
import { render } from '@testing-library/react'

import { useDidMount } from '../src/hooks'
import { factory } from '../src/factory'

describe.skip('factory', () => {
  it('should rerender component', async () => {
    const useGlobalState = factory({
      counter: 0,
    })

    const Counter = () => {
      const [globalState, setGlobalState] = useGlobalState()

      useDidMount(() => {
        setGlobalState((prevState) => ({
          counter: prevState.counter + 1,
        }))
      })

      return <p>counter {globalState.counter}</p>
    }

    const { findByText } = await render(<Counter />)

    await findByText('counter 1')
  })

  it('should not rerender component', async () => {
    const useGlobalState = factory({
      counter: 0,
      darkMode: false,
    })

    const Counter = () => {
      const [globalState, setGlobalState] = useGlobalState(
        (state) => state.darkMode
      )

      useDidMount(() => {
        setGlobalState((prevState) => ({
          counter: prevState.counter + 1,
        }))
      })

      return <p>counter {globalState.counter}</p>
    }

    const { findByText } = await render(<Counter />)

    await findByText('counter 0')
  })

  it('it', () => {})
})
