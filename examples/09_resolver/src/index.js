import React from 'react'
import { createRoot } from 'react-dom/client'
import fork from 'fork'

const random = (min, max) => Math.floor(Math.random() * (max - min)) + min

const { ForkProvider, useFork } = fork(
  { user: null, counter: 0 },
  (set) => ({
    fetchUser: () => {
      set({ user: { name: 'John', age: random(0, 99) } })
    },
    increase: () => {
      set((state) => ({ counter: state.counter + 1 }))
    },
    resetUser: () => set({ user: null }),
  }),
  {
    context: {
      isValidUser: (user) => (user ? user.age < 18 : false),
    },
    resolver: (state, context) => {
      return {
        state: { user: null, counter: 0 },
        errors: {
          user: context.isValidUser(state.user)
            ? { type: 'age error', message: 'too young' }
            : null,
          counter: null,
        },
      }
    },
  }
)

const App = () => {
  const {
    state: { user, fetchUser, resetUser, counter, increase },
  } = useFork()

  if (user) {
    return (
      <div>
        <pre>{JSON.stringify({ counter, user }, undefined, 2)}</pre>
        <button onClick={resetUser}>reset</button>
      </div>
    )
  }

  return (
    <div>
      <button onClick={increase}>increase {counter}</button>
      <button onClick={fetchUser}>fetch user</button>
    </div>
  )
}

createRoot(document.querySelector('#app')).render(
  <ForkProvider>
    <App />
  </ForkProvider>
)
