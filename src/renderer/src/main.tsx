import './assets/main.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { ConfigProvider, theme } from 'antd'

ReactDOM.createRoot(document.getElementById('app')!).render(
    <React.StrictMode>
        <ConfigProvider
            theme={{
                token: {
                    // borderRadius: 3,
                    motion: false
                },
                algorithm: [
                    // theme.compactAlgorithm,
                    theme.darkAlgorithm
                ]
            }}
            componentSize="small"
        >
            <App />
        </ConfigProvider>
    </React.StrictMode>
)
