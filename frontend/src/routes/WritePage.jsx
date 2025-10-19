import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

export default function WritePage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    tags: '',
    difficulty: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t)
      
      const response = await fetch(`${API_BASE}/api/posts`, {
        method: 'POST',
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
        setError(result.error || '글 저장에 실패했습니다')
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

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
          ✍️ 새 글 작성
        </h1>
        <p style={{ color: 'var(--arch-text-secondary)', fontSize: '16px' }}>
          마크다운 문법을 사용하여 알고리즘 문제를 정리해보세요
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

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              {loading ? '저장 중...' : '글 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
