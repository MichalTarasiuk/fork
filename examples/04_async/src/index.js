import { StrictMode } from 'react'
import { render } from 'react-dom'
import hooray from 'hoor4y'

const wait = (ms = 1000) => new Promise((res) => setTimeout(res, ms))

const { useHooray } = hooray({ counter: 0 }, (set) => ({
  increase: async () => {
    await wait()
    set((state) => {
      state.counter++
    })
  },
}))

const CounterDisplay = () => {
  const [state] = useHooray()

  return <h1>Counter {state.counter}</h1>
}

const CounterManager = () => {
  const [state] = useHooray()
  const [increase, status] = state.increase

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
