import { StrictMode } from 'react'
import { render } from 'react-dom'
import remest from 'remest'

const wait = (ms = 1000) => new Promise((res) => setTimeout(res, ms))

const { RemestProvider, useRemest } = remest({ counter: 0 }, (set) => ({
  increase: async () => {
    await wait()
    set((state) => {
      state.counter++
    })
  },
}))

const CounterDisplay = () => {
  const [state] = useRemest()

  return <h1>Counter {state.counter}</h1>
}

const CounterManager = () => {
  const [state] = useRemest()
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
      <RemestProvider>
        <CounterDisplay />
        <CounterManager />
      </RemestProvider>
    </StrictMode>
  )
}

render(<App />, document.getElementById('app'))
