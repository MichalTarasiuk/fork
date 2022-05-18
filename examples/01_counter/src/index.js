import React from 'react'
import ReactDOM from 'react-dom'

import { App } from './App'
import { RemestProvider } from './App'

ReactDOM.render(
  <React.StrictMode>
    <RemestProvider>
      <App />
    </RemestProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
