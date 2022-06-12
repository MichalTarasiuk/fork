import React, { useEffect } from 'react'
import { render } from 'react-dom'
import fork from 'react-fork'

const random = (min, max) => Math.floor(Math.random() * (max - min)) + min

const { ForkProvider, useFork } = fork(
  { user: null, counter: 0 },
  (set) => ({
    fetchUser: () => {
      set({ user: { name: 'John', age: random(9, 36) } })
    },
    increase: () => {
      set((state) => ({ counter: state.counter + 1 }))
    },
    resetUser: () => set({ user: null }),
  }),
  {
    context: {
      isValidUser: (user) => (user ? user.age < 18 : false),
      shouldResetCounter: (number) => number > 10,
    },
    resolver: (state, context) => {
      return {
        state: { user: null, counter: 0 },
        errors: {
          user: context.isValidUser(state.user)
            ? { type: 'age error', message: 'too young' }
            : null,
          counter: context.shouldResetCounter(state.counter)
            ? { type: 'counter error', message: 'too high' }
            : null,
        },
      }
    },
  }
)

const CounterButton = () => {
  const {
    state: { counter, increase },
  } = useFork()

  return <button onClick={increase}>increase {counter}</button>
}

const App = () => {
  const {
    state: { user, fetchUser, resetUser, counter },
    errors,
  } = useFork()

  useEffect(() => {
    if (errors.user) {
      const { type, message } = errors.user

      alert(`${type}: ${message}`)
    }
  }, [errors.user])

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
      <CounterButton />
      <button onClick={fetchUser}>fetchuser</button>
    </div>
  )
}

render(
  <ForkProvider>
    <App />
  </ForkProvider>,
  document.getElementById('app')
)
