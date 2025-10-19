import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

export default function EditPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
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
        } else {
          setError('글을 찾을 수 없습니다')
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
        navigate(`/post/${result.slug}`)
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

  const handleDelete = async () => {
    if (!confirm('정말로 이 글을 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`${API_BASE}/api/posts/${slug}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        navigate('/')
      } else {
        const result = await response.json()
        setError(result.error || '글 삭제에 실패했습니다')
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다')
    }
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <div className="loading"></div>
      <div style={{ marginTop: '12px', color: 'var(--arch-text-secondary)' }}>로딩 중…</div>
    </div>
  )

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 600, 
          marginBottom: '8px',
          color: 'var(--arch-text)',
          fontFamily: 'JetBrains Mono, monospace'
        }}>
          ✏️ 글 수정
        </h1>
        <p style={{ color: 'var(--arch-text-secondary)', fontSize: '16px' }}>
          기존 글을 수정하거나 삭제할 수 있습니다
        </p>
      </div>
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--arch-text)' }}>제목 *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="input"
              placeholder="글 제목을 입력하세요"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--arch-text)' }}>설명</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input"
              placeholder="글에 대한 간단한 설명"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--arch-text)' }}>태그</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="input"
                placeholder="태그1, 태그2, 태그3"
              />
              <small style={{ color: 'var(--arch-text-muted)', fontSize: '14px', marginTop: '4px', display: 'block' }}>쉼표로 구분하여 입력하세요</small>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--arch-text)' }}>난이도</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="select"
              >
                <option value="">난이도 선택</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--arch-text)' }}>발행일</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="input"
              style={{ maxWidth: '200px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--arch-text)' }}>내용 *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={20}
              className="textarea"
              placeholder="마크다운으로 작성하세요..."
            />
            <small style={{ color: 'var(--arch-text-muted)', fontSize: '14px', marginTop: '4px', display: 'block' }}>
              마크다운 문법을 사용할 수 있습니다. 예: **굵게**, *기울임*, `코드`, # 제목
            </small>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', marginTop: '8px' }}>
            <button
              type="button"
              onClick={handleDelete}
              className="btn btn-danger"
            >
              🗑️ 글 삭제
            </button>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => navigate(`/post/${slug}`)}
                className="btn"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
                style={{ opacity: saving ? 0.6 : 1 }}
              >
                {saving ? '저장 중...' : '수정 저장'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
