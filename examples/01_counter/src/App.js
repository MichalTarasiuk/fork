import hooray from 'hoor4y'

const { useHooray } = hooray({ counter: 0 }, (set) => ({
  setToInitial: () => set({ counter: 0 }),
  increase: () => set((state) => ({ counter: state.counter + 1 })),
}))

function App() {
  const { state } = useHooray()

  return (
    <div>
      <p>counter {state.counter}</p>
      <button onClick={state.increase}>increase</button>
      <button onClick={state.setToInitial}>reset</button>
    </div>
  )
}

export { App }
