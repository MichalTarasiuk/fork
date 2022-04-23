# Remind 🧠

```bash
npm install react-remind # or yarn add react-remind
```

## Initializing State

The first argument is the initial state and the second is the actions that access functions such as set and get as described below

```jsx
import remind from 'react-remind'

const { useRemind } = remind({ ideas: [] }, (set, get) => ({
  sendAnIdea: (idea) => set((mind) => ({ ideas: [...mind.ideas, idea] })),
  isEmpty: () => get().ideas.length === 0,
}))
```

`Set`: function which manage mind
`Get`: function which return current mind

## Then bind your components, and that's it!

Use the `useRemind` anywhere you want. This hook will decide when your component get rerendered.

`Selector`: causes the component to re-render only when the scope value changes

```jsx
function IdeasDisplay() {
  const { ideas } = useRemind((mind) => mind.ideas)

  return (
    <ul>
      {ideas.map((idea) => (
        <li>{idea}</li>
      ))}
    </ul>
  )
}

const ideas = [
  /* ... */
]

function Controls() {
  const { mind } = useRemind()
  return (
    <button
      onClick={() => {
        mind.sendAnIdea(random(ideas))
      }}>
      send an idea
    </button>
  )
}
```

## Async

Remind will generate you status for each async action.

```jsx
const { useRemind } = remind({ ideas: [] }, (set, get) => ({
  sendAnIdea: async (id) => {
    const idea = await myFetcher(id)

    set((mind) => ({ ideas: [...mind.ideas, idea] }))
  },
}))

const Component = () => {
  const [mind] = useRemind()
  const [sendAnIdea, status] = mind.sendAnIdea

  /* return */
}
```

## Immer

Remind supports immer 🔥

```jsx
const { useRemind } = remind({ ideas: [] }, (set, get) => ({
  sendAnIdea: async (id) => {
    const idea = await myFetcher(id)

    set((mind) => {
      mind.push(idea)
    })
  },
}))

const Component = () => {
  const [mind] = useRemind()
  const [sendAnIdea, status] = mind.sendAnIdea

  /* return */
}
```
