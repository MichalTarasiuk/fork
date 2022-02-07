import remind from 'remind'

const { useRemind } = remind((set) => ({
  counter: (value = 0) => {
    if (value > 10) {
      return { next: false, value }
    }

    return { next: true, value }
  },
  setToInitial: () => set({ counter: 0 }),
  increase: () => set((prevState) => ({ counter: prevState.counter + 1 })),
}))

function App() {
  const [mind] = useRemind()
  return (
    <div>
      <p>counter {mind.counter}</p>
      <button onClick={mind.increase}>increase</button>
      <button onClick={mind.setToInitial}>reset</button>
    </div>
  )
}

export { App }
