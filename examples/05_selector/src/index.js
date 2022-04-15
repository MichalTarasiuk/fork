import { StrictMode, useRef, useEffect } from 'react'
import { render } from 'react-dom'
import remind from 'react-remind'

const { useRemind } = remind((set) => ({
  counter: 0,
  increase: () =>
    set((mind) => {
      mind.counter++
    }),
  darkMode: false,
}))

const useIsFirstMount = () => {
  const ref = useRef(true)

  useEffect(() => {
    if (ref.current) {
      ref.current = false
    }
  }, [])

  return ref.current
}

const useReRender = (name) => {
  const isFirstMount = useIsFirstMount()

  if (!isFirstMount) {
    console.log(`${name} rerendered`)
  }
}

const CounterDisplay = () => {
  const [mind] = useRemind((mind) => mind.counter)

  return <p>counter: {mind.counter}</p>
}

const CounterManager = () => {
  const [mind] = useRemind((mind) => mind.increase)

  return <button onClick={mind.increase}>increase</button>
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
  const [mind, setMind] = useRemind((mind) => mind.darkMode)

  useReRender('DarkModeSwitch')

  const toggle = (event) => {
    const checked = event.target.checked

    setMind((mind) => {
      mind.darkMode = checked
    })
  }

  return (
    <div>
      <label>
        <input type="checkbox" checked={mind.darkMode} onChange={toggle} />
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
