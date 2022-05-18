Liblary can cause errors. Please not use.

# Remest

```bash
npm install remest # or yarn add hoor4y
```

## Initializing State

The first argument is the initial state and the second is the actions that access functions such as set and get as described below

```jsx
import remest from 'remest'

const { useRemest } = remest({ ideas: [] }, (set, get) => ({
  sendAnIdea: (idea) => set((state) => ({ ideas: [...state.ideas, idea] })),
  isEmpty: () => get().ideas.length === 0,
}))
```

`Set`: function which manage state<br>
`Get`: function which return current state

## Then bind your components, and that's it!

Use the `useRemest` anywhere you want. This hook will decide when your component get rerendered.

`Selector`: causes the component to re-render only when the scope value changes

```jsx
function IdeasDisplay() {
  const { state } = useRemest((state) => state.ideas)

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
  const { state } = useRemest()
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
const { setState } = remest(
  {
    /* */
  },
  (set) => ({
    sendAndIdea: () => {
      // emitter is provided here automatically by useRemest
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

## Async

Remest will generate you status for each async action.

```jsx
const { useRemest } = remest({ ideas: [] }, (set, get) => ({
  sendAnIdea: async (id) => {
    const idea = await myFetcher(id)

    set((state) => ({ ideas: [...state.ideas, idea] }))
  },
}))

const Component = () => {
  const [state] = useRemest()
  const [sendAnIdea, status] = state.sendAnIdea

  /* return */
}
```

## Immer

Remest supports immer 🔥

```jsx
const { useRemest } = remest({ ideas: [] }, (set, get) => ({
  sendAnIdea: async (id) => {
    const idea = await myFetcher(id)

    set((state) => {
      state.push(idea)
    })
  },
}))

const Component = () => {
  const [state] = useRemest()
  const [sendAnIdea, status] = state.sendAnIdea

  /* return */
}
```

## Work beyond components

Sometimes you need to access state outside components.

```js
const { setState, subscribe } = remest({ ideas: [] }, (set, get) => ({
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
const { useRemest } = remest({ ideas: [] }, (set, get) => ({
  sendAnIdea: async (id) => {
    const idea = await myFetcher(id)

    set((state) => ({ ideas: [...state.ideas, idea] }), { emitt: false })
  },
}))

const Component = () => {
  const [state] = useRemest()
  const [sendAnIdea, status] = state.sendAnIdea

  useEffect(() => {
    // logic
  }, [status])

  /* return */
}
```

This tip will remove one extra rerender caused by set state action.
