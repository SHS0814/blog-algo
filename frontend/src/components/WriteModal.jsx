import React, { useState } from 'react'
import { useWindow } from '../contexts/WindowContext.jsx'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

export default function WriteModal({ onClose }) {
  const { closeWindow } = useWindow()
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
        // 창 닫기
        onClose()
        // 홈페이지 새로고침
        window.location.reload()
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
    <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: 600, 
          marginBottom: '8px',
          color: 'var(--arch-text)',
          fontFamily: 'JetBrains Mono, monospace'
        }}>
          ✍️ 새 글 작성
        </h2>
        <p style={{ color: 'var(--arch-text-secondary)', fontSize: '14px' }}>
          마크다운 문법을 사용하여 알고리즘 문제를 정리해보세요
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
            disabled={loading}
            className="btn btn-primary"
            style={{ fontSize: '13px', padding: '6px 12px', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? '저장 중...' : '글 저장'}
          </button>
        </div>
      </form>
    </div>
  )
}
