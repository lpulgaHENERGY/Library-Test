import React, { useMemo } from 'react'
import SearchBar from '../components/SearchBar'
import CatalogCard from '../components/CatalogCard'

type Item = { id: string; title: string; author: string; imgId: string; excerpt: string }

const ITEMS: Item[] = [
  { id: '1', title: 'Modern UI Patterns', author: 'A. Author', imgId: '1507842217343-583bb7270b66', excerpt: 'A concise guide to modern UI patterns used in libraries and documentation.' },
  { id: '2', title: 'Design Systems Handbook', author: 'B. Writer', imgId: '1522202176988-66273c2fd55f', excerpt: 'Principles and practical steps to build and maintain a design system.' },
  { id: '3', title: 'Frontend Architecture', author: 'C. Engineer', imgId: '1503676260728-1c00da094a0b', excerpt: 'Patterns for scalable frontend architectures and component design.' }
]

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
          <CatalogCard key={item.id} item={item} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ marginTop: 24, color: 'var(--color-text-muted)' }}>No results found.</p>
      )}
    </div>
  )
}
