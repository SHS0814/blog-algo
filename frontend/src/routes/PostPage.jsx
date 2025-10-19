import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

export default function PostPage() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPost() {
      const res = await fetch(`${API_BASE}/api/posts/${slug}`)
      if (res.ok) {
        const data = await res.json()
        setPost(data)
      }
      setLoading(false)
    }
    fetchPost()
  }, [slug])

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <div className="loading"></div>
      <div style={{ marginTop: '12px', color: 'var(--arch-text-secondary)' }}>로딩 중…</div>
    </div>
  )
  
  if (!post) return (
    <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
      <div style={{ color: 'var(--arch-text-secondary)', fontSize: '16px', marginBottom: '16px' }}>
        📄 글을 찾을 수 없습니다
      </div>
      <Link to='/' className="btn btn-primary">목록으로 돌아가기</Link>
    </div>
  )

  return (
    <article>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '32px', 
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
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
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
      </div>
      
      <div className="terminal" style={{ 
        background: 'var(--arch-bg-secondary)',
        border: '1px solid var(--arch-border)',
        borderRadius: '8px',
        padding: '24px',
        lineHeight: '1.6'
      }}>
        {/* 서버에서 HTML을 생성해 내려줬으므로 안전하게 표시한다고 가정 */}
        <div dangerouslySetInnerHTML={{ __html: post.html }} />
      </div>
    </article>
  )
}


