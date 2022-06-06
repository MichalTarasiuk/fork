import React from 'react'
import { createRoot } from 'react-dom/client'
import fork from 'fork'

const { ForkProvider, useFork } = fork(
  { user: null },
  (set) => ({
    fetchUser: () => {
      set({ user: { name: 'John', age: 24 } })
    },
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
  const {
    state: { user, fetchUser },
  } = useFork()

  if (user) {
    return <pre>{JSON.stringify(user, undefined, 2)}</pre>
  }

  return <button onClick={fetchUser}>fetch</button>
}

createRoot(document.querySelector('#app')).render(
  <ForkProvider>
    <App />
  </ForkProvider>
)
