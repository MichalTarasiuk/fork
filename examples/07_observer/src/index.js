import React from 'react'
import { createRoot } from 'react-dom/client'
import fork from 'react-fork'

const { ForkProvider, useFork } = fork({ counter: 0, cache: [] })

const App = () => {
  const { state } = useFork((state) => state, {
    observe: true,
  })

  const increase = () => {
    state.counter++
  }

  return (
    <div>
      <p>{state.counter}</p>
      <button onClick={increase}>increase</button>
      <pre>{JSON.stringify(state.cache, undefined, 2)}</pre>
    </div>
  )
}

createRoot(document.querySelector('#app')).render(
  <ForkProvider>
    <App />
  </ForkProvider>
)
