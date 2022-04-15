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

const Counter = () => {
  const [mind] = useRemind()
  const [increase, status] = mind.increase

  return (
    <div>
      <h1>Counter {mind.counter}</h1>
      <button onClick={increase}>
        {status === 'loading' ? status : 'click'}
      </button>
    </div>
  )
}

const App = () => {
  return (
    <StrictMode>
      <Counter />
    </StrictMode>
  )
}

render(<App />, document.getElementById('app'))
