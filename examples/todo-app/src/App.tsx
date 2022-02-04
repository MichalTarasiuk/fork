import React from 'react'

import { Form } from 'components'

import { useRemind } from 'store'
import './app.css'

function App() {
  const [mind] = useRemind()

  return (
    <main className="main-content">
      <section className="form-section">
        <Form />
      </section>
      <section className="list-section">
        <ul className="list">
          {mind.notes.map(({ title, content, id }) => (
            <li className="list-element" key={id}>
              <p>
                {title} - {content}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export { App }
