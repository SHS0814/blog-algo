import React, { createContext, useContext, useState, useCallback } from 'react'

const WindowContext = createContext()

export function WindowProvider({ children }) {
  const [windows, setWindows] = useState([])
  const [nextZIndex, setNextZIndex] = useState(1000)

  const openWindow = useCallback((windowData) => {
    const id = Date.now() + Math.random()
    const newWindow = {
      id,
      zIndex: nextZIndex,
      ...windowData
    }
    
    setWindows(prev => [...prev, newWindow])
    setNextZIndex(prev => prev + 1)
    return id
  }, [nextZIndex])

  const closeWindow = useCallback((id) => {
    setWindows(prev => prev.filter(window => window.id !== id))
  }, [])

  const minimizeWindow = useCallback((id, minimized) => {
    setWindows(prev => prev.map(window => 
      window.id === id ? { ...window, isMinimized: minimized } : window
    ))
  }, [])

  const maximizeWindow = useCallback((id, maximized) => {
    setWindows(prev => prev.map(window => 
      window.id === id ? { ...window, isMaximized: maximized } : window
    ))
  }, [])

  const bringToFront = useCallback((id) => {
    setWindows(prev => prev.map(window => 
      window.id === id 
        ? { ...window, zIndex: nextZIndex }
        : window
    ))
    setNextZIndex(prev => prev + 1)
  }, [nextZIndex])

  const updateWindow = useCallback((id, updates) => {
    setWindows(prev => prev.map(window => 
      window.id === id ? { ...window, ...updates } : window
    ))
  }, [])

  return (
    <WindowContext.Provider value={{
      windows,
      openWindow,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      bringToFront,
      updateWindow
    }}>
      {children}
    </WindowContext.Provider>
  )
}

export function useWindow() {
  const context = useContext(WindowContext)
  if (!context) {
    throw new Error('useWindow must be used within a WindowProvider')
  }
  return context
}

