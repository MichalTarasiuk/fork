import React from 'react'
import ReactDOM from 'react-dom'

import { App } from './App'
import { RemestProvider } from './store/store'
import './index.css'

ReactDOM.render(
  <React.StrictMode>
    <RemestProvider>
      <App />
    </RemestProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
