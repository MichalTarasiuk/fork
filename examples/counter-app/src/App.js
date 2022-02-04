import { remind } from 'remind'

const { useRemind } = remind((set) => ({
  counter: (value = 0) => {
    if (value > 10) {
      return { next: false, value }
    }

    return { next: true, value }
  },
  setToInitial: () => set({ counter: 0 }),
}))

function App() {
  const [mind, setMind] = useRemind()

  const increase = () => {
    setMind((prevState) => ({
      counter: prevState.counter + 1,
    }))
  }

  return (
    <div>
      <p>counter {mind.counter}</p>
      <button onClick={increase}>increase</button>
      <button onClick={mind.setToInitial}>reset</button>
    </div>
  )
}

export { App }
