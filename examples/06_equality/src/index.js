import { StrictMode } from 'react'
import { render } from 'react-dom'
import remest from 'remest'

import { useReRender } from './helpers'

const { RemestProvider, useRemest } = remest({ counter: 0 }, (set) => ({
  increase: () => set((state) => ({ counter: state.counter + 1 })),
  decrease: () => set((state) => ({ counter: state.counter - 1 })),
}))

const Counter = () => {
  const { state } = useRemest((state) => state.counter, {
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
  <RemestProvider>
    <Counter />
  </RemestProvider>
)

render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.querySelector('#app')
)
