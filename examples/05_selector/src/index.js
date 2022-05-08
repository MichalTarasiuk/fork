import { StrictMode, useRef, useEffect } from 'react'
import { render } from 'react-dom'
import hooray from 'hoor4y'

const { useHooray } = hooray({ counter: 0, dakrMode: false }, (set) => ({
  increase: () =>
    set((state) => {
      state.counter++
    }),
}))

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
  const [state] = useHooray((state) => state.counter)

  return <p>counter: {state.counter}</p>
}

const CounterManager = () => {
  const [state] = useHooray((state) => state.increase)

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
  const [state, setState] = useHooray((state) => state.darkMode)

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
      <Counter />
      <DarkModeSwitch />
    </StrictMode>
  )
}

render(<App />, document.querySelector('#app'))
