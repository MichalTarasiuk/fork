import React from 'react'

import { Form, Notes } from 'components'

import { useRemind } from './store/store'
import './app.css'

const App = () => {
  const [mind] = useRemind()
  const [unlock, status] = mind.unlock

  return (
    <main className="main-content">
      <section className="form-section">
        <Form />
      </section>
      <section className="notes-section">
        {mind.block ? (
          <button onClick={unlock}>
            {status === 'idle' ? 'unlock' : status}
          </button>
        ) : (
          <Notes />
        )}
      </section>
    </main>
  )
}

export { App }
