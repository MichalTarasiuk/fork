# Remind 🧠

```bash
npm install react-remind # or yarn add react-remind
```

## Initializing State

The first argument is the initial state and the second is the actions that access functions such as set and get as described below

```jsx
import remind from 'react-remind'

const { useRemind } = remind({ ideas: [] }, (set) => ({
  sendAnIdea: (idea) => set((mind) => ({ ideas: [...mind.ideas, idea] })),
}))
```

## Then bind your components, and that's it!

Use the `useRemind` anywhere you want. This hook will decide when your component get rerendered.

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

const ideas = [/ * ... */]

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
