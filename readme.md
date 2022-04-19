A small, fast and scalable state-management solution using simplified flux principles. Has a comfy api based on hooks, isn't boilerplatey or opinionated.

```bash
npm install my-remind # or yarn add my-remind
```

## First create a store

Your store is a hook! You can put anything in it: primitives, objects, functions. The `set` function _merges_ state.

```jsx
import remind from 'my-remind'

const { useRemind } = remind((set) => ({
  mindLevel: 0,
  increase: () => set((mind) => ({ mindLevel: mind.mindLevel + 1 })),
  reset: () => set({ mindLevel: 0 }),
}))

// or

const { useRemind, setMind } = remind({
  mindLevel: 0,
})

const increase = () => {
  setMind((mind) => ({ mindLevel: mind.mindLevel + 1 }))
}

const reset = () => {
  setMind({ mindLevel: 0 })
}
```

## Then bind your components, and that's it!

Use the hook anywhere, no providers needed. Select your state and the component will re-render on changes.

```jsx
function CounterDisplay() {
  const { mind } = useRemind((mind) => mind.mindLevel)
  return <h1>mind level: {mind.mindLevel}</h1>
}

function Controls() {
  const { mind } = useRemind((mind) => mind.increase)
  return <button onClick={mind.increase}>one up</button>
}
```

### Why remind over redux?

- Simple and un-opinionated
- Makes hooks the primary means of consuming state
- Doesn't wrap your app in context providers

### Why remind over context?

- Less boilerplate
- Renders components only on changes
- Centralized, action-based state management

---

# Recipes

## Fetching everything

You can, but mind that it will cause the component to update on every state change!

```jsx
const { mind } = useRemind()

// or

const [mind] = useRemind()
```

You can pick your mind from array or plain object.

## Selecting multiple state slices

It detects changes with strict-equality (old === new) by default, this is efficient for atomic state picks.

```jsx
const { mind } = useRemind((mind) => mind.mindLevel)
```

For more control over re-rendering, you may provide any custom equality function.

```jsx
const { mind } = useRemind((state) => state.mindLevel, {
  equality: (oldLevel, newLevel) => compare(oldLevel, newLevel),
})
```

## Overwriting state

The `set` function has a second argument, `false` by default. Instead of merging, it will replace the state model. Be careful not to wipe out parts you rely on, like actions.

```jsx
import omit from 'lodash-es/omit'

const { useRemind } = remind((set) => ({
  name: 'mind',
  level: 2,
  deleteEverything: () => set({}, true), // clears the entire store, actions included
  deleteName: () => set((state) => omit(state, ['name']), true),
}))
```

## Async actions

Just call `set` when you're ready, remind doesn't care if your actions are async or not.

```jsx
const { useRemind } = remind((set) => ({
  ideas: {},
  fetch: async (path) => {
    const response = await fetch(path)
    set({ ideas: await response.json() })
  },
}))
```

Remind generate you status for each async action.

```jsx
const MyComponent = () => {
  const { mind } = useRemind()
  const [fetch, status] = mind.fetch

  return <button>{status === 'idle' ? 'fetch' : status}</button>
}
```

## Read from state in actions

`set` allows fn-updates `set(state => result)`, but you still have access to state outside of it through `get`.

```jsx
const { useRemind } = remind((set, get) => ({
  name: "mind",
  action: () => {
    const sound = get().name
    // ...
  }
})
```

## Reading/writing state and reacting to changes outside of components

Sometimes you need to access state in a non-reactive way, or act upon the store. For these cases the resulting hook has utility functions attached to its prototype.

```jsx
const head = remind(() => ({ mindLevel: 0 }))

// Getting non-reactive fresh state
const mindLevel = head.mind.mindLevel
// Listening to all changes, fires synchronously on every change
const unsub1 = head.subscribe(console.log)
// Updating state, will trigger listeners
head.setMind({ mindLevel: 2 })
// Unsubscribe listeners
unsub1.unsubscribe()
// Destroying the store (removing all listeners)
head.destroy()

// You can of course use the hook as you always would
function Component() {
  const { mind } = useRemind(mind => state.mindLevel)
```

### Using subscribe with selector

If you need to subscribe with selector,
`subscribeWithSelector` middleware will help.

With this middleware `subscribe` accepts an additional signature:

```ts
subscribe(listener, selector?, equality?): { unsubscribe, body }
```

## Can't live without redux-like reducers and action types?

```jsx
const types = { increase: 'INCREASE', decrease: 'DECREASE' }

const reducer = (state, { type, by = 1 }) => {
  switch (type) {
    case types.increase:
      return { mindLevel: state.mindLevel + by }
    case types.decrease:
      return { mindLevel: state.mindLevel - by }
  }
}

const { useRemind } = remind((set) => ({
  mindLevel: 0,
  dispatch: (args) => set((mind) => reducer(mind, args)),
}))

const { mind } = useRemind((mind) => mind.dispatch)
mind.dispatch({ type: types.increase, by: 2 })
```
