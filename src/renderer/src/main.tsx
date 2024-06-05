import './assets/main.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppWarpper } from './App'

ReactDOM.createRoot(document.getElementById('app')!).render(
    <React.StrictMode>
        <AppWarpper />
    </React.StrictMode>
)
