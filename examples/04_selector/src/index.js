import { StrictMode } from 'react'
import { render } from 'react-dom'
import fork from 'react-fork'

import { useReRender } from './helpers'

const { ForkProvider, useFork } = fork(
  { counter: 0, dakrMode: false },
  (set) => ({
    increase: () =>
      set((state) => {
        state.counter++
      }),
  })
)

const CounterDisplay = () => {
  const { state } = useFork((state) => state.counter)

  return <p>counter: {state.counter}</p>
}

const CounterManager = () => {
  const { state } = useFork((state) => state.increase)

  return <button onClick={state.increase}>increase</button>
}

const Counter = () => {
  return (
    <div>
      <CounterDisplay />
      <CounterManager />
    </div>
  )
}

const DarkModeSwitch = () => {
  const { state, setState } = useFork((state) => state.darkMode)

  useReRender('DarkModeSwitch')

  const toggle = (event) => {
    const checked = event.target.checked

    setState((state) => {
      state.darkMode = checked
    })
  }

  return (
    <div>
      <label>
        <input type="checkbox" checked={state.darkMode} onChange={toggle} />
        dark mode
      </label>
    </div>
  )
}

const App = () => {
  return (
    <StrictMode>
      <ForkProvider>
        <Counter />
        <DarkModeSwitch />
      </ForkProvider>
    </StrictMode>
  )
}

render(<App />, document.querySelector('#app'))
