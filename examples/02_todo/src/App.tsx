import React from 'react'

import { Form, NotesList } from 'components'

import { useRemest } from './store/store'
import './app.css'

const App = () => {
  const [state] = useRemest()
  const [unlock, status] = state.unlock

  return (
    <main className="main-content">
      <section className="form-section">
        <Form />
      </section>
      <section className="notes-section">
        {state.block ? (
          <button onClick={unlock}>
            {status === 'idle' ? 'unlock' : status}
          </button>
        ) : (
          <NotesList />
        )}
      </section>
    </main>
  )
}

export { App }
