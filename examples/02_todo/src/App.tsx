import React from 'react'

import { Form, NotesList } from 'components'

import { useFork } from './store/store'
import './app.css'

const App = () => {
  const { state } = useFork()

  return (
    <main className="main-content">
      <section className="form-section">
        <Form />
      </section>
      <section className="notes-section">
        {state.block ? (
          <button onClick={state.unlock}>unlock</button>
        ) : (
          <NotesList />
        )}
      </section>
    </main>
  )
}

export { App }
