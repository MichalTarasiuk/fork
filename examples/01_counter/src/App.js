import remest from 'remest'

export const { RemestProvider, useRemest } = remest({ counter: 0 }, (set) => ({
  setToInitial: () => set({ counter: 0 }),
  increase: () => set((state) => ({ counter: state.counter + 1 })),
}))

function App() {
  const { state } = useRemest()

  return (
    <div>
      <p>counter {state.counter}</p>
      <button onClick={state.increase}>increase</button>
      <button onClick={state.setToInitial}>reset</button>
    </div>
  )
}

export { App }
