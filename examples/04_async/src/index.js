import { StrictMode } from 'react'
import { render } from 'react-dom'
import fork from 'fork'

const wait = (ms = 1000) => new Promise((res) => setTimeout(res, ms))

const { ForkProvider, useFork } = fork({ counter: 0 }, (set) => ({
  increase: async () => {
    await wait()
    set((state) => {
      state.counter++
    })
  },
}))

const CounterDisplay = () => {
  const { state } = useFork()

  return <h1>Counter {state.counter}</h1>
}

const CounterManager = () => {
  const { state } = useFork()
  const [increase, status] = state.increase

  return (
    <button onClick={increase}>
      {status === 'loading' ? status : 'increase'}
    </button>
  )
}

const App = () => {
  return (
    <ForkProvider>
      <CounterDisplay />
      <CounterManager />
    </ForkProvider>
  )
}

render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById('app')
)
