import React, { useMemo } from 'react'
import SearchBar from '../components/SearchBar'

type Item = { id: string; title: string; author: string; imgId: string; excerpt: string }

const ITEMS: Item[] = [
  { id: '1', title: 'Modern UI Patterns', author: 'A. Author', imgId: '1507842217343-583bb7270b66', excerpt: 'A concise guide to modern UI patterns used in libraries and documentation.' },
  { id: '2', title: 'Design Systems Handbook', author: 'B. Writer', imgId: '1522202176988-66273c2fd55f', excerpt: 'Principles and practical steps to build and maintain a design system.' },
  { id: '3', title: 'Frontend Architecture', author: 'C. Engineer', imgId: '1503676260728-1c00da094a0b', excerpt: 'Patterns for scalable frontend architectures and component design.' }
]

function imageUrl(id: string, w = 800, h = 500) {
  return `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format&ixlib=rb-4.0.3&q=80`
}

export default function Catalog() {
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams('')
  const q = params.get('q')?.toLowerCase() ?? ''

  const filtered = useMemo(() => {
    if (!q) return ITEMS
    return ITEMS.filter(i => (i.title + ' ' + i.author + ' ' + i.excerpt).toLowerCase().includes(q))
  }, [q])

  return (
    <div className="container" style={{ paddingTop: 24 }}>
      <h1 style={{ marginBottom: 12 }}>Catalog</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 18 }}>Search and browse our library.</p>

      <div style={{ marginBottom: 20 }}>
        <SearchBar />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
        {filtered.map(item => (
          <article key={item.id} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
            <img src={imageUrl(item.imgId, 720, 360)} alt={`${item.title} cover`} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
            <div style={{ padding: 16 }}>
              <h2 style={{ margin: 0, fontSize: '1.05rem' }}>{item.title}</h2>
              <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 6 }}>By {item.author}</div>
              <p style={{ marginTop: 10, color: 'var(--color-text-muted)' }}>{item.excerpt}</p>
              <div style={{ marginTop: 12 }}>
                <a href="#" style={{ textDecoration: 'none', background: 'var(--color-primary)', color: '#fff', padding: '8px 12px', borderRadius: 8 }}>View</a>
              </div>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ marginTop: 24, color: 'var(--color-text-muted)' }}>No results found.</p>
      )}
    </div>
  )
}
