import { StrictMode } from 'react'
import { render } from 'react-dom'
import remind from 'react-remind'

const wait = (ms = 1000) => new Promise((res) => setTimeout(res, ms))

const { useRemind } = remind((set) => ({
  counter: 0,
  increase: async () => {
    await wait()
    set(
      (mind) => {
        mind.counter++
      },
      { notify: false }
    )
  },
}))

const CounterDisplay = () => {
  const [mind] = useRemind()

  return <h1>Counter {mind.counter}</h1>
}

const CounterManager = () => {
  const [mind] = useRemind()
  const [increase, status] = mind.increase

  return (
    <button onClick={increase}>
      {status === 'loading' ? status : 'increase'}
    </button>
  )
}

const App = () => {
  return (
    <StrictMode>
      <CounterDisplay />
      <CounterManager />
    </StrictMode>
  )
}

render(<App />, document.getElementById('app'))
