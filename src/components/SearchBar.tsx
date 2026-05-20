import { useState } from 'react';

export default function SearchBar({ onSearch }: { onSearch?: (q: string) => void }) {
  const [q, setQ] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) return;
    if (onSearch) onSearch(trimmed);
    // For now, navigate to /catalog with query param
    try {
      const url = new URL(window.location.href);
      url.pathname = '/catalog';
      url.searchParams.set('q', trimmed);
      window.history.pushState({}, '', url.toString());
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch {}
  }

  return (
    <form onSubmit={submit} role="search" aria-label="Search the catalog" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <label htmlFor="site-search" style={{ position: 'absolute', left: -9999 }}>
        Search the catalog
      </label>
      <input
        id="site-search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search the library..."
        aria-label="Search the library"
        style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-border)', minWidth: 240 }}
      />
      <button type="submit" style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 8 }}>
        Search
      </button>
    </form>
  );
}
