import { StrictMode, useRef, useEffect } from 'react'
import { render } from 'react-dom'
import hooray from 'hoor4y'

const useFirstMount = () => {
  const ref = useRef(true)

  useEffect(() => {
    if (ref.current) {
      ref.current = false
    }
  }, [])

  return ref.current
}

const useReRenderCount = () => {
  const ref = useRef(0)
  const isFirstMount = useFirstMount()

  if (!isFirstMount) {
    ref.current++
  }

  return ref.current
}

const INCREASE = 'INCREASE'
const DECREASE = 'DECREASE'

const reducer = (counter, action) => {
  switch (action.type) {
    case INCREASE:
      return {
        counter: counter + 1,
      }
    case DECREASE:
      return {
        counter: counter - 1,
      }
    default:
      return {
        counter,
      }
  }
}

const { useHooray } = hooray({ counter: 0 }, (set, get) => ({
  counter: 0,
  setCounter: (action) => {
    set((state) => reducer(state.counter, action))
  },
  isDivisible() {
    return get().counter % 2 === 0
  },
}))

const App = () => {
  const [state] = useHooray()
  const rerenderCount = useReRenderCount()

  return (
    <div>
      <h1>Counter</h1>
      <p>counter: {state.counter}</p>
      <p>is divisible: {state.isDivisible().toString()}</p>
      <button
        onClick={() => {
          state.setCounter({ type: INCREASE })
        }}>
        increase
      </button>
      <button
        onClick={() => {
          state.setCounter({ type: DECREASE })
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

render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.querySelector('#app')
)
