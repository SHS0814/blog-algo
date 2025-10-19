import React, { useEffect, useMemo, useState } from 'react'
import { useWindow } from '../contexts/WindowContext.jsx'
import WriteModal from '../components/WriteModal.jsx'
import PostModal from '../components/PostModal.jsx'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

export default function HomePage() {
  const { openWindow, closeWindow } = useWindow()
  const [posts, setPosts] = useState([])
  const [tags, setTags] = useState([])
  const [difficulties, setDifficulties] = useState([])
  const [filters, setFilters] = useState({ tag: '', difficulty: '', q: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function bootstrap() {
      const [postRes, tagRes, diffRes] = await Promise.all([
        fetch(`${API_BASE}/api/posts`).then(r => r.json()),
        fetch(`${API_BASE}/api/tags`).then(r => r.json()),
        fetch(`${API_BASE}/api/difficulties`).then(r => r.json()),
      ])
      setPosts(postRes.posts)
      setTags(tagRes.tags)
      setDifficulties(diffRes.difficulties)
      setLoading(false)
    }
    bootstrap()
  }, [])

  const filtered = useMemo(() => {
    return posts.filter(p => {
      const byTag = filters.tag ? p.tags.includes(filters.tag) : true
      const byDiff = filters.difficulty ? p.difficulty === filters.difficulty : true
      const byQuery = filters.q ? (`${p.title} ${p.description}`).toLowerCase().includes(filters.q.toLowerCase()) : true
      return byTag && byDiff && byQuery
    })
  }, [posts, filters])

  const handleOpenWriteWindow = () => {
    const windowId = openWindow({
      title: '새 글 작성',
      content: <WriteModal onClose={() => closeWindow(windowId)} />,
      initialPosition: { x: 100, y: 100 },
      initialSize: { width: 800, height: 600 }
    })
  }

  const handleOpenPostWindow = (slug, title) => {
    const windowId = openWindow({
      title: `📄 ${title}`,
      content: <PostModal slug={slug} onClose={() => closeWindow(windowId)} />,
      initialPosition: { x: 120, y: 120 },
      initialSize: { width: 900, height: 700 }
    })
  }

  const handleOpenEditWindow = (slug, title) => {
    const windowId = openWindow({
      title: `✏️ 수정: ${title}`,
      content: <PostModal slug={slug} onClose={() => closeWindow(windowId)} />,
      initialPosition: { x: 140, y: 140 },
      initialSize: { width: 800, height: 600 }
    })
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <div className="loading"></div>
      <div style={{ marginTop: '12px', color: 'var(--arch-text-secondary)' }}>로딩 중…</div>
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 600, 
          marginBottom: '8px',
          color: 'var(--arch-text)',
          fontFamily: 'JetBrains Mono, monospace'
        }}>
          알고리즘 문제 모음
        </h1>
        <p style={{ color: 'var(--arch-text-secondary)', fontSize: '16px' }}>
          체계적으로 정리한 알고리즘 학습 기록
        </p>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--arch-text)' }}>태그</label>
            <select 
              className="select"
              value={filters.tag} 
              onChange={e => setFilters(f => ({ ...f, tag: e.target.value }))}
            >
              <option value=''>전체</option>
              {tags.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--arch-text)' }}>난이도</label>
            <select 
              className="select"
              value={filters.difficulty} 
              onChange={e => setFilters(f => ({ ...f, difficulty: e.target.value }))}
            >
              <option value=''>전체</option>
              {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--arch-text)' }}>검색</label>
            <input 
              className="input"
              placeholder='제목 또는 설명으로 검색' 
              value={filters.q} 
              onChange={e => setFilters(f => ({ ...f, q: e.target.value }))} 
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ color: 'var(--arch-text-secondary)', fontSize: '16px' }}>
              📝 아직 작성된 글이 없습니다
            </div>
          </div>
        ) : (
          filtered.map(p => (
            <div key={p.slug} className="card" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              transition: 'all 0.2s ease'
            }}>
              <div style={{ flex: 1 }}>
                <button 
                  onClick={() => handleOpenPostWindow(p.slug, p.title)}
                  style={{ 
                    fontWeight: 600, 
                    color: 'var(--arch-text)', 
                    textDecoration: 'none',
                    fontSize: '18px',
                    display: 'block',
                    marginBottom: '8px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    padding: 0
                  }}
                >
                  {p.title}
                </button>
                <div style={{ 
                  color: 'var(--arch-text-secondary)', 
                  fontSize: '14px', 
                  marginBottom: '12px',
                  lineHeight: '1.5'
                }}>
                  {p.description}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {p.tags.map(t => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                  {p.difficulty && (
                    <span className="tag tag-difficulty">
                      {p.difficulty}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginLeft: '16px', flexShrink: 0 }}>
                <button 
                  onClick={() => handleOpenEditWindow(p.slug, p.title)}
                  className="btn"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  ✏️ 수정
                </button>
                <button
                  onClick={async () => {
                    if (confirm('정말로 이 글을 삭제하시겠습니까?')) {
                      try {
                        const response = await fetch(`${API_BASE}/api/posts/${p.slug}`, { method: 'DELETE' })
                        if (response.ok) {
                          setPosts(prev => prev.filter(post => post.slug !== p.slug))
                        } else {
                          alert('삭제에 실패했습니다')
                        }
                      } catch (err) {
                        alert('네트워크 오류가 발생했습니다')
                      }
                    }
                  }}
                  className="btn btn-danger"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  🗑️ 삭제
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}


