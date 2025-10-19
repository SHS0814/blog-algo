import React from 'react'
import { createRoot } from 'react-dom/client'
import { WindowProvider } from './contexts/WindowContext.jsx'
import RootLayout from './routes/RootLayout.jsx'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WindowProvider>
      <RootLayout />
    </WindowProvider>
  </React.StrictMode>
)


