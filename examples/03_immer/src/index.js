import remind from 'react-remind'
import { render } from 'react-dom'

const { useRemind } = remind({
  counter: 0,
})

const App = () => {
  const { mind, setMind } = useRemind()

  const increase = () => {
    setMind((mind) => {
      mind.counter++
    })
  }

  return (
    <div>
      <h1>Counter</h1>
      <p>counter: {mind.counter}</p>
      <button onClick={increase}>increase</button>
    </div>
  )
}

render(<App />, document.getElementById('app'))
