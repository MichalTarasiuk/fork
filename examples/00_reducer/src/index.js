import { StrictMode } from 'react'
import { render } from 'react-dom'

import { useReRenderCount } from './helpers'
import { RemestProvider, useRemest, action } from './remest'

const Counter = () => {
  const [state] = useRemest()
  const rerenderCount = useReRenderCount()

  return (
    <div>
      <h1>Counter</h1>
      <p>counter: {state.counter}</p>
      <p>is divisible: {state.isDivisible().toString()}</p>
      <button
        onClick={() => {
          state.setCounter({ type: action.increase })
        }}>
        increase
      </button>
      <button
        onClick={() => {
          state.setCounter({ type: action.decrease })
        }}>
        decrease
      </button>
      <details>
        <summary>re-render count:</summary>
        <p>{rerenderCount}</p>
      </details>
    </div>
  )
}

const App = () => {
  return (
    <RemestProvider>
      <Counter />
    </RemestProvider>
  )
}

render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.querySelector('#app')
)
