import { StrictMode, useRef, useEffect } from 'react'
import { render } from 'react-dom'
import remind from 'react-remind'

const { useRemind } = remind((set) => ({
  counter: 0,
  increase: () => set((prevMind) => ({ counter: prevMind.counter + 1 })),
  decrease: () => set((prevMind) => ({ counter: prevMind.counter - 1 })),
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

const Counter = () => {
  const { mind } = useRemind((mind) => mind.counter, {
    equality: (slice, nextSlice) => nextSlice > slice,
  })

  useReRender('Counter')

  return (
    <div>
      <p>counter {mind.counter}</p>
      <button onClick={mind.increase}>increase</button>
      <button onClick={mind.decrease}>decrease</button>
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

render(<App />, document.querySelector('#app'))
