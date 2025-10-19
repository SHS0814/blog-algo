import React from 'react'
import WindowRenderer from '../components/WindowRenderer.jsx'
import { useWindow } from '../contexts/WindowContext.jsx'
import WriteModal from '../components/WriteModal.jsx'
import HomePage from './HomePage.jsx'

export default function RootLayout() {
  const { openWindow, closeWindow } = useWindow()

  const handleOpenWriteWindow = () => {
    const windowId = openWindow({
      title: '새 글 작성',
      content: <WriteModal onClose={() => closeWindow(windowId)} />,
      initialPosition: { x: 100, y: 100 },
      initialSize: { width: 800, height: 600 }
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--arch-bg)' }}>
      <header style={{ 
        padding: '20px 24px', 
        borderBottom: '1px solid var(--arch-border)', 
        background: 'var(--arch-bg-secondary)',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ 
          color: 'var(--arch-text)', 
          fontWeight: 600,
          fontSize: '18px',
          fontFamily: 'JetBrains Mono, monospace'
        }}>
          <span style={{ color: 'var(--arch-accent)' }}>λ</span> 알고리즘 블로그
        </div>
        <button 
          onClick={handleOpenWriteWindow}
          className="btn btn-primary" 
          style={{ fontSize: '14px' }}
        >
          ✍️ 글쓰기
        </button>
      </header>
      <main style={{ 
        maxWidth: 1000, 
        margin: '0 auto', 
        padding: '32px 20px',
        minHeight: 'calc(100vh - 80px)'
      }}>
        <HomePage />
      </main>
      
      {/* 아치 OS 스타일 창 렌더러 */}
      <WindowRenderer />
    </div>
  )
}


