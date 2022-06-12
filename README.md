```
WARNING: react-fork does't support react 18
```

# Install

```bash
npm install react-fork # or yarn add react-fork
```

## Initializing State

The first argument is the initial state and the second is the actions that access functions such as set and get as described below

```jsx
import fork from 'react-fork'

const { useFork } = fork({ ideas: [] }, (set, get) => ({
  sendAnIdea: (idea) => set((state) => ({ ideas: [...state.ideas, idea] })),
  isEmpty: () => get().ideas.length === 0,
}))
```

`Set`: function which manage state<br>
`Get`: function which return current state

## Then bind your components, and that's it!

Use the `useFork` anywhere you want. This hook will decide when your component get rerendered.

`Selector`: causes the component to re-render only when the scope value changes

```jsx
function IdeasDisplay() {
  const { state } = useFork((state) => state.ideas)

  return (
    <ul>
      {state.ideas.map((idea) => (
        <li>{idea}</li>
      ))}
    </ul>
  )
}

const ideas = [
  /* ... */
]

function Controls() {
  const { state } = useFork()
  return (
    <button
      onClick={() => {
        state.sendAnIdea(random(ideas))
      }}>
      send an idea
    </button>
  )
}
```

## SetState

Function which manage state.

```js
const { setState } = fork(
  {
    /* */
  },
  (set) => ({
    sendAndIdea: () => {
      // emitter is provided here automatically by useFork
      set(patch, config)
    },
  })
)

// emitter is not provided here automatically
setState(patch, config)
```

`Patch`:

```js
setState((state) => ({
  /* */
}))

// or

setState({
  /* */
})
```

`Config`:

```js
// default setState config
const config = {
  emitt: true, // decides whether the listener sending the action will be called
  replace: false, // decides whether state will be overwrite
}
```

## Resolver

Resolver call on each setState action.

```jsx
const { ForkProvider, useFork } = fork(
  { user: null, counter: 0 },
  (set) => ({
    fetchUser: async () => {
      await wait(1000)

      set({ user: { name: 'John', age: random(0, 99) } }, { emitt: false })
    },
    increase: () => {
      set((state) => ({ counter: state.counter + 1 }))
    },
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

const Component = () => {
  // you can get errors from hook
  const { errors } = useFork()

  /* return */
}
```

If an error occurs in the user, it will be replaced with the version given in the resolver state. (same behavior for counter)

## Async

Fork will generate you status for each async action.

```jsx
const { useFork } = fork({ ideas: [] }, (set, get) => ({
  sendAnIdea: async (id) => {
    const idea = await myFetcher(id)

    set((state) => ({ ideas: [...state.ideas, idea] }))
  },
}))

const Component = () => {
  const { state } = useFork()
  const [sendAnIdea, status] = state.sendAnIdea

  /* return */
}
```

## Immer

Fork supports immer 🔥

```jsx
const { useFork } = fork({ ideas: [] }, (set, get) => ({
  sendAnIdea: async (id) => {
    const idea = await myFetcher(id)

    set((state) => {
      state.push(idea)
    })
  },
}))

const Component = () => {
  const { state } = useFork()
  const [sendAnIdea, status] = state.sendAnIdea

  /* return */
}
```

## Work beyond components

Sometimes you need to access state outside components.

```js
const { setState, subscribe } = fork({ ideas: [] }, (set, get) => ({
  sendAnIdea: async (id) => {
    const idea = await myFetcher(id)

    set((state) => ({ ideas: [...state.ideas, idea] }))
  },
}))

// Listening to all changes, fires synchronously on every change
const subscriber = subscribe((state, nextState) => {
  /* */
})

setState(/* */)

// Actions for manage state
subscriber.actions

// Unsubscirbe listener
subscriber.unsubscribe()
```

## Good practices

### Async

If you are use async action status not for display in JSX. The set state action should have emitt property set to false.

```jsx
const { useFork } = fork({ ideas: [] }, (set, get) => ({
  sendAnIdea: async (id) => {
    const idea = await myFetcher(id)

    set((state) => ({ ideas: [...state.ideas, idea] }), { emitt: false })
  },
}))

const Component = () => {
  const { state } = useFork()
  const [sendAnIdea, status] = state.sendAnIdea

  useEffect(() => {
    // logic
  }, [status])

  /* return */
}
```

This tip will remove one extra rerender caused by set state action.
