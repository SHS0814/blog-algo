import React, { useState, useRef, useEffect } from 'react'

export default function ArchWindow({ 
  id,
  title, 
  children, 
  onClose, 
  onMinimize, 
  onMaximize, 
  isMinimized = false,
  isMaximized = false,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 800, height: 600 },
  zIndex = 1000
}) {
  const [position, setPosition] = useState(initialPosition)
  const [size, setSize] = useState(initialSize)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const windowRef = useRef(null)

  // 드래그 시작
  const handleMouseDown = (e) => {
    if (e.target.closest('.window-controls') || e.target.closest('.resize-handle')) return
    
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
    e.preventDefault()
  }

  // 리사이즈 시작
  const handleResizeMouseDown = (e) => {
    setIsResizing(true)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    })
    e.preventDefault()
    e.stopPropagation()
  }

  // 마우스 이동 처리
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: Math.max(0, e.clientY - dragStart.y) // 상단에서 벗어나지 않도록
        })
      }
      
      if (isResizing) {
        const newWidth = Math.max(400, resizeStart.width + (e.clientX - resizeStart.x))
        const newHeight = Math.max(300, resizeStart.height + (e.clientY - resizeStart.y))
        setSize({ width: newWidth, height: newHeight })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
    }

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isResizing, dragStart, resizeStart])

  // 더블클릭으로 최대화/복원
  const handleTitleDoubleClick = () => {
    if (isMaximized) {
      setSize(initialSize)
      setPosition(initialPosition)
      onMaximize?.(false)
    } else {
      setSize({ width: window.innerWidth - 40, height: window.innerHeight - 100 })
      setPosition({ x: 20, y: 20 })
      onMaximize?.(true)
    }
  }

  if (isMinimized) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          background: 'var(--arch-bg-secondary)',
          border: '1px solid var(--arch-border)',
          borderRadius: '6px',
          padding: '8px 16px',
          cursor: 'pointer',
          zIndex: zIndex,
          color: 'var(--arch-text)',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        }}
        onClick={() => onMinimize?.(false)}
      >
        📝 {title}
      </div>
    )
  }

  return (
    <div
      ref={windowRef}
      data-window-id={id}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        background: 'var(--arch-bg-secondary)',
        border: '1px solid var(--arch-border)',
        borderRadius: '8px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        zIndex: zIndex,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        userSelect: 'none'
      }}
    >
      {/* 창 헤더 */}
      <div
        style={{
          background: 'var(--arch-bg-tertiary)',
          borderBottom: '1px solid var(--arch-border)',
          padding: '8px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'move',
          userSelect: 'none'
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleTitleDoubleClick}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          color: 'var(--arch-text)',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          <span>📝</span>
          {title}
        </div>
        
        <div className="window-controls" style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => onMinimize?.(true)}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#fbbf24',
              border: 'none',
              cursor: 'pointer'
            }}
            title="최소화"
          />
          <button
            onClick={() => onMaximize?.(!isMaximized)}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#10b981',
              border: 'none',
              cursor: 'pointer'
            }}
            title={isMaximized ? "복원" : "최대화"}
          />
          <button
            onClick={onClose}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#ef4444',
              border: 'none',
              cursor: 'pointer'
            }}
            title="닫기"
          />
        </div>
      </div>

      {/* 창 내용 */}
      <div style={{ 
        flex: 1, 
        overflow: 'auto',
        background: 'var(--arch-bg-secondary)'
      }}>
        {children}
      </div>

      {/* 리사이즈 핸들 */}
      <div
        className="resize-handle"
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '20px',
          height: '20px',
          cursor: 'nw-resize',
          background: 'linear-gradient(-45deg, transparent 30%, var(--arch-border) 30%, var(--arch-border) 50%, transparent 50%)'
        }}
        onMouseDown={handleResizeMouseDown}
      />
    </div>
  )
}
