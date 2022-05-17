import { StrictMode, useRef, useEffect } from 'react'
import { render } from 'react-dom'
import hooray from 'hoor4y'

const { HoorayProvider, useHooray } = hooray({ counter: 0 }, (set) => ({
  increase: () => set((state) => ({ counter: state.counter + 1 })),
  decrease: () => set((state) => ({ counter: state.counter - 1 })),
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

const Counter = () => {
  const { state } = useHooray((state) => state.counter, {
    equality: (slice, nextSlice) => nextSlice > slice,
  })

  useReRender('Counter')

  return (
    <div>
      <p>counter {state.counter}</p>
      <button onClick={state.increase}>increase</button>
      <button onClick={state.decrease}>decrease</button>
    </div>
  )
}

const App = () => (
  <StrictMode>
    <HoorayProvider>
      <Counter />
    </HoorayProvider>
  </StrictMode>
)

render(<App />, document.querySelector('#app'))
