import { StrictMode, useRef, useEffect } from 'react'
import { render } from 'react-dom'
import remest from 'remest'

const { RemestProvider, useRemest } = remest(
  { counter: 0, dakrMode: false },
  (set) => ({
    increase: () =>
      set((state) => {
        state.counter++
      }),
  })
)

const useFirstMount = () => {
  const ref = useRef(true)

  useEffect(() => {
    if (ref.current) {
      ref.current = false
    }
  }, [])

  return ref.current
}

const useReRender = (name) => {
  const isFirstMount = useFirstMount()

  if (!isFirstMount) {
    console.log(`${name} rerendered`)
  }
}

const CounterDisplay = () => {
  const [state] = useRemest((state) => state.counter)

  return <p>counter: {state.counter}</p>
}

const CounterManager = () => {
  const [state] = useRemest((state) => state.increase)

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
  const [state, setState] = useRemest((state) => state.darkMode)

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
      <RemestProvider>
        <Counter />
        <DarkModeSwitch />
      </RemestProvider>
    </StrictMode>
  )
}

render(<App />, document.querySelector('#app'))
