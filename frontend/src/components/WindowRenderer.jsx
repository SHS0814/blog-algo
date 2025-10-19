import React from 'react'
import ArchWindow from './ArchWindow'
import { useWindow } from '../contexts/WindowContext'

export default function WindowRenderer() {
  const { windows, closeWindow, minimizeWindow, maximizeWindow, bringToFront } = useWindow()

  return (
    <>
      {windows.map((window) => (
        <ArchWindow
          key={window.id}
          id={window.id}
          title={window.title}
          onClose={() => closeWindow(window.id)}
          onMinimize={(minimized) => minimizeWindow(window.id, minimized)}
          onMaximize={(maximized) => maximizeWindow(window.id, maximized)}
          isMinimized={window.isMinimized}
          isMaximized={window.isMaximized}
          initialPosition={window.initialPosition}
          initialSize={window.initialSize}
          zIndex={window.zIndex}
        >
          <div 
            onClick={() => bringToFront(window.id)}
            style={{ height: '100%', overflow: 'auto' }}
          >
            {window.content}
          </div>
        </ArchWindow>
      ))}
    </>
  )
}
