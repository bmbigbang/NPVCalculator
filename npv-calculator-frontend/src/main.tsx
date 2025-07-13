import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import MainComponent from './MainComponent.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MainComponent />
  </StrictMode>,
)
