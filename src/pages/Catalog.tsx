import { useMemo } from 'react'
import SearchBar from '../components/SearchBar'
import CatalogCard from '../components/CatalogCard'
import { useLibraryItems } from '../shared/hooks/useLibraryItems'

export default function Catalog() {
  const { items, loading, error } = useLibraryItems()

  // Preserve the existing URL-param search pattern:
  // SearchBar writes ?q=… via history.pushState + popstate, React Router
  // re-renders this route, and we re-read window.location.search here.
  const params = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams('')
  const q = params.get('q')?.toLowerCase() ?? ''

  const filtered = useMemo(() => {
    if (!q) return items
    return items.filter(i =>
      (i.title + ' ' + i.author + ' ' + i.excerpt).toLowerCase().includes(q)
    )
  }, [items, q])

  return (
    <div className="container" style={{ paddingTop: 24 }}>
      <h1 style={{ marginBottom: 12 }}>Catalog</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 18 }}>Search and browse our library.</p>

      <div style={{ marginBottom: 20 }}>
        <SearchBar />
      </div>

      {/* Loading state */}
      {loading && (
        <p style={{ color: 'var(--color-text-muted)' }}>Loading…</p>
      )}

      {/* Error state */}
      {error && (
        <div
          role="alert"
          style={{
            marginTop: 16,
            padding: '12px 16px',
            borderRadius: 8,
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text-muted)',
          }}
        >
          ⚠️ Unable to load library items: {error}
        </div>
      )}

      {/* Results grid — only shown once loading is complete and there is no error */}
      {!loading && !error && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
            {filtered.map(item => (
              <CatalogCard key={item.id} item={item} />
            ))}
          </div>

          {filtered.length === 0 && (
            <p style={{ marginTop: 24, color: 'var(--color-text-muted)' }}>No results found.</p>
          )}
        </>
      )}
    </div>
  )
}
