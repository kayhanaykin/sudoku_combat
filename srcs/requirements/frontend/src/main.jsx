import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // CSS dosyan burada çağırılıyor, tasarımı bu getirecek!
import App from './App.jsx'

createRoot(document.getElementById('root'))
.render(
  <StrictMode>
    <App />
  </StrictMode>,
)
