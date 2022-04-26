import React from 'react'
import { createRoot } from 'react-dom/client'
import remind from 'react-remind'

const { useRemind, setMind } = remind({ counter: 0 }, (set) => ({
  increase: () => {
    set((mind) => ({ counter: mind.counter + 1 }))
  },
}))

const decrease = () => {
  setMind((mind) => ({ counter: mind.counter - 1 }))
}

const App = () => {
  const { mind } = useRemind()

  return (
    <div>
      <p>{mind.counter}</p>
      <button onClick={mind.increase}>increase</button>
      <button onClick={decrease}>decrease</button>
    </div>
  )
}

createRoot(document.querySelector('#app')).render(<App />)
