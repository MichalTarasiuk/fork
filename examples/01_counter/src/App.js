import remind from 'react-remind'

const { useRemind } = remind({ counter: 0 }, (set) => ({
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
