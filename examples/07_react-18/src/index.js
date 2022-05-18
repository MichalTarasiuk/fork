import React from 'react'
import { createRoot } from 'react-dom/client'
import remest from 'remest'

const { RemestProvider, useRemest, setState } = remest(
  { counter: 0 },
  (set) => ({
    increase: () => {
      set((state) => ({ counter: state.counter + 1 }))
    },
  })
)

const decrease = () => {
  setState((state) => ({ counter: state.counter - 1 }))
}

const App = () => {
  const { state } = useRemest()

  return (
    <div>
      <p>{state.counter}</p>
      <button onClick={state.increase}>increase</button>
      <button onClick={decrease}>decrease</button>
    </div>
  )
}

createRoot(document.querySelector('#app')).render(
  <RemestProvider>
    <App />
  </RemestProvider>
)
