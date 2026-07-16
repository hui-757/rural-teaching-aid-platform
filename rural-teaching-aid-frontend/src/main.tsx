import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { AudioProvider } from './hooks/AudioContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AudioProvider>
      <App />
    </AudioProvider>
  </StrictMode>,
)
