import remind from 'remind'

const { useRemind } = remind((set) => ({
  counter: 0,
  setToInitial: () => set({ counter: 0 }),
  increase: () => set((prevMind) => ({ counter: prevMind.counter + 1 })),
}))

function App() {
  const { mind } = useRemind()

  return (
    <div>
      <p>counter {mind.counter}</p>
      <button onClick={mind.increase}>increase</button>
      <button onClick={mind.setToInitial}>reset</button>
    </div>
  )
}

export { App }
