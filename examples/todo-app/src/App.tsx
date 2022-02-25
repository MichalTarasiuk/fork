import React from 'react'

import { Form, Notes } from 'components'

import './app.css'

const App = () => (
  <main className="main-content">
    <section className="form-section">
      <Form />
    </section>
    <section className="notes-section">
      <Notes />
    </section>
  </main>
)

export { App }
