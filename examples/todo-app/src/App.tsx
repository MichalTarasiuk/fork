import React from 'react'

import { useRemind } from 'store'
import { Form, Notes } from 'components'

import './app.css'

const App = () => {
  const { mind } = useRemind()
  const [unlock, status] = mind.unlock

  return (
    <main className="main-content">
      <section className="form-section">
        <Form />
      </section>
      <section className="notes-section">
        {mind.block ? (
          <>
            <p>{status}</p>
            <button onClick={unlock}>unlock</button>
          </>
        ) : (
          <Notes />
        )}
      </section>
    </main>
  )
}

export { App }
