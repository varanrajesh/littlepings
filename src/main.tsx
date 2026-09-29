import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// StrictMode intentionally double-invokes effects in development which breaks
// module-level AudioContext and window keyboard listeners. Removed deliberately.
createRoot(document.getElementById('root')!).render(<App />)
