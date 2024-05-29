import './assets/main.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { ConfigProvider } from 'antd'

ReactDOM.createRoot(document.getElementById('app')!).render(
    <React.StrictMode>
        <ConfigProvider componentSize="small">
            <App />
        </ConfigProvider>
    </React.StrictMode>
)
