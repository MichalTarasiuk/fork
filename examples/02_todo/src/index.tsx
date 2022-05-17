import React from 'react'
import ReactDOM from 'react-dom'

import { App } from './App'
import { HoorayProvider } from './store/store'
import './index.css'

ReactDOM.render(
  <React.StrictMode>
    <HoorayProvider>
      <App />
    </HoorayProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
