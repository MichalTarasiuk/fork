import { StrictMode } from 'react'
import { render } from 'react-dom'
import fork from 'fork'

import { useReRender } from './helpers'

const { ForkProvider, useFork } = fork({ counter: 0 }, (set) => ({
  increase: () => set((state) => ({ counter: state.counter + 1 })),
  decrease: () => set((state) => ({ counter: state.counter - 1 })),
}))

const Counter = () => {
  const { state } = useFork((state) => state.counter, {
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
  <ForkProvider>
    <Counter />
  </ForkProvider>
)

render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.querySelector('#app')
)
