import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { applyAccent, readAccent } from './core/accent'
import './index.css'

// 在首帧之前落强调色，避免「先看到默认色再跳一下」
applyAccent(readAccent())

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
