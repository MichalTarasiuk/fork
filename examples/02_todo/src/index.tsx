import React from 'react'
import ReactDOM from 'react-dom'

import { App } from './App'
import { ForkProvider } from './store/store'
import './index.css'

ReactDOM.render(
  <React.StrictMode>
    <ForkProvider>
      <App />
    </ForkProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
