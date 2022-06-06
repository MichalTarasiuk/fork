import React from 'react'
import { createRoot } from 'react-dom/client'
import fork from 'fork'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const random = (min, max) => Math.floor(Math.random() * (max - min)) + min

const { ForkProvider, useFork } = fork(
  { user: null },
  (set) => ({
    fetchUser: async () => {
      await wait(1000)

      set({ user: { name: 'John', age: random(15, 50) } }, { emitt: false })
    },
    resetUser: () => set({ user: null }),
  }),
  {
    context: {
      isValidUser: (user) => (user ? user.age < 18 : false),
    },
    resolver: (state, context) => {
      return {
        state: { ...state, user: null },
        errors: {
          user: context.isValidUser(state.user)
            ? { type: 'age error', message: 'too young' }
            : null,
        },
      }
    },
  }
)

const App = () => {
  const { state } = useFork()
  const [fetchUser, status] = state.fetchUser

  if (state.user) {
    return (
      <div>
        <pre>{JSON.stringify(state.user, undefined, 2)}</pre>
        <button onClick={state.resetUser}>reset</button>
      </div>
    )
  }

  return <button onClick={fetchUser}>{status}</button>
}

createRoot(document.querySelector('#app')).render(
  <ForkProvider>
    <App />
  </ForkProvider>
)
