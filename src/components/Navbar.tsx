import React from 'react';

export default function Navbar() {
  return (
    <header style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
        <a href="/" style={{ fontWeight: 700, color: 'var(--color-primary)', textDecoration: 'none', fontSize: '1.1rem' }}>My Lib</a>
        <nav>
          <a href="/catalog" style={{ marginRight: 16, color: 'var(--color-text-muted)', textDecoration: 'none' }}>Catalog</a>
          <a href="/account" style={{ marginRight: 16, color: 'var(--color-text-muted)', textDecoration: 'none' }}>Account</a>
          <a href="/contact" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Contact</a>
        </nav>
      </div>
    </header>
  );
}
