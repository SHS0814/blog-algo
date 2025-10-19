import React, { useEffect, useState } from 'react'
import { useWindow } from '../contexts/WindowContext.jsx'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

// EditModal 컴포넌트
function EditModal({ slug, onClose }) {
  const { closeWindow } = useWindow()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    tags: '',
    difficulty: '',
    date: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`${API_BASE}/api/posts/${slug}`)
        if (response.ok) {
          const post = await response.json()
          setFormData({
            title: post.title || '',
            description: post.description || '',
            content: post.content || '',
            tags: post.tags ? post.tags.join(', ') : '',
            difficulty: post.difficulty || '',
            date: post.date || new Date().toISOString().split('T')[0]
          })
        }
      } catch (err) {
        setError('글을 불러오는데 실패했습니다')
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [slug])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t)
      
      const response = await fetch(`${API_BASE}/api/posts/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: tagsArray,
          difficulty: formData.difficulty || null
        })
      })

      const result = await response.json()

      if (response.ok) {
        // 창 닫기
        onClose()
        window.location.reload()
      } else {
        setError(result.error || '글 수정에 실패했습니다')
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <div className="loading"></div>
      <div style={{ marginTop: '12px', color: 'var(--arch-text-secondary)' }}>로딩 중…</div>
    </div>
  )

  return (
    <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: 600, 
          marginBottom: '8px',
          color: 'var(--arch-text)',
          fontFamily: 'JetBrains Mono, monospace'
        }}>
          ✏️ 글 수정
        </h2>
        <p style={{ color: 'var(--arch-text-secondary)', fontSize: '14px' }}>
          기존 글을 수정하거나 삭제할 수 있습니다
        </p>
      </div>
      
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: 'var(--arch-text)', fontSize: '14px' }}>제목 *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="input"
            placeholder="글 제목을 입력하세요"
            style={{ fontSize: '14px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: 'var(--arch-text)', fontSize: '14px' }}>설명</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input"
            placeholder="글에 대한 간단한 설명"
            style={{ fontSize: '14px' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: 'var(--arch-text)', fontSize: '14px' }}>태그</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="input"
              placeholder="태그1, 태그2"
              style={{ fontSize: '14px' }}
            />
            <small style={{ color: 'var(--arch-text-muted)', fontSize: '12px', marginTop: '2px', display: 'block' }}>쉼표로 구분</small>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: 'var(--arch-text)', fontSize: '14px' }}>난이도</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="select"
              style={{ fontSize: '14px' }}
            >
              <option value="">난이도 선택</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: 'var(--arch-text)', fontSize: '14px' }}>발행일</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="input"
            style={{ maxWidth: '150px', fontSize: '14px' }}
          />
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: 'var(--arch-text)', fontSize: '14px' }}>내용 *</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            className="textarea"
            placeholder="마크다운으로 작성하세요..."
            style={{ flex: 1, fontSize: '14px', minHeight: '200px' }}
          />
          <small style={{ color: 'var(--arch-text-muted)', fontSize: '12px', marginTop: '4px' }}>
            마크다운 문법: **굵게**, *기울임*, `코드`, # 제목
          </small>
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn"
            style={{ fontSize: '13px', padding: '6px 12px' }}
          >
            취소
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            style={{ fontSize: '13px', padding: '6px 12px', opacity: saving ? 0.6 : 1 }}
          >
            {saving ? '저장 중...' : '수정 저장'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function PostModal({ slug, onClose }) {
  const { openWindow, closeWindow } = useWindow()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`${API_BASE}/api/posts/${slug}`)
        if (response.ok) {
          const data = await response.json()
          setPost(data)
        }
      } catch (err) {
        console.error('글을 불러오는데 실패했습니다')
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [slug])

  const handleEdit = () => {
    // 수정 창 열기
    const windowId = openWindow({
      title: `글 수정: ${post?.title || ''}`,
      content: <EditModal slug={slug} onClose={() => closeWindow(windowId)} />,
      initialPosition: { x: 150, y: 150 },
      initialSize: { width: 800, height: 600 }
    })
  }

  const handleDelete = async () => {
    if (confirm('정말로 이 글을 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`${API_BASE}/api/posts/${slug}`, { method: 'DELETE' })
        if (response.ok) {
          onClose()
          window.location.reload()
        } else {
          alert('삭제에 실패했습니다')
        }
      } catch (err) {
        alert('네트워크 오류가 발생했습니다')
      }
    }
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <div className="loading"></div>
      <div style={{ marginTop: '12px', color: 'var(--arch-text-secondary)' }}>로딩 중…</div>
    </div>
  )

  if (!post) return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <div style={{ color: 'var(--arch-text-secondary)', fontSize: '16px', marginBottom: '16px' }}>
        📄 글을 찾을 수 없습니다
      </div>
      <button onClick={onClose} className="btn btn-primary">닫기</button>
    </div>
  )

  return (
    <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 600, 
          marginBottom: '12px',
          color: 'var(--arch-text)',
          fontFamily: 'JetBrains Mono, monospace',
          lineHeight: '1.3'
        }}>
          {post.title}
        </h1>
        <div style={{ 
          color: 'var(--arch-text-secondary)', 
          fontSize: '16px',
          marginBottom: '16px',
          lineHeight: '1.5'
        }}>
          {post.description}
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {post.tags.map(t => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
          {post.difficulty && (
            <span className="tag tag-difficulty">
              {post.difficulty}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button onClick={handleEdit} className="btn" style={{ fontSize: '13px', padding: '6px 12px' }}>
            ✏️ 수정
          </button>
          <button onClick={handleDelete} className="btn btn-danger" style={{ fontSize: '13px', padding: '6px 12px' }}>
            🗑️ 삭제
          </button>
        </div>
      </div>
      
      <div className="terminal" style={{ 
        background: 'var(--arch-bg-secondary)',
        border: '1px solid var(--arch-border)',
        borderRadius: '8px',
        padding: '20px',
        lineHeight: '1.6',
        flex: 1,
        overflow: 'auto'
      }}>
        <div dangerouslySetInnerHTML={{ __html: post.html }} />
      </div>
    </div>
  )
}